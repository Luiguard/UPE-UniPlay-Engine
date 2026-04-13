import { EntityID, AnchorState, ZoneID } from '@uniplay/core';
import { StateAnchor } from './StateAnchor.js';

export class RedisStateAnchor extends StateAnchor {
  private redisClient: any; // e.g. ioredis client
  private syncQueue: Set<EntityID> = new Set();
  
  constructor(redisClient: any) {
    super();
    this.redisClient = redisClient;

    // Periodically flush memory state to Redis cluster asynchronously
    // This allows Zero-Downtime Pod restarts in Kubernetes
    setInterval(() => this.flushToRedis(), 500);
  }

  // Override to mark entity as dirty
  public write(entityId: EntityID, state: AnchorState): boolean {
    const success = super.write(entityId, state);
    if (success) {
      this.syncQueue.add(entityId);
    }
    return success;
  }

  private async flushToRedis() {
    if (this.syncQueue.size === 0) return;
    
    // In production, pipeline these sets to RedisJSON
    const pipeline = this.redisClient.pipeline();
    
    for (const entityId of this.syncQueue) {
      const state = this.read(entityId);
      if (state) {
        pipeline.hset(`uniplay:zone:${state.zoneId}`, entityId, JSON.stringify(state));
      }
    }
    
    await pipeline.exec();
    this.syncQueue.clear();
  }

  // When a Pod spins up, it pulls total state from Redis instantly
  public async loadFromRedis(zoneId: ZoneID) {
     const data = await this.redisClient.hgetall(`uniplay:zone:${zoneId}`);
     for (const [entityId, stateStr] of Object.entries(data)) {
         super.write(entityId, JSON.parse(stateStr as string));
     }
  }
}

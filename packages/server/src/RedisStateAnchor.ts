import { EntityID, AnchorState, ZoneID } from '@uniplay/core';
import { StateAnchor } from './StateAnchor.js';

/**
 * RedisStateAnchor — High-Availability State Persistence.
 * 
 * Extends the in-memory StateAnchor with async background sync to a Redis-compatible store.
 * Accepts any client that implements the minimal interface below (compatible with ioredis, redis, etc.)
 */
export interface RedisLikeClient {
  hset(key: string, field: string, value: string): Promise<number>;
  hgetall(key: string): Promise<Record<string, string>>;
  // Pipeline support (optional optimization)
  pipeline?(): {
    hset(key: string, field: string, value: string): any;
    exec(): Promise<any>;
  };
}

export class RedisStateAnchor extends StateAnchor {
  private redisClient: RedisLikeClient;
  private syncQueue: Set<EntityID> = new Set();
  private flushTimer: ReturnType<typeof setInterval>;

  constructor(redisClient: RedisLikeClient, flushIntervalMs: number = 500) {
    super();
    this.redisClient = redisClient;

    // Periodically flush dirty state to Redis asynchronously
    this.flushTimer = setInterval(() => {
      this.flushToRedis().catch(err => {
        console.error('[RedisStateAnchor] Flush failed:', err.message);
      });
    }, flushIntervalMs);
  }

  public write(entityId: EntityID, state: AnchorState): boolean {
    const success = super.write(entityId, state);
    if (success) {
      this.syncQueue.add(entityId);
    }
    return success;
  }

  private async flushToRedis(): Promise<void> {
    if (this.syncQueue.size === 0) return;

    const entitiesToSync = Array.from(this.syncQueue);
    this.syncQueue.clear();

    // Use pipeline if available (ioredis), otherwise individual calls
    if (this.redisClient.pipeline) {
      const pipe = this.redisClient.pipeline();
      for (const entityId of entitiesToSync) {
        const state = this.read(entityId);
        if (state) {
          pipe.hset(`uniplay:zone:${state.zoneId}`, entityId, JSON.stringify(state));
        }
      }
      await pipe.exec();
    } else {
      // Fallback: individual calls (works with any Redis client)
      const promises: Promise<any>[] = [];
      for (const entityId of entitiesToSync) {
        const state = this.read(entityId);
        if (state) {
          promises.push(
            this.redisClient.hset(`uniplay:zone:${state.zoneId}`, entityId, JSON.stringify(state))
          );
        }
      }
      await Promise.all(promises);
    }
  }

  /**
   * On startup / Pod recovery: pull all state from Redis for a given zone.
   */
  public async loadFromRedis(zoneId: ZoneID): Promise<number> {
    const data = await this.redisClient.hgetall(`uniplay:zone:${zoneId}`);
    let count = 0;
    for (const [entityId, stateStr] of Object.entries(data)) {
      try {
        const parsed = JSON.parse(stateStr) as AnchorState;
        super.write(entityId, parsed);
        count++;
      } catch (e) {
        console.warn(`[RedisStateAnchor] Failed to parse state for ${entityId}`);
      }
    }
    return count;
  }

  public stopSync(): void {
    clearInterval(this.flushTimer);
  }
}

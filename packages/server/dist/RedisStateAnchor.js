import { StateAnchor } from './StateAnchor.js';
export class RedisStateAnchor extends StateAnchor {
    redisClient;
    syncQueue = new Set();
    flushTimer;
    constructor(redisClient, flushIntervalMs = 500) {
        super();
        this.redisClient = redisClient;
        // Periodically flush dirty state to Redis asynchronously
        this.flushTimer = setInterval(() => {
            this.flushToRedis().catch(err => {
                console.error('[RedisStateAnchor] Flush failed:', err.message);
            });
        }, flushIntervalMs);
    }
    write(entityId, state) {
        const success = super.write(entityId, state);
        if (success) {
            this.syncQueue.add(entityId);
        }
        return success;
    }
    async flushToRedis() {
        if (this.syncQueue.size === 0)
            return;
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
        }
        else {
            // Fallback: individual calls (works with any Redis client)
            const promises = [];
            for (const entityId of entitiesToSync) {
                const state = this.read(entityId);
                if (state) {
                    promises.push(this.redisClient.hset(`uniplay:zone:${state.zoneId}`, entityId, JSON.stringify(state)));
                }
            }
            await Promise.all(promises);
        }
    }
    /**
     * On startup / Pod recovery: pull all state from Redis for a given zone.
     */
    async loadFromRedis(zoneId) {
        const data = await this.redisClient.hgetall(`uniplay:zone:${zoneId}`);
        let count = 0;
        for (const [entityId, stateStr] of Object.entries(data)) {
            try {
                const parsed = JSON.parse(stateStr);
                super.write(entityId, parsed);
                count++;
            }
            catch (e) {
                console.warn(`[RedisStateAnchor] Failed to parse state for ${entityId}`);
            }
        }
        return count;
    }
    stopSync() {
        clearInterval(this.flushTimer);
    }
}
//# sourceMappingURL=RedisStateAnchor.js.map
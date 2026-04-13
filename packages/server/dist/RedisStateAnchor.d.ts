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
    pipeline?(): {
        hset(key: string, field: string, value: string): any;
        exec(): Promise<any>;
    };
}
export declare class RedisStateAnchor extends StateAnchor {
    private redisClient;
    private syncQueue;
    private flushTimer;
    constructor(redisClient: RedisLikeClient, flushIntervalMs?: number);
    write(entityId: EntityID, state: AnchorState): boolean;
    private flushToRedis;
    /**
     * On startup / Pod recovery: pull all state from Redis for a given zone.
     */
    loadFromRedis(zoneId: ZoneID): Promise<number>;
    stopSync(): void;
}
//# sourceMappingURL=RedisStateAnchor.d.ts.map
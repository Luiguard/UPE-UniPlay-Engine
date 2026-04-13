export declare class TickSync {
    private expectedServerTick;
    private localTick;
    private drift;
    private maxLeadTicks;
    private intervalMs;
    constructor(tickRate?: number, maxLeadTicks?: number);
    onHeartbeat(serverTick: number, serverTime: number, rtt: number): void;
    shouldThrottle(): boolean;
    advanceTick(): void;
    getNextDelay(): number;
    getCurrentTick(): number;
    setLocalTick(tick: number): void;
}
//# sourceMappingURL=TickSync.d.ts.map
export declare class TickController {
    private tickRate;
    private intervalMs;
    private currentTick;
    private startTime;
    private running;
    private tickTimer;
    private onTickCallback;
    constructor(tickRate?: number);
    start(): void;
    stop(): void;
    onTick(callback: (tick: number, deltaTime: number) => void): void;
    getCurrentTick(): number;
    getTickDelta(): number;
}
//# sourceMappingURL=TickController.d.ts.map
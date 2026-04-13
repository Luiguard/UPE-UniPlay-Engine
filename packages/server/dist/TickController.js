export class TickController {
    tickRate;
    intervalMs;
    currentTick = 0;
    startTime = 0;
    running = false;
    tickTimer = null;
    onTickCallback = null;
    constructor(tickRate = 60) {
        this.tickRate = tickRate;
        this.intervalMs = 1000 / tickRate;
    }
    start() {
        if (this.running)
            return;
        this.running = true;
        this.currentTick = 0;
        this.startTime = Date.now();
        // Instead of setInterval which can drift, recursively schedule with timeout to compensate drift
        const loop = () => {
            if (!this.running)
                return;
            const now = Date.now();
            const expectedTick = Math.floor((now - this.startTime) / this.intervalMs);
            // Catch up if falling behind (limited to avoid death spiral)
            const ticksToProcess = Math.min(expectedTick - this.currentTick, 10);
            for (let i = 0; i < ticksToProcess; i++) {
                this.currentTick++;
                if (this.onTickCallback) {
                    this.onTickCallback(this.currentTick, this.intervalMs / 1000);
                }
            }
            // Schedule next tick
            const nextTickTime = this.startTime + (this.currentTick + 1) * this.intervalMs;
            const delay = Math.max(0, nextTickTime - Date.now());
            this.tickTimer = setTimeout(loop, delay);
        };
        loop();
    }
    stop() {
        this.running = false;
        if (this.tickTimer)
            clearTimeout(this.tickTimer);
    }
    onTick(callback) {
        this.onTickCallback = callback;
    }
    getCurrentTick() {
        return this.currentTick;
    }
    getTickDelta() {
        return this.intervalMs;
    }
}
//# sourceMappingURL=TickController.js.map
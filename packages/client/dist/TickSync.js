export class TickSync {
    expectedServerTick = 0;
    localTick = 0;
    drift = 0;
    maxLeadTicks;
    intervalMs;
    constructor(tickRate = 60, maxLeadTicks = 2) {
        this.intervalMs = 1000 / tickRate;
        this.maxLeadTicks = maxLeadTicks;
    }
    // Called on receiving heartbeat
    onHeartbeat(serverTick, serverTime, rtt) {
        // Add ping/2 to estimate current server tick
        const estimatedServerTick = serverTick + Math.ceil((rtt / 2) / this.intervalMs);
        this.expectedServerTick = estimatedServerTick;
        // Calculate drift (difference between local tick and expected)
        this.drift = this.localTick - this.expectedServerTick;
    }
    // Returns true if the client is too far ahead and should soft-sync (throttle)
    shouldThrottle() {
        // Soft-Sync statt Hard-Sync (Mechanism #2)
        return this.drift > this.maxLeadTicks;
    }
    // Advance local tick, taking soft-sync into account
    advanceTick() {
        if (!this.shouldThrottle()) {
            this.localTick++;
        }
        else {
            // Throttle (wait to let server catch up)
            // Mechanism #2: Tick drosseln
            this.drift--;
        }
    }
    // Provide exactly how long the next loop iteration should wait
    getNextDelay() {
        // Mechanism #3: Heartbeat-Drift-Korrektur (0.1–0.5 ms)
        if (this.drift > 0) {
            return this.intervalMs + 0.5; // slow down slightly
        }
        else if (this.drift < 0) {
            return this.intervalMs - 0.5; // speed up slightly
        }
        return this.intervalMs;
    }
    getCurrentTick() {
        return this.localTick;
    }
    setLocalTick(tick) {
        this.localTick = tick;
    }
}
//# sourceMappingURL=TickSync.js.map
export class StateAnchor {
    entities = new Map();
    // History for Rollback/Reconciliation matching
    history = new Map();
    maxHistory = 60; // 1 second at 60 tickrate
    // Callback to validate before writing (Mechanism #16: Event-Ordering / Validation)
    onBeforeWrite = null;
    write(entityId, state) {
        const current = this.entities.get(entityId);
        if (this.onBeforeWrite) {
            const validation = this.onBeforeWrite(state, current);
            if (!validation.accept) {
                console.warn(`State validation failed for ${entityId}: ${validation.reason}`);
                return false;
            }
        }
        this.entities.set(entityId, state);
        this.recordHistory(entityId, state);
        return true;
    }
    read(entityId) {
        return this.entities.get(entityId);
    }
    getByZone(zoneId) {
        const result = [];
        for (const state of this.entities.values()) {
            if (state.zoneId === zoneId) {
                result.push(state);
            }
        }
        return result;
    }
    recordHistory(entityId, state) {
        let hist = this.history.get(entityId);
        if (!hist) {
            hist = [];
            this.history.set(entityId, hist);
        }
        hist.push({ ...state });
        if (hist.length > this.maxHistory) {
            hist.shift();
        }
    }
    getHistoricalState(entityId, tick) {
        const hist = this.history.get(entityId);
        if (!hist)
            return undefined;
        // Find closest state (exact match or just before)
        for (let i = hist.length - 1; i >= 0; i--) {
            if (hist[i].tick <= tick) {
                return hist[i];
            }
        }
        return undefined;
    }
}
//# sourceMappingURL=StateAnchor.js.map
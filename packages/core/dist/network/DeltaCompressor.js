/**
 * Delta Compressor
 * Calculates diffs between ticks to reduce bandwidth usage.
 */
export class DeltaCompressor {
    // Creates a highly compressed buffer object of only changed fields
    static calculateDelta(oldState, newState) {
        if (!oldState)
            return newState; // Need full payload
        const delta = { entityId: newState.entityId };
        let hasChanges = false;
        // We use a small threshold to avoid spamming micro-jiggles
        if (!this.epsilonEquals(oldState.position.x, newState.position.x) ||
            !this.epsilonEquals(oldState.position.y, newState.position.y)) {
            delta.position = newState.position;
            hasChanges = true;
        }
        if (!this.epsilonEquals(oldState.velocity.x, newState.velocity.x) ||
            !this.epsilonEquals(oldState.velocity.y, newState.velocity.y)) {
            delta.velocity = newState.velocity;
            hasChanges = true;
        }
        if (oldState.flags !== newState.flags) {
            delta.flags = newState.flags;
            hasChanges = true;
        }
        if (oldState.health !== newState.health) {
            delta.health = newState.health;
            hasChanges = true;
        }
        return hasChanges ? delta : null; // null if state didn't change
    }
    // Integrates the received delta into the client's local tracker
    static applyDelta(baseState, delta) {
        return {
            ...baseState,
            ...delta,
            position: delta.position || baseState.position,
            velocity: delta.velocity || baseState.velocity
        };
    }
    static epsilonEquals(a, b, eps = 0.01) {
        return Math.abs(a - b) < eps;
    }
}
//# sourceMappingURL=DeltaCompressor.js.map
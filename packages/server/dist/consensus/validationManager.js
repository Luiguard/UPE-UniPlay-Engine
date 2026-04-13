export class ValidationManager {
    validateEntityState(state) {
        // Prüfe Bounds
        if (state.position.x < -1000 || state.position.x > 1000 ||
            state.position.y < -1000 || state.position.y > 1000) {
            return { accept: false, reason: 'Position out of bounds' };
        }
        // Prüfe Velocity
        if (Math.abs(state.velocity.x) > 50 || Math.abs(state.velocity.y) > 50) {
            return { accept: false, reason: 'Velocity too high' };
        }
        // Prüfe Health
        if (state.health < 0 || state.health > 100) {
            return { accept: false, reason: 'Invalid health' };
        }
        return { accept: true };
    }
    validateMicrotaskResult(result) {
        // Prüfe Execution Time
        if (result.executionTime > result.maxExecutionTime) {
            return { accept: false, reason: 'Task exceeded time limit' };
        }
        // Prüfe Result Type
        if (typeof result.result !== 'object' || !result.result.position) {
            return { accept: false, reason: 'Invalid result format' };
        }
        return { accept: true };
    }
}
//# sourceMappingURL=validationManager.js.map
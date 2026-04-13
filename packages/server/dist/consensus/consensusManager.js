import { ValidationManager } from './validationManager';
export class ConsensusManager {
    votes = new Map();
    quorum = 2; // Minimum votes
    validator;
    constructor() {
        this.validator = new ValidationManager();
    }
    /**
     * Submit a vote for a microtask
     */
    submitVote(vote) {
        // Validate Vote
        if (vote.result && typeof vote.result === 'object' && 'executionTime' in vote.result) {
            const validation = this.validator.validateMicrotaskResult(vote.result);
            if (!validation.accept) {
                console.warn(`Invalid vote from ${vote.clientId}: ${validation.reason}`);
                return null;
            }
        }
        else if (vote.result && typeof vote.result === 'object' && 'position' in vote.result) {
            const validation = this.validator.validateEntityState(vote.result);
            if (!validation.accept) {
                console.warn(`Invalid state from ${vote.clientId}: ${validation.reason}`);
                return null;
            }
        }
        const existing = this.votes.get(vote.taskId) || [];
        existing.push(vote);
        this.votes.set(vote.taskId, existing);
        // Check if quorum reached
        if (existing.length >= this.quorum) {
            return this.resolveConsensus(vote.taskId);
        }
        return null;
    }
    /**
     * Resolve consensus for a task
     */
    resolveConsensus(taskId) {
        const votes = this.votes.get(taskId);
        if (!votes || votes.length < this.quorum)
            return null;
        // Simple majority: take the most common result
        const results = votes.map(v => v.result);
        const winner = this.findMajority(results);
        const confidence = votes.length / this.quorum; // Simple confidence
        const result = {
            taskId,
            winner,
            confidence,
            voterCount: votes.length,
            tick: votes[0].tick, // Assume same tick
        };
        this.votes.delete(taskId);
        return result;
    }
    /**
     * Find majority result (simplified)
     */
    findMajority(results) {
        // For simplicity, return the first one. In real impl, compare based on type
        return results[0];
    }
}
//# sourceMappingURL=consensusManager.js.map
export class ConsensusEngine {
    pendingVotes = new Map();
    quorum;
    // To detect consensus divergence quickly (Step 8: Anti-Cheat durch Konsens)
    onDivergence = null;
    onSuspiciousClient = null;
    constructor(quorum = 2) {
        this.quorum = quorum;
    }
    submitVote(vote) {
        let taskVotes = this.pendingVotes.get(vote.taskId);
        if (!taskVotes) {
            taskVotes = new Map();
            this.pendingVotes.set(vote.taskId, taskVotes);
        }
        // Overwrite per client for the same task
        taskVotes.set(vote.clientId, vote);
        return this.tryResolve(vote.taskId);
    }
    tryResolve(taskId) {
        const taskVotes = this.pendingVotes.get(taskId);
        if (!taskVotes)
            return null;
        if (taskVotes.size < this.quorum) {
            return null;
        }
        // Evaluate majority using state hashes
        const votesArray = Array.from(taskVotes.values());
        const groups = new Map();
        for (const vote of votesArray) {
            // Group by hash (Step 4 & 8: Hash-Mechanismus / Divergenz-Erkennung)
            const hashKey = vote.result.newStateHash;
            let group = groups.get(hashKey);
            if (!group) {
                group = [];
                groups.set(hashKey, group);
            }
            group.push(vote);
        }
        // Find the largest group
        let majorityGroup = [];
        for (const group of groups.values()) {
            if (group.length > majorityGroup.length) {
                majorityGroup = group;
            }
        }
        if (majorityGroup.length >= this.quorum) {
            // We have consensus
            const winner = majorityGroup[0].result;
            const confidence = majorityGroup.length / votesArray.length;
            // Divergence detected - Penalize out-of-sync clients (Step 8)
            if (majorityGroup.length < votesArray.length) {
                if (this.onDivergence)
                    this.onDivergence(taskId, votesArray);
                // Find clients that submitted a wrong hash and penalize them
                for (const vote of votesArray) {
                    if (vote.result.newStateHash !== winner.newStateHash) {
                        if (this.onSuspiciousClient) {
                            this.onSuspiciousClient(vote.clientId, 10); // +10 strike points
                        }
                    }
                }
            }
            this.pendingVotes.delete(taskId);
            return {
                taskId,
                winner,
                confidence,
                voterCount: votesArray.length,
                tick: majorityGroup[0].tick
            };
        }
        return null;
    }
    cleanupOldTasks(currentTick, maxAgeTicks = 120) {
        for (const [taskId, votes] of this.pendingVotes.entries()) {
            let latestTick = 0;
            for (const vote of votes.values()) {
                if (vote.tick > latestTick)
                    latestTick = vote.tick;
            }
            if (currentTick - latestTick > maxAgeTicks) {
                this.pendingVotes.delete(taskId);
            }
        }
    }
}
//# sourceMappingURL=ConsensusEngine.js.map
import { ConsensusVote, ConsensusResult } from '@uniplay/core';
export declare class ConsensusManager {
    private votes;
    private quorum;
    private validator;
    constructor();
    /**
     * Submit a vote for a microtask
     */
    submitVote(vote: ConsensusVote): ConsensusResult | null;
    /**
     * Resolve consensus for a task
     */
    private resolveConsensus;
    /**
     * Find majority result (simplified)
     */
    private findMajority;
}
//# sourceMappingURL=consensusManager.d.ts.map
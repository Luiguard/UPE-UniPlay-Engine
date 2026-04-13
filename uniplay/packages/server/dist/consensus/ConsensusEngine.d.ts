import { TaskID, ClientID, ConsensusVote, ConsensusResult, Tick } from '@uniplay/core';
export declare class ConsensusEngine {
    private pendingVotes;
    private quorum;
    onDivergence: ((taskId: TaskID, votes: ConsensusVote[]) => void) | null;
    onSuspiciousClient: ((clientId: ClientID, severity: number) => void) | null;
    constructor(quorum?: number);
    submitVote(vote: ConsensusVote): ConsensusResult | null;
    private tryResolve;
    cleanupOldTasks(currentTick: Tick, maxAgeTicks?: number): void;
}
//# sourceMappingURL=ConsensusEngine.d.ts.map
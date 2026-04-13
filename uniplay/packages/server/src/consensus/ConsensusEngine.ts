import { TaskID, ClientID, ConsensusVote, ConsensusResult, Tick, MicrotaskResult } from '@uniplay/core';

export class ConsensusEngine {
  private pendingVotes: Map<TaskID, Map<ClientID, ConsensusVote>> = new Map();
  private quorum: number;
  
  // To detect consensus divergence quickly (Step 8: Anti-Cheat durch Konsens)
  public onDivergence: ((taskId: TaskID, votes: ConsensusVote[]) => void) | null = null;
  public onSuspiciousClient: ((clientId: ClientID, severity: number) => void) | null = null;

  constructor(quorum: number = 2) {
    this.quorum = quorum;
  }

  public submitVote(vote: ConsensusVote): ConsensusResult | null {
    let taskVotes = this.pendingVotes.get(vote.taskId);

    if (!taskVotes) {
      taskVotes = new Map<ClientID, ConsensusVote>();
      this.pendingVotes.set(vote.taskId, taskVotes);
    }

    // Overwrite per client for the same task
    taskVotes.set(vote.clientId, vote);

    return this.tryResolve(vote.taskId);
  }

  private tryResolve(taskId: TaskID): ConsensusResult | null {
    const taskVotes = this.pendingVotes.get(taskId);
    if (!taskVotes) return null;

    if (taskVotes.size < this.quorum) {
      return null;
    }

    // Evaluate majority using state hashes
    const votesArray = Array.from(taskVotes.values());
    const groups = new Map<string, ConsensusVote[]>();

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
    let majorityGroup: ConsensusVote[] = [];
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
        if (this.onDivergence) this.onDivergence(taskId, votesArray);
        
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

  public cleanupOldTasks(currentTick: Tick, maxAgeTicks: number = 120): void {
    for (const [taskId, votes] of this.pendingVotes.entries()) {
      let latestTick = 0;
      for (const vote of votes.values()) {
        if (vote.tick > latestTick) latestTick = vote.tick;
      }

      if (currentTick - latestTick > maxAgeTicks) {
        this.pendingVotes.delete(taskId);
      }
    }
  }
}

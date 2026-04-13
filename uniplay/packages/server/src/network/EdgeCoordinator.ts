import { ClientID, NodeID, LatencyMatrix } from '@uniplay/core';

export class EdgeCoordinator {
  // Contains Latency matrices built by Edge Nodes forwarding player pings
  private networkMatrix: Map<ClientID, LatencyMatrix> = new Map();
  private availableNodes: Map<NodeID, { url: string, activeRegions: string[] }> = new Map();

  public registerEdgeNode(nodeId: NodeID, url: string, regions: string[]): void {
    this.availableNodes.set(nodeId, { url, activeRegions: regions });
  }

  public updatePlayerLatency(matrix: LatencyMatrix): void {
    this.networkMatrix.set(matrix.playerId, matrix);
  }

  /**
   * Geographic Optimization (Schritt 7)
   * Finds the most balanced Node for a group of players (e.g., simulating one Zone).
   * It minimizes the Maximum Ping among all participants ("Fairness").
   */
  public findOptimalMiddleNode(participantIds: ClientID[]): NodeID | null {
    if (participantIds.length === 0 || this.availableNodes.size === 0) return null;

    let bestNode: NodeID | null = null;
    let lowestMaxPing = Infinity;

    for (const nodeId of this.availableNodes.keys()) {
      let maxPingOnThisNode = 0;

      for (const pId of participantIds) {
        const matrix = this.networkMatrix.get(pId);
        if (!matrix) continue;

        const ping = matrix.pingToNode[nodeId] || 999;
        if (ping > maxPingOnThisNode) {
          maxPingOnThisNode = ping;
        }
      }

      if (maxPingOnThisNode < lowestMaxPing) {
        lowestMaxPing = maxPingOnThisNode;
        bestNode = nodeId;
      }
    }

    return bestNode;
  }
}

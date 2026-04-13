import { ClientID, NodeID, LatencyMatrix } from '@uniplay/core';
export declare class EdgeCoordinator {
    private networkMatrix;
    private availableNodes;
    registerEdgeNode(nodeId: NodeID, url: string, regions: string[]): void;
    updatePlayerLatency(matrix: LatencyMatrix): void;
    /**
     * Geographic Optimization (Schritt 7)
     * Finds the most balanced Node for a group of players (e.g., simulating one Zone).
     * It minimizes the Maximum Ping among all participants ("Fairness").
     */
    findOptimalMiddleNode(participantIds: ClientID[]): NodeID | null;
}
//# sourceMappingURL=EdgeCoordinator.d.ts.map
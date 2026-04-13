import { AnchorState } from '@uniplay/core';
import { StateAnchor } from '../StateAnchor.js';
export declare class InterestManager {
    private stateAnchor;
    private interestRadius;
    constructor(stateAnchor: StateAnchor, interestRadius?: number);
    /**
     * Returns only Entities within the radius of a specific tracking coordinate
     * Form of "Spatial Partitioning / Spatial Hashing" filtering
     */
    getVisibleEntities(observerX: number, observerY: number, zoneId: string): AnchorState[];
}
//# sourceMappingURL=InterestManager.d.ts.map
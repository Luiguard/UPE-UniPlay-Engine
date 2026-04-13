export class InterestManager {
    stateAnchor;
    interestRadius;
    constructor(stateAnchor, interestRadius = 150) {
        this.stateAnchor = stateAnchor;
        this.interestRadius = interestRadius;
    }
    /**
     * Returns only Entities within the radius of a specific tracking coordinate
     * Form of "Spatial Partitioning / Spatial Hashing" filtering
     */
    getVisibleEntities(observerX, observerY, zoneId) {
        const allInZone = this.stateAnchor.getByZone(zoneId);
        if (this.interestRadius <= 0)
            return allInZone; // Disabled
        const visible = [];
        const radSq = this.interestRadius * this.interestRadius;
        for (const entity of allInZone) {
            const dx = entity.position.x - observerX;
            const dy = entity.position.y - observerY;
            if ((dx * dx + dy * dy) <= radSq) {
                visible.push(entity);
            }
        }
        return visible;
    }
}
//# sourceMappingURL=InterestManager.js.map
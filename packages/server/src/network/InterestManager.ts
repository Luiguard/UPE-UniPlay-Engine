import { ClientID, EntityID, AnchorState } from '@uniplay/core';
import { StateAnchor } from '../StateAnchor.js';

export class InterestManager {
  private stateAnchor: StateAnchor;
  private interestRadius: number;

  constructor(stateAnchor: StateAnchor, interestRadius: number = 150) {
    this.stateAnchor = stateAnchor;
    this.interestRadius = interestRadius;
  }

  /**
   * Returns only Entities within the radius of a specific tracking coordinate 
   * Form of "Spatial Partitioning / Spatial Hashing" filtering
   */
  public getVisibleEntities(observerX: number, observerY: number, zoneId: string): AnchorState[] {
    const allInZone = this.stateAnchor.getByZone(zoneId);
    if (this.interestRadius <= 0) return allInZone; // Disabled

    const visible: AnchorState[] = [];
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

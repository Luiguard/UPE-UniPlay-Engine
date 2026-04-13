import { EntityID, AnchorState, ZoneID, ValidationResult } from '@uniplay/core';

export class StateAnchor {
  private entities: Map<EntityID, AnchorState> = new Map();
  // History for Rollback/Reconciliation matching
  private history: Map<EntityID, AnchorState[]> = new Map();
  private maxHistory: number = 60; // 1 second at 60 tickrate

  // Callback to validate before writing (Mechanism #16: Event-Ordering / Validation)
  public onBeforeWrite: ((proposed: AnchorState, current: AnchorState | undefined) => ValidationResult) | null = null;

  public write(entityId: EntityID, state: AnchorState): boolean {
    const current = this.entities.get(entityId);
    
    if (this.onBeforeWrite) {
      const validation = this.onBeforeWrite(state, current);
      if (!validation.accept) {
        console.warn(`State validation failed for ${entityId}: ${validation.reason}`);
        return false;
      }
    }

    this.entities.set(entityId, state);
    this.recordHistory(entityId, state);
    return true;
  }

  public read(entityId: EntityID): AnchorState | undefined {
    return this.entities.get(entityId);
  }

  public getByZone(zoneId: ZoneID): AnchorState[] {
    const result: AnchorState[] = [];
    for (const state of this.entities.values()) {
      if (state.zoneId === zoneId) {
        result.push(state);
      }
    }
    return result;
  }

  private recordHistory(entityId: EntityID, state: AnchorState): void {
    let hist = this.history.get(entityId);
    if (!hist) {
      hist = [];
      this.history.set(entityId, hist);
    }
    hist.push({ ...state });
    if (hist.length > this.maxHistory) {
      hist.shift();
    }
  }

  public getHistoricalState(entityId: EntityID, tick: number): AnchorState | undefined {
    const hist = this.history.get(entityId);
    if (!hist) return undefined;
    
    // Find closest state (exact match or just before)
    for (let i = hist.length - 1; i >= 0; i--) {
      if (hist[i].tick <= tick) {
        return hist[i];
      }
    }
    return undefined;
  }
}

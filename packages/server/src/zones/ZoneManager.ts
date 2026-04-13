import { ZoneID, EntityID, ClientID, ZoneConfig, AnchorState, Tick } from '@uniplay/core';
import { StateAnchor } from '../StateAnchor.js';

export class Zone {
  public id: ZoneID;
  public bounds: { x: number, y: number, width: number, height: number };
  public activeSimulators: Set<ClientID> = new Set();
  
  constructor(config: ZoneConfig) {
    this.id = config.id;
    this.bounds = config.bounds;
  }
}

export class ZoneManager {
  private zones: Map<ZoneID, Zone> = new Map();
  private entityZoneMap: Map<EntityID, ZoneID> = new Map();
  private stateAnchor: StateAnchor;

  constructor(stateAnchor: StateAnchor) {
    this.stateAnchor = stateAnchor;
  }

  public registerZone(config: ZoneConfig): Zone {
    const zone = new Zone(config);
    this.zones.set(config.id, zone);
    return zone;
  }

  public getZone(zoneId: ZoneID): Zone | undefined {
    return this.zones.get(zoneId);
  }

  // Step 2: Zonen-Migration & Ownership
  public assignEntityToZone(entityId: EntityID, zoneId: ZoneID): void {
    this.entityZoneMap.set(entityId, zoneId);
  }

  public addSimulatorToZone(zoneId: ZoneID, clientId: ClientID): void {
    const zone = this.zones.get(zoneId);
    if (zone) {
      zone.activeSimulators.add(clientId);
    }
  }

  public removeSimulatorFromZone(zoneId: ZoneID, clientId: ClientID): void {
    const zone = this.zones.get(zoneId);
    if (zone) {
      zone.activeSimulators.delete(clientId);
    }
  }

  // Step 4: Shadow-Mode beim Zonenwechsel (Preparation)
  public async prepareShadowZone(entityId: EntityID, nextZoneId: ZoneID): Promise<AnchorState[]> {
    // Deliver the target zone state to the client in advance so they simulate in shadow mode
    return this.stateAnchor.getByZone(nextZoneId);
  }

  // Step 4: Authority-Handover mit Snapshot
  public commitZoneTransfer(entityId: EntityID, nextZoneId: ZoneID, currentTick: Tick): boolean {
    const currentState = this.stateAnchor.read(entityId);
    if (!currentState) return false;

    // Remove from old zone, assign to new
    const oldZoneId = this.entityZoneMap.get(entityId);
    if (oldZoneId === nextZoneId) return true; // Already there

    // State Update for transfer
    currentState.zoneId = nextZoneId;
    currentState.tick = currentTick;
    this.stateAnchor.write(entityId, currentState);

    this.assignEntityToZone(entityId, nextZoneId);
    
    return true;
  }

  public getZoneForPosition(x: number, y: number): ZoneID | null {
    for (const zone of this.zones.values()) {
      if (
        x >= zone.bounds.x && x < zone.bounds.x + zone.bounds.width &&
        y >= zone.bounds.y && y < zone.bounds.y + zone.bounds.height
      ) {
        return zone.id;
      }
    }
    return null;
  }
}

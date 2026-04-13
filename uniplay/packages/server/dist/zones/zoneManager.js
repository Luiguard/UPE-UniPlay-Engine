export class Zone {
    id;
    bounds;
    activeSimulators = new Set();
    constructor(config) {
        this.id = config.id;
        this.bounds = config.bounds;
    }
}
export class ZoneManager {
    zones = new Map();
    entityZoneMap = new Map();
    stateAnchor;
    constructor(stateAnchor) {
        this.stateAnchor = stateAnchor;
    }
    registerZone(config) {
        const zone = new Zone(config);
        this.zones.set(config.id, zone);
        return zone;
    }
    getZone(zoneId) {
        return this.zones.get(zoneId);
    }
    // Step 2: Zonen-Migration & Ownership
    assignEntityToZone(entityId, zoneId) {
        this.entityZoneMap.set(entityId, zoneId);
    }
    addSimulatorToZone(zoneId, clientId) {
        const zone = this.zones.get(zoneId);
        if (zone) {
            zone.activeSimulators.add(clientId);
        }
    }
    removeSimulatorFromZone(zoneId, clientId) {
        const zone = this.zones.get(zoneId);
        if (zone) {
            zone.activeSimulators.delete(clientId);
        }
    }
    // Step 4: Shadow-Mode beim Zonenwechsel (Preparation)
    async prepareShadowZone(entityId, nextZoneId) {
        // Deliver the target zone state to the client in advance so they simulate in shadow mode
        return this.stateAnchor.getByZone(nextZoneId);
    }
    // Step 4: Authority-Handover mit Snapshot
    commitZoneTransfer(entityId, nextZoneId, currentTick) {
        const currentState = this.stateAnchor.read(entityId);
        if (!currentState)
            return false;
        // Remove from old zone, assign to new
        const oldZoneId = this.entityZoneMap.get(entityId);
        if (oldZoneId === nextZoneId)
            return true; // Already there
        // State Update for transfer
        currentState.zoneId = nextZoneId;
        currentState.tick = currentTick;
        this.stateAnchor.write(entityId, currentState);
        this.assignEntityToZone(entityId, nextZoneId);
        return true;
    }
    getZoneForPosition(x, y) {
        for (const zone of this.zones.values()) {
            if (x >= zone.bounds.x && x < zone.bounds.x + zone.bounds.width &&
                y >= zone.bounds.y && y < zone.bounds.y + zone.bounds.height) {
                return zone.id;
            }
        }
        return null;
    }
}
//# sourceMappingURL=ZoneManager.js.map
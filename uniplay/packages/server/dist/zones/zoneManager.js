export class ZoneManager {
    zones = new Map();
    entities = new Map();
    addZone(config) {
        this.zones.set(config.id, config);
    }
    assignEntityToZone(entityId, state) {
        // Einfache Zuweisung: Prüfe Bounds
        for (const [zoneId, zone] of this.zones) {
            if (this.isInZone(state.position, zone)) {
                this.entities.set(entityId, { zoneId, state });
                return zoneId;
            }
        }
        return null; // Keine Zone gefunden
    }
    isInZone(position, zone) {
        return position.x >= zone.bounds.x &&
            position.x <= zone.bounds.x + zone.bounds.width &&
            position.y >= zone.bounds.y &&
            position.y <= zone.bounds.y + zone.bounds.height;
    }
    getZoneSnapshot(zoneId, tick) {
        const zone = this.zones.get(zoneId);
        if (!zone)
            return null;
        const entities = Array.from(this.entities.values())
            .filter(e => e.zoneId === zoneId)
            .map(e => e.state);
        return {
            zoneId,
            entities,
            tick,
            hash: this.generateHash(entities),
        };
    }
    generateHash(entities) {
        // Einfacher Hash
        return entities.length.toString();
    }
    // Dynamisches Sharding: Teile Zone bei Überlastung
    shardZone(zoneId) {
        const zone = this.zones.get(zoneId);
        if (!zone || zone.maxEntities === undefined)
            return;
        const entityCount = Array.from(this.entities.values()).filter(e => e.zoneId === zoneId).length;
        if (entityCount > zone.maxEntities) {
            // Teile Zone in 4 Quadranten
            const halfWidth = zone.bounds.width / 2;
            const halfHeight = zone.bounds.height / 2;
            const newZones = [
                { ...zone, id: `${zoneId}_tl`, bounds: { ...zone.bounds, width: halfWidth, height: halfHeight } },
                { ...zone, id: `${zoneId}_tr`, bounds: { ...zone.bounds, x: zone.bounds.x + halfWidth, width: halfWidth, height: halfHeight } },
                { ...zone, id: `${zoneId}_bl`, bounds: { ...zone.bounds, y: zone.bounds.y + halfHeight, width: halfWidth, height: halfHeight } },
                { ...zone, id: `${zoneId}_br`, bounds: { ...zone.bounds, x: zone.bounds.x + halfWidth, y: zone.bounds.y + halfHeight, width: halfWidth, height: halfHeight } },
            ];
            newZones.forEach(z => this.addZone(z));
            this.zones.delete(zoneId);
            // Reassign Entities
            for (const [entityId, data] of this.entities) {
                if (data.zoneId === zoneId) {
                    this.assignEntityToZone(entityId, data.state);
                }
            }
        }
    }
}
//# sourceMappingURL=zoneManager.js.map
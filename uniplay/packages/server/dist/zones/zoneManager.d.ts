import { ZoneID, ZoneConfig, EntityID, ZoneSnapshot, AnchorState } from '@uniplay/core';
export declare class ZoneManager {
    private zones;
    private entities;
    addZone(config: ZoneConfig): void;
    assignEntityToZone(entityId: EntityID, state: AnchorState): string | null;
    private isInZone;
    getZoneSnapshot(zoneId: ZoneID, tick: number): ZoneSnapshot | null;
    private generateHash;
    shardZone(zoneId: ZoneID): void;
}
//# sourceMappingURL=zoneManager.d.ts.map
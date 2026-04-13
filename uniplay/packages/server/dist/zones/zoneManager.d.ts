import { ZoneID, EntityID, ClientID, ZoneConfig, AnchorState, Tick } from '@uniplay/core';
import { StateAnchor } from '../StateAnchor.js';
export declare class Zone {
    id: ZoneID;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    activeSimulators: Set<ClientID>;
    constructor(config: ZoneConfig);
}
export declare class ZoneManager {
    private zones;
    private entityZoneMap;
    private stateAnchor;
    constructor(stateAnchor: StateAnchor);
    registerZone(config: ZoneConfig): Zone;
    getZone(zoneId: ZoneID): Zone | undefined;
    assignEntityToZone(entityId: EntityID, zoneId: ZoneID): void;
    addSimulatorToZone(zoneId: ZoneID, clientId: ClientID): void;
    removeSimulatorFromZone(zoneId: ZoneID, clientId: ClientID): void;
    prepareShadowZone(entityId: EntityID, nextZoneId: ZoneID): Promise<AnchorState[]>;
    commitZoneTransfer(entityId: EntityID, nextZoneId: ZoneID, currentTick: Tick): boolean;
    getZoneForPosition(x: number, y: number): ZoneID | null;
}
//# sourceMappingURL=ZoneManager.d.ts.map
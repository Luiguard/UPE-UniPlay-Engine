import { EntityID, AnchorState, ZoneID, ValidationResult } from '@uniplay/core';
export declare class StateAnchor {
    private entities;
    private history;
    private maxHistory;
    onBeforeWrite: ((proposed: AnchorState, current: AnchorState | undefined) => ValidationResult) | null;
    write(entityId: EntityID, state: AnchorState): boolean;
    read(entityId: EntityID): AnchorState | undefined;
    getByZone(zoneId: ZoneID): AnchorState[];
    private recordHistory;
    getHistoricalState(entityId: EntityID, tick: number): AnchorState | undefined;
}
//# sourceMappingURL=StateAnchor.d.ts.map
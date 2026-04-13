import type { StateAnchor } from '../StateAnchor.js';
import type { ZoneManager } from '../zones/ZoneManager.js';
import type { TickController } from '../TickController.js';
/**
 * HostGateway
 *
 * REST API for the Host Game Engine (Spigot, UE Dedicated Server, Godot, etc.)
 * to register zones and entities in the UniPlay State Anchor.
 *
 * Avoids circular imports by accepting individual component references.
 */
export declare class HostGateway {
    private stateAnchor;
    private zoneManager;
    private tickController;
    private httpServer;
    constructor(stateAnchor: StateAnchor, zoneManager: ZoneManager, tickController: TickController, internalPort?: number);
    private handleRequest;
}
//# sourceMappingURL=HostGateway.d.ts.map
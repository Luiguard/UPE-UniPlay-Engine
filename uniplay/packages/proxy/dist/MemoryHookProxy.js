/**
 * Universal MemoryHookProxy
 *
 * Strategy for games that don't use networking but memory structures (e.g. single-player games, GTA Mods, Skyrim).
 *
 * Uses dynamic memory reading/writing (DMA) to synchronize the game's internal variables
 * directly to the UniPlay Engine State Anchor.
 */
export class MemoryHookProxy {
    uniPlayClient;
    memoryHandles = new Map(); // entityId -> pointer address
    updateInterval = null;
    constructor(uniPlayClient) {
        this.uniPlayClient = uniPlayClient;
        // Watch for authoritative updates
        this.uniPlayClient.transport.registerHandler(0x02 /* STATE_UPDATE */, (payload) => {
            for (const entity of payload.entities) {
                this.writeMemoryState(entity.entityId, entity.position);
            }
        });
    }
    registerEntityPointer(entityId, pointerAddress) {
        this.memoryHandles.set(entityId, pointerAddress);
    }
    attach(processName, tickRate = 60) {
        console.log(`[MemoryHookProxy] Attaching to process: ${processName}`);
        // Map native game memory to UniPlay Inputs continually
        this.updateInterval = setInterval(() => {
            this.scrapeMemoryToInputs();
        }, 1000 / tickRate);
    }
    detach() {
        if (this.updateInterval)
            clearInterval(this.updateInterval);
    }
    scrapeMemoryToInputs() {
        // Read local player's velocity memory address, map to UniPlay MoveX/MoveY,
        // Then sendInput to the UniPlay Client.
    }
    writeMemoryState(entityId, position) {
        const ptr = this.memoryHandles.get(entityId);
        if (ptr === undefined)
            return;
        // Overwrite the game engine's memory so it immediately snaps into the consensus state
        // memory.writeFloat(ptr + 0x00, position.x)
        // memory.writeFloat(ptr + 0x04, position.y)
        // memory.writeFloat(ptr + 0x08, position.z)
    }
}
//# sourceMappingURL=MemoryHookProxy.js.map
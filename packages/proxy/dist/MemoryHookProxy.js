export class MemoryHookProxy {
    uniPlayClient;
    entityPointers = new Map(); // entityId -> memory address
    updateInterval = null;
    lastKnownPositions = new Map();
    constructor(uniPlayClient) {
        this.uniPlayClient = uniPlayClient;
        // When UniPlay consensus resolves a new authoritative position, write it into game memory
        this.uniPlayClient.transport.registerHandler(0x02 /* STATE_UPDATE */, (payload) => {
            if (!payload.entities)
                return;
            for (const entity of payload.entities) {
                const ptr = this.entityPointers.get(entity.entityId);
                if (ptr !== undefined) {
                    this.writePosition(ptr, entity.position);
                }
            }
        });
    }
    /**
     * Register a game entity's memory address for synchronization.
     * The pointer should point to the start of the X float (Y and Z follow sequentially).
     */
    registerEntityPointer(entityId, pointerAddress) {
        this.entityPointers.set(entityId, pointerAddress);
        this.lastKnownPositions.set(entityId, { x: 0, y: 0, z: 0 });
    }
    /**
     * Start the memory scraping loop.
     */
    attach(tickRate = 60) {
        console.log(`[MemoryHookProxy] Attached. Scraping at ${tickRate} Hz`);
        this.updateInterval = setInterval(() => {
            this.scrapeAndSend();
        }, 1000 / tickRate);
    }
    detach() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        console.log(`[MemoryHookProxy] Detached.`);
    }
    scrapeAndSend() {
        for (const [entityId, ptr] of this.entityPointers.entries()) {
            const currentPos = this.readPosition(ptr);
            if (!currentPos)
                continue;
            const lastPos = this.lastKnownPositions.get(entityId);
            // Only send input if position actually changed (threshold: 0.01 units)
            if (lastPos &&
                Math.abs(currentPos.x - lastPos.x) < 0.01 &&
                Math.abs(currentPos.y - lastPos.y) < 0.01) {
                continue;
            }
            this.lastKnownPositions.set(entityId, { ...currentPos });
            // Convert memory-read position deltas into UniPlay InputFrames
            const dx = lastPos ? currentPos.x - lastPos.x : 0;
            const dy = lastPos ? currentPos.y - lastPos.y : 0;
            this.uniPlayClient.sendInput({
                moveX: dx,
                moveY: dy,
                moveZ: 0,
                jump: false,
                sprint: false,
                action: false
            });
        }
    }
}
//# sourceMappingURL=MemoryHookProxy.js.map
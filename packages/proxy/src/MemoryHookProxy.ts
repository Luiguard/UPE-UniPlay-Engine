import { UniPlayClient } from '@uniplay/client';
import { InputFrame } from '@uniplay/core';

/**
 * MemoryHookProxy — DMA bridge for non-moddable games.
 * 
 * This is an ABSTRACT base class. You must subclass it and implement:
 *   - readPosition(ptr): Read X/Y/Z floats from the game's memory
 *   - writePosition(ptr, pos): Write X/Y/Z floats into the game's memory
 *   - getProcessHandle(): Return a handle/reference to the target process
 *
 * Example implementations:
 *   - Windows: Use `memoryjs` npm package (ReadProcessMemory / WriteProcessMemory)
 *   - Linux: Use `/proc/<pid>/mem` file descriptor
 *   - Emulators: Use known RAM offset tables
 */
export interface IVec3Simple {
    x: number;
    y: number;
    z: number;
}

export abstract class MemoryHookProxy {
    protected uniPlayClient: UniPlayClient;
    protected entityPointers: Map<string, number> = new Map(); // entityId -> memory address
    private updateInterval: ReturnType<typeof setInterval> | null = null;
    private lastKnownPositions: Map<string, IVec3Simple> = new Map();

    constructor(uniPlayClient: UniPlayClient) {
        this.uniPlayClient = uniPlayClient;

        // When UniPlay consensus resolves a new authoritative position, write it into game memory
        this.uniPlayClient.transport.registerHandler(0x02 /* STATE_UPDATE */, (payload: any) => {
            if (!payload.entities) return;
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
    public registerEntityPointer(entityId: string, pointerAddress: number): void {
        this.entityPointers.set(entityId, pointerAddress);
        this.lastKnownPositions.set(entityId, { x: 0, y: 0, z: 0 });
    }

    /**
     * Start the memory scraping loop.
     */
    public attach(tickRate: number = 60): void {
        console.log(`[MemoryHookProxy] Attached. Scraping at ${tickRate} Hz`);

        this.updateInterval = setInterval(() => {
            this.scrapeAndSend();
        }, 1000 / tickRate);
    }

    public detach(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        console.log(`[MemoryHookProxy] Detached.`);
    }

    private scrapeAndSend(): void {
        for (const [entityId, ptr] of this.entityPointers.entries()) {
            const currentPos = this.readPosition(ptr);
            if (!currentPos) continue;

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

    // ─── Abstract methods to be implemented per platform ───

    /**
     * Read 3 sequential float32 values from the target process memory at the given pointer.
     * Return null if the read fails (e.g., process exited).
     */
    protected abstract readPosition(pointer: number): IVec3Simple | null;

    /**
     * Write 3 sequential float32 values into the target process memory at the given pointer.
     */
    protected abstract writePosition(pointer: number, position: IVec3Simple): void;
}

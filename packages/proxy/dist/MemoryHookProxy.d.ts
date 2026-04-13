import { UniPlayClient } from '@uniplay/client';
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
export declare abstract class MemoryHookProxy {
    protected uniPlayClient: UniPlayClient;
    protected entityPointers: Map<string, number>;
    private updateInterval;
    private lastKnownPositions;
    constructor(uniPlayClient: UniPlayClient);
    /**
     * Register a game entity's memory address for synchronization.
     * The pointer should point to the start of the X float (Y and Z follow sequentially).
     */
    registerEntityPointer(entityId: string, pointerAddress: number): void;
    /**
     * Start the memory scraping loop.
     */
    attach(tickRate?: number): void;
    detach(): void;
    private scrapeAndSend;
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
//# sourceMappingURL=MemoryHookProxy.d.ts.map
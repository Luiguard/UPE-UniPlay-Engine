import { UniPlayClient } from '@uniplay/client';
/**
 * Universal MemoryHookProxy
 *
 * Strategy for games that don't use networking but memory structures (e.g. single-player games, GTA Mods, Skyrim).
 *
 * Uses dynamic memory reading/writing (DMA) to synchronize the game's internal variables
 * directly to the UniPlay Engine State Anchor.
 */
export declare class MemoryHookProxy {
    private uniPlayClient;
    private memoryHandles;
    private updateInterval;
    constructor(uniPlayClient: UniPlayClient);
    registerEntityPointer(entityId: string, pointerAddress: number): void;
    attach(processName: string, tickRate?: number): void;
    detach(): void;
    private scrapeMemoryToInputs;
    private writeMemoryState;
}
//# sourceMappingURL=MemoryHookProxy.d.ts.map
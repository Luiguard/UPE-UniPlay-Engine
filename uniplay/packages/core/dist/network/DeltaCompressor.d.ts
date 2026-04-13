import { AnchorState } from '@uniplay/core';
/**
 * Delta Compressor
 * Calculates diffs between ticks to reduce bandwidth usage.
 */
export declare class DeltaCompressor {
    static calculateDelta(oldState: AnchorState | undefined, newState: AnchorState): Partial<AnchorState>;
    static applyDelta(baseState: AnchorState, delta: Partial<AnchorState>): AnchorState;
    private static epsilonEquals;
}
//# sourceMappingURL=DeltaCompressor.d.ts.map
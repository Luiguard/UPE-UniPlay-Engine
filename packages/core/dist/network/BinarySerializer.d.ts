import { AnchorState } from '../types.js';
export declare class BinarySerializer {
    private static hashEntityId;
    static packStateUpdate(entities: AnchorState[]): Uint8Array;
    static unpackStateUpdate(data: Uint8Array): {
        idHash: number;
        position: {
            x: number;
            y: number;
            z: number;
        };
        velocity: {
            x: number;
            y: number;
            z: number;
        };
        rotation: number;
        health: number;
        flags: number;
        objectState: number;
    }[];
}
//# sourceMappingURL=BinarySerializer.d.ts.map
export declare class FP {
    static readonly SHIFT = 16;
    static readonly ONE: number;
    static fromFloat(f: number): number;
    static toFloat(fp: number): number;
    static add(a: number, b: number): number;
    static sub(a: number, b: number): number;
    static mul(a: number, b: number): number;
    static div(a: number, b: number): number;
}
export declare class FVec3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, // Fixed point representation
    y?: number, z?: number);
    static fromFloats(x: number, y: number, z: number): FVec3;
    add(v: FVec3): FVec3;
    mulScalar(scalarFp: number): FVec3;
    toFloats(): {
        x: number;
        y: number;
        z: number;
    };
    toHashString(): string;
}
//# sourceMappingURL=FixedPoint.d.ts.map
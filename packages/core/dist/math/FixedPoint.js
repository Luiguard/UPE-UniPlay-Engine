export class FP {
    static SHIFT = 16;
    static ONE = 1 << FP.SHIFT;
    static fromFloat(f) {
        return Math.floor(f * FP.ONE);
    }
    static toFloat(fp) {
        return fp / FP.ONE;
    }
    static add(a, b) {
        return a + b;
    }
    static sub(a, b) {
        return a - b;
    }
    static mul(a, b) {
        // Need BigInt to avoid overflow in JS bitwise operations for high precision
        return Number((BigInt(a) * BigInt(b)) >> BigInt(FP.SHIFT));
    }
    static div(a, b) {
        return Number((BigInt(a) << BigInt(FP.SHIFT)) / BigInt(b));
    }
}
export class FVec3 {
    x;
    y;
    z;
    constructor(x = 0, // Fixed point representation
    y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static fromFloats(x, y, z) {
        return new FVec3(FP.fromFloat(x), FP.fromFloat(y), FP.fromFloat(z));
    }
    add(v) {
        return new FVec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    mulScalar(scalarFp) {
        return new FVec3(FP.mul(this.x, scalarFp), FP.mul(this.y, scalarFp), FP.mul(this.z, scalarFp));
    }
    toFloats() {
        return {
            x: FP.toFloat(this.x),
            y: FP.toFloat(this.y),
            z: FP.toFloat(this.z)
        };
    }
    // Cross-platform deterministic stringification for hashing
    toHashString() {
        return `${this.x}|${this.y}|${this.z}`;
    }
}
//# sourceMappingURL=FixedPoint.js.map
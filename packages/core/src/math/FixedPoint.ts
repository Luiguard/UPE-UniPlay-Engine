export class FP {
  public static readonly SHIFT = 16;
  public static readonly ONE = 1 << FP.SHIFT;

  public static fromFloat(f: number): number {
    return Math.floor(f * FP.ONE);
  }

  public static toFloat(fp: number): number {
    return fp / FP.ONE;
  }

  public static add(a: number, b: number): number {
    return a + b;
  }

  public static sub(a: number, b: number): number {
    return a - b;
  }

  public static mul(a: number, b: number): number {
    // Need BigInt to avoid overflow in JS bitwise operations for high precision
    return Number((BigInt(a) * BigInt(b)) >> BigInt(FP.SHIFT));
  }

  public static div(a: number, b: number): number {
    return Number((BigInt(a) << BigInt(FP.SHIFT)) / BigInt(b));
  }
}

export class FVec3 {
  constructor(
    public x: number = 0, // Fixed point representation
    public y: number = 0,
    public z: number = 0
  ) {}

  public static fromFloats(x: number, y: number, z: number): FVec3 {
    return new FVec3(FP.fromFloat(x), FP.fromFloat(y), FP.fromFloat(z));
  }

  public add(v: FVec3): FVec3 {
    return new FVec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  public mulScalar(scalarFp: number): FVec3 {
    return new FVec3(
      FP.mul(this.x, scalarFp),
      FP.mul(this.y, scalarFp),
      FP.mul(this.z, scalarFp)
    );
  }

  public toFloats(): { x: number, y: number, z: number } {
    return {
      x: FP.toFloat(this.x),
      y: FP.toFloat(this.y),
      z: FP.toFloat(this.z)
    };
  }
  
  // Cross-platform deterministic stringification for hashing
  public toHashString(): string {
      return `${this.x}|${this.y}|${this.z}`;
  }
}

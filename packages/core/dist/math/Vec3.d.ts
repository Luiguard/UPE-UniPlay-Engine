import { IVec3 } from '../types.js';
export declare class Vec3 implements IVec3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    static zero(): Vec3;
    clone(): Vec3;
    set(x: number, y: number, z: number): this;
    copy(other: IVec3): this;
    add(other: IVec3): Vec3;
    sub(other: IVec3): Vec3;
    scale(s: number): Vec3;
    distanceTo(other: IVec3): number;
    lerp(target: IVec3, t: number): Vec3;
    length(): number;
    normalize(): Vec3;
    equals(other: IVec3, epsilon?: number): boolean;
}
//# sourceMappingURL=Vec3.d.ts.map
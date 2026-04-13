export class Vec3 {
    x;
    y;
    z;
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static zero() {
        return new Vec3(0, 0, 0);
    }
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    copy(other) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        return this;
    }
    add(other) {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }
    sub(other) {
        return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
    }
    scale(s) {
        return new Vec3(this.x * s, this.y * s, this.z * s);
    }
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    lerp(target, t) {
        t = Math.max(0, Math.min(1, t)); // clamp 0-1
        return new Vec3(this.x + (target.x - this.x) * t, this.y + (target.y - this.y) * t, this.z + (target.z - this.z) * t);
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    normalize() {
        const len = this.length();
        if (len === 0)
            return new Vec3(0, 0, 0);
        return this.scale(1 / len);
    }
    // To check equality with precision threshold
    equals(other, epsilon = 0.0001) {
        return Math.abs(this.x - other.x) < epsilon &&
            Math.abs(this.y - other.y) < epsilon &&
            Math.abs(this.z - other.z) < epsilon;
    }
}
//# sourceMappingURL=Vec3.js.map
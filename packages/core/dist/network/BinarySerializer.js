/**
 * BinarySerializer — Real binary packing/unpacking using DataView.
 *
 * Wire format per entity (32 bytes):
 *   [0-3]   entityId hash (uint32)
 *   [4-7]   position.x (float32)
 *   [8-11]  position.y (float32)
 *   [12-15] position.z (float32)
 *   [16-19] velocity.x (float32)
 *   [20-23] velocity.y (float32)
 *   [24-27] velocity.z (float32)
 *   [28]    rotation (uint8, 0-255 mapped to 0-360°)
 *   [29]    health (uint8, 0-255)
 *   [30]    flags (uint8)
 *   [31]    objectState (uint8)
 */
const BYTES_PER_ENTITY = 32;
export class BinarySerializer {
    // Map string entity IDs to stable numeric hashes for the wire
    static hashEntityId(id) {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash = hash >>> 0; // force unsigned 32-bit
        }
        return hash;
    }
    static packStateUpdate(entities) {
        const buffer = new ArrayBuffer(4 + entities.length * BYTES_PER_ENTITY); // 4 bytes for count header
        const view = new DataView(buffer);
        let offset = 0;
        // Header: entity count
        view.setUint32(offset, entities.length, true);
        offset += 4;
        for (const entity of entities) {
            // Entity ID hash
            view.setUint32(offset, this.hashEntityId(entity.entityId), true);
            offset += 4;
            // Position (3x float32)
            view.setFloat32(offset, entity.position.x, true);
            offset += 4;
            view.setFloat32(offset, entity.position.y, true);
            offset += 4;
            view.setFloat32(offset, entity.position.z, true);
            offset += 4;
            // Velocity (3x float32)
            view.setFloat32(offset, entity.velocity.x, true);
            offset += 4;
            view.setFloat32(offset, entity.velocity.y, true);
            offset += 4;
            view.setFloat32(offset, entity.velocity.z, true);
            offset += 4;
            // Rotation: compress 0-360 into 0-255
            view.setUint8(offset, Math.round((entity.rotation / 360) * 255) & 0xFF);
            offset += 1;
            // Health
            view.setUint8(offset, Math.min(255, Math.max(0, entity.health)) & 0xFF);
            offset += 1;
            // Flags
            view.setUint8(offset, entity.flags & 0xFF);
            offset += 1;
            // ObjectState
            view.setUint8(offset, entity.objectState & 0xFF);
            offset += 1;
        }
        return new Uint8Array(buffer);
    }
    static unpackStateUpdate(data) {
        const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        let offset = 0;
        const count = view.getUint32(offset, true);
        offset += 4;
        const results = [];
        for (let i = 0; i < count; i++) {
            const idHash = view.getUint32(offset, true);
            offset += 4;
            const px = view.getFloat32(offset, true);
            offset += 4;
            const py = view.getFloat32(offset, true);
            offset += 4;
            const pz = view.getFloat32(offset, true);
            offset += 4;
            const vx = view.getFloat32(offset, true);
            offset += 4;
            const vy = view.getFloat32(offset, true);
            offset += 4;
            const vz = view.getFloat32(offset, true);
            offset += 4;
            const rotationByte = view.getUint8(offset);
            offset += 1;
            const health = view.getUint8(offset);
            offset += 1;
            const flags = view.getUint8(offset);
            offset += 1;
            const objectState = view.getUint8(offset);
            offset += 1;
            results.push({
                idHash,
                position: { x: px, y: py, z: pz },
                velocity: { x: vx, y: vy, z: vz },
                rotation: (rotationByte / 255) * 360,
                health,
                flags,
                objectState
            });
        }
        return results;
    }
}
//# sourceMappingURL=BinarySerializer.js.map
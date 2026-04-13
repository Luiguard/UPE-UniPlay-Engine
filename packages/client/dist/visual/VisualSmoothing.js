import { Vec3 } from '@uniplay/core';
export class VisualSmoothing {
    // We keep track of the rendering position of entities vs their logical position
    renderPositions = new Map();
    updateRenderPosition(entityId, logicalTarget, correction, deltaTime) {
        let currentRender = this.renderPositions.get(entityId);
        if (!currentRender) {
            currentRender = new Vec3().copy(logicalTarget);
            this.renderPositions.set(entityId, currentRender);
            return currentRender;
        }
        // Standard Mechanism #18: Interpolation instead of Teleport
        const distance = currentRender.distanceTo(logicalTarget);
        if (distance > 0.01) {
            // If we are currently correcting a divergence (Mechanism #5) we lerp smoothly
            if (correction && correction.needsCorrection) {
                currentRender = currentRender.lerp(logicalTarget, correction.lerpFactor);
            }
            else {
                // Normal frame interpolation (if logic tick is faster/slower than render frame)
                // Simple lerp approaching target
                currentRender = currentRender.lerp(logicalTarget, 0.3); // 30% per frame
            }
            // Snap if we get too close to prevent endless micro-movements
            if (currentRender.distanceTo(logicalTarget) < 0.05) {
                currentRender.copy(logicalTarget);
            }
        }
        else {
            currentRender.copy(logicalTarget);
        }
        this.renderPositions.set(entityId, currentRender);
        return currentRender;
    }
    // For removing destroyed entities
    removeEntity(entityId) {
        this.renderPositions.delete(entityId);
    }
}
//# sourceMappingURL=VisualSmoothing.js.map
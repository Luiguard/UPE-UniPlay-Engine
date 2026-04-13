import { CorrectionResult, Vec3 } from '@uniplay/core';
export declare class VisualSmoothing {
    private renderPositions;
    updateRenderPosition(entityId: string, logicalTarget: Vec3, correction: CorrectionResult | null, deltaTime: number): Vec3;
    removeEntity(entityId: string): void;
}
//# sourceMappingURL=VisualSmoothing.d.ts.map
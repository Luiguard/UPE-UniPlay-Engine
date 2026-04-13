import { InputFrame, EntityState, CorrectionResult } from '@uniplay/core';
export declare class ClientPrediction {
    private inputHistory;
    private stateHistory;
    processInput(currentState: EntityState, input: InputFrame, speed: number, deltaTime: number): EntityState;
    reconcile(authoritativeState: EntityState, serverTick: number, speed: number, deltaTime: number): CorrectionResult | null;
    private processInputLocalOnly;
    private cloneState;
}
//# sourceMappingURL=ClientPrediction.d.ts.map
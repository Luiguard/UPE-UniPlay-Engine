import { InputFrame, EntityState, IVec3, Vec3, CorrectionResult } from '@uniplay/core';

export class ClientPrediction {
  private inputHistory: InputFrame[] = [];
  private stateHistory: { tick: number; state: EntityState }[] = [];
  
  // Mechanism #6: Input Buffering (up to 300ms usually, managed externally or here)

  public processInput(currentState: EntityState, input: InputFrame, speed: number, deltaTime: number): EntityState {
    const nextState = this.cloneState(currentState);
    
    // Apply movement logic strictly locally immediately
    nextState.velocity.x = input.moveX * speed;
    nextState.velocity.y = input.moveY * speed;
    // (Z ignored for 2D, or used for jumping in 3D)

    nextState.position.x += nextState.velocity.x * deltaTime;
    nextState.position.y += nextState.velocity.y * deltaTime;
    nextState.position.z += nextState.velocity.z * deltaTime;

    // Record for reconciliation
    this.inputHistory.push(input);
    this.stateHistory.push({ tick: input.tick, state: this.cloneState(nextState) });
    
    // Prune history
    if (this.inputHistory.length > 50) this.inputHistory.shift();
    if (this.stateHistory.length > 50) this.stateHistory.shift();

    return nextState;
  }

  // Called when Authoritative server state arrives
  public reconcile(authoritativeState: EntityState, serverTick: number, speed: number, deltaTime: number): CorrectionResult | null {
    // 1. Remove history older than serverTick
    this.inputHistory = this.inputHistory.filter(i => i.tick > serverTick);
    this.stateHistory = this.stateHistory.filter(s => s.tick > serverTick);

    // 2. Find what we predicted at that tick
    const predictedState = this.stateHistory.find(s => s.tick === serverTick);
    
    if (!predictedState) {
        // We don't have it (maybe dropped), just accept server state
        return {
            needsCorrection: true,
            positionDelta: new Vec3(0,0,0), // Instant snap
            correctedVelocity: new Vec3(0,0,0),
            distance: 0,
            lerpFactor: 1.0 // snap
        };
    }

    // 3. Compare prediction vs authoritative
    const pVec = new Vec3().copy(predictedState.state.position);
    const aVec = new Vec3().copy(authoritativeState.position);
    
    const distance = pVec.distanceTo(aVec);
    const THRESHOLD = 0.1; // Units

    if (distance > THRESHOLD) {
        // DIVERGENCE DETECTED. Server overrides.
        // We re-simulate starting from authoritative state using our unconfirmed inputs
        
        // The output is the target we SHOULD be at now
        let reSimulatedState = this.cloneState(authoritativeState);
        
        for (const input of this.inputHistory) {
            reSimulatedState = this.processInputLocalOnly(reSimulatedState, input, speed, deltaTime);
        }

        const deltaVec = new Vec3().copy(reSimulatedState.position).sub(pVec);

        return {
            needsCorrection: true,
            positionDelta: deltaVec,
            correctedVelocity: new Vec3(0,0,0), // Complex: compute velocity correction ideally
            distance: distance,
            lerpFactor: 0.08 // Smooth Lerp factor (Mechanism #5)
        };
    }

    return {
        needsCorrection: false,
        positionDelta: new Vec3(0,0,0),
        correctedVelocity: new Vec3(0,0,0),
        distance: 0,
        lerpFactor: 0
    };
  }

  // Helper without mutating history
  private processInputLocalOnly(currentState: EntityState, input: InputFrame, speed: number, deltaTime: number): EntityState {
     const nextState = this.cloneState(currentState);
     nextState.position.x += input.moveX * speed * deltaTime;
     nextState.position.y += input.moveY * speed * deltaTime;
     return nextState;
  }

  private cloneState(state: EntityState): EntityState {
    return {
      entityId: state.entityId,
      flags: state.flags,
      rotation: state.rotation,
      objectState: state.objectState,
      position: { x: state.position.x, y: state.position.y, z: state.position.z },
      velocity: { x: state.velocity.x, y: state.velocity.y, z: state.velocity.z }
    };
  }
}

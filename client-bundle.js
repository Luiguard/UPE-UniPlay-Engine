// packages/core/dist/types.js
var EntityFlags;
(function(EntityFlags2) {
  EntityFlags2[EntityFlags2["NONE"] = 0] = "NONE";
  EntityFlags2[EntityFlags2["GROUNDED"] = 1] = "GROUNDED";
  EntityFlags2[EntityFlags2["SPRINTING"] = 2] = "SPRINTING";
  EntityFlags2[EntityFlags2["JUMPING"] = 4] = "JUMPING";
  EntityFlags2[EntityFlags2["CROUCHING"] = 8] = "CROUCHING";
  EntityFlags2[EntityFlags2["CLIMBING"] = 16] = "CLIMBING";
  EntityFlags2[EntityFlags2["INTERACTING"] = 32] = "INTERACTING";
})(EntityFlags || (EntityFlags = {}));
var ObjectState;
(function(ObjectState2) {
  ObjectState2[ObjectState2["ALIVE"] = 0] = "ALIVE";
  ObjectState2[ObjectState2["DEAD"] = 1] = "DEAD";
  ObjectState2[ObjectState2["INTERACTING"] = 2] = "INTERACTING";
  ObjectState2[ObjectState2["SPECTATING"] = 3] = "SPECTATING";
})(ObjectState || (ObjectState = {}));
var MicrotaskType;
(function(MicrotaskType2) {
  MicrotaskType2[MicrotaskType2["PHYSICS_STEP"] = 0] = "PHYSICS_STEP";
  MicrotaskType2[MicrotaskType2["NPC_AI"] = 1] = "NPC_AI";
  MicrotaskType2[MicrotaskType2["COLLISION_CHECK"] = 2] = "COLLISION_CHECK";
  MicrotaskType2[MicrotaskType2["ZONE_HASH"] = 3] = "ZONE_HASH";
  MicrotaskType2[MicrotaskType2["PATHFINDING"] = 4] = "PATHFINDING";
})(MicrotaskType || (MicrotaskType = {}));
var ConsensusOutcome;
(function(ConsensusOutcome2) {
  ConsensusOutcome2[ConsensusOutcome2["RESOLVED"] = 0] = "RESOLVED";
  ConsensusOutcome2[ConsensusOutcome2["NO_QUORUM"] = 1] = "NO_QUORUM";
  ConsensusOutcome2[ConsensusOutcome2["TIE"] = 2] = "TIE";
  ConsensusOutcome2[ConsensusOutcome2["TIMEOUT"] = 3] = "TIMEOUT";
})(ConsensusOutcome || (ConsensusOutcome = {}));
var MessageType;
(function(MessageType2) {
  MessageType2[MessageType2["HEARTBEAT"] = 1] = "HEARTBEAT";
  MessageType2[MessageType2["STATE_UPDATE"] = 2] = "STATE_UPDATE";
  MessageType2[MessageType2["ANCHOR_UPDATE"] = 3] = "ANCHOR_UPDATE";
  MessageType2[MessageType2["ZONE_SNAPSHOT"] = 4] = "ZONE_SNAPSHOT";
  MessageType2[MessageType2["CONSENSUS_RESULT"] = 5] = "CONSENSUS_RESULT";
  MessageType2[MessageType2["PLAYER_JOIN"] = 6] = "PLAYER_JOIN";
  MessageType2[MessageType2["PLAYER_LEAVE"] = 7] = "PLAYER_LEAVE";
  MessageType2[MessageType2["WELCOME"] = 8] = "WELCOME";
  MessageType2[MessageType2["ASSIGN_TASK"] = 9] = "ASSIGN_TASK";
  MessageType2[MessageType2["INPUT"] = 16] = "INPUT";
  MessageType2[MessageType2["CONSENSUS_VOTE"] = 17] = "CONSENSUS_VOTE";
  MessageType2[MessageType2["STATE_HASH"] = 18] = "STATE_HASH";
  MessageType2[MessageType2["ZONE_ENTER_REQ"] = 19] = "ZONE_ENTER_REQ";
  MessageType2[MessageType2["ZONE_LEAVE_REQ"] = 20] = "ZONE_LEAVE_REQ";
  MessageType2[MessageType2["PING"] = 32] = "PING";
  MessageType2[MessageType2["PONG"] = 33] = "PONG";
})(MessageType || (MessageType = {}));
var DEFAULT_CLIENT_CONFIG = {
  serverUrl: "ws://localhost:8080",
  prediction: true,
  reconciliation: "smooth",
  inputBufferSize: 18,
  visualSmoothing: true,
  lerpSpeed: 0.08,
  jitterBufferSize: 3,
  deadReckoning: true
};

// packages/core/dist/math/Vec3.js
var Vec3 = class _Vec3 {
  x;
  y;
  z;
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  static zero() {
    return new _Vec3(0, 0, 0);
  }
  clone() {
    return new _Vec3(this.x, this.y, this.z);
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
    return new _Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }
  sub(other) {
    return new _Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }
  scale(s) {
    return new _Vec3(this.x * s, this.y * s, this.z * s);
  }
  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  lerp(target, t) {
    t = Math.max(0, Math.min(1, t));
    return new _Vec3(this.x + (target.x - this.x) * t, this.y + (target.y - this.y) * t, this.z + (target.z - this.z) * t);
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  normalize() {
    const len = this.length();
    if (len === 0)
      return new _Vec3(0, 0, 0);
    return this.scale(1 / len);
  }
  // To check equality with precision threshold
  equals(other, epsilon = 1e-4) {
    return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon && Math.abs(this.z - other.z) < epsilon;
  }
};

// packages/client/src/TickSync.ts
var TickSync = class {
  expectedServerTick = 0;
  localTick = 0;
  drift = 0;
  maxLeadTicks;
  intervalMs;
  constructor(tickRate = 60, maxLeadTicks = 2) {
    this.intervalMs = 1e3 / tickRate;
    this.maxLeadTicks = maxLeadTicks;
  }
  // Called on receiving heartbeat
  onHeartbeat(serverTick, serverTime, rtt) {
    const estimatedServerTick = serverTick + Math.ceil(rtt / 2 / this.intervalMs);
    this.expectedServerTick = estimatedServerTick;
    this.drift = this.localTick - this.expectedServerTick;
  }
  // Returns true if the client is too far ahead and should soft-sync (throttle)
  shouldThrottle() {
    return this.drift > this.maxLeadTicks;
  }
  // Advance local tick, taking soft-sync into account
  advanceTick() {
    if (!this.shouldThrottle()) {
      this.localTick++;
    } else {
      this.drift--;
    }
  }
  // Provide exactly how long the next loop iteration should wait
  getNextDelay() {
    if (this.drift > 0) {
      return this.intervalMs + 0.5;
    } else if (this.drift < 0) {
      return this.intervalMs - 0.5;
    }
    return this.intervalMs;
  }
  getCurrentTick() {
    return this.localTick;
  }
  setLocalTick(tick) {
    this.localTick = tick;
  }
};

// packages/client/src/transport/WebSocketClientTransport.ts
var WSClientTransport = class {
  ws = null;
  messageHandlers = /* @__PURE__ */ new Map();
  ping = 0;
  jitter = 0;
  pings = [];
  onConnect = null;
  onDisconnect = null;
  async connect(url) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);
      this.ws.onopen = () => {
        if (this.onConnect) this.onConnect();
        resolve();
      };
      this.ws.onerror = (err) => {
        reject(err);
      };
      this.ws.onclose = () => {
        if (this.onDisconnect) this.onDisconnect();
      };
      this.ws.onmessage = async (event) => {
        let msgStr;
        if (typeof Blob !== "undefined" && event.data instanceof Blob) {
          msgStr = await event.data.text();
        } else {
          msgStr = event.data.toString();
        }
        try {
          const packet = JSON.parse(msgStr);
          const handler = this.messageHandlers.get(packet.type);
          if (handler) {
            handler(packet.payload);
          }
        } catch (e) {
          console.error("Failed to parse packet", e);
        }
      };
    });
  }
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  send(channel, data) {
  }
  sendPacket(type, payload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type, payload }));
  }
  onMessage(channel, handler) {
  }
  registerHandler(type, handler) {
    this.messageHandlers.set(type, handler);
  }
  getPing() {
    return this.ping;
  }
  getJitter() {
    return this.jitter;
  }
  getPacketLoss() {
    return 0;
  }
  // Call this when processing heartbeats to calculate ping/jitter
  updatePing(rtt) {
    this.pings.push(rtt);
    if (this.pings.length > 10) this.pings.shift();
    let sum = 0;
    for (let p of this.pings) sum += p;
    this.ping = sum / this.pings.length;
    let variance = 0;
    for (let p of this.pings) variance += Math.abs(p - this.ping);
    this.jitter = variance / this.pings.length;
  }
};

// packages/client/src/prediction/ClientPrediction.ts
var ClientPrediction = class {
  inputHistory = [];
  stateHistory = [];
  // Mechanism #6: Input Buffering (up to 300ms usually, managed externally or here)
  processInput(currentState, input, speed, deltaTime) {
    const nextState = this.cloneState(currentState);
    nextState.velocity.x = input.moveX * speed;
    nextState.velocity.y = input.moveY * speed;
    nextState.position.x += nextState.velocity.x * deltaTime;
    nextState.position.y += nextState.velocity.y * deltaTime;
    nextState.position.z += nextState.velocity.z * deltaTime;
    this.inputHistory.push(input);
    this.stateHistory.push({ tick: input.tick, state: this.cloneState(nextState) });
    if (this.inputHistory.length > 50) this.inputHistory.shift();
    if (this.stateHistory.length > 50) this.stateHistory.shift();
    return nextState;
  }
  // Called when Authoritative server state arrives
  reconcile(authoritativeState, serverTick, speed, deltaTime) {
    this.inputHistory = this.inputHistory.filter((i) => i.tick > serverTick);
    this.stateHistory = this.stateHistory.filter((s) => s.tick > serverTick);
    const predictedState = this.stateHistory.find((s) => s.tick === serverTick);
    if (!predictedState) {
      return {
        needsCorrection: true,
        positionDelta: new Vec3(0, 0, 0),
        // Instant snap
        correctedVelocity: new Vec3(0, 0, 0),
        distance: 0,
        lerpFactor: 1
        // snap
      };
    }
    const pVec = new Vec3().copy(predictedState.state.position);
    const aVec = new Vec3().copy(authoritativeState.position);
    const distance = pVec.distanceTo(aVec);
    const THRESHOLD = 0.1;
    if (distance > THRESHOLD) {
      let reSimulatedState = this.cloneState(authoritativeState);
      for (const input of this.inputHistory) {
        reSimulatedState = this.processInputLocalOnly(reSimulatedState, input, speed, deltaTime);
      }
      const deltaVec = new Vec3().copy(reSimulatedState.position).sub(pVec);
      return {
        needsCorrection: true,
        positionDelta: deltaVec,
        correctedVelocity: new Vec3(0, 0, 0),
        // Complex: compute velocity correction ideally
        distance,
        lerpFactor: 0.08
        // Smooth Lerp factor (Mechanism #5)
      };
    }
    return {
      needsCorrection: false,
      positionDelta: new Vec3(0, 0, 0),
      correctedVelocity: new Vec3(0, 0, 0),
      distance: 0,
      lerpFactor: 0
    };
  }
  // Helper without mutating history
  processInputLocalOnly(currentState, input, speed, deltaTime) {
    const nextState = this.cloneState(currentState);
    nextState.position.x += input.moveX * speed * deltaTime;
    nextState.position.y += input.moveY * speed * deltaTime;
    return nextState;
  }
  cloneState(state) {
    return {
      entityId: state.entityId,
      flags: state.flags,
      rotation: state.rotation,
      objectState: state.objectState,
      position: { x: state.position.x, y: state.position.y, z: state.position.z },
      velocity: { x: state.velocity.x, y: state.velocity.y, z: state.velocity.z }
    };
  }
};

// packages/client/src/prediction/TaskExecutor.ts
var TaskExecutor = class {
  clientId;
  transport;
  tickSync;
  // Custom handler hooks to connect game engine physics/AI to UniPlay
  handlers = /* @__PURE__ */ new Map();
  constructor(clientId, transport, tickSync) {
    this.clientId = clientId;
    this.transport = transport;
    this.tickSync = tickSync;
  }
  // Registers an engine-specific execution handler for a MicrotaskType
  registerHandler(type, handler) {
    this.handlers.set(type, handler);
  }
  // Step 3: Ausführung des vom Server vergebenen Microtasks
  executeTask(task) {
    const handler = this.handlers.get(task.type);
    if (!handler) {
      console.warn(`[TaskExecutor] No handler registered for MicrotaskType ${task.type}`);
      return;
    }
    try {
      const executionStart = performance.now();
      const resultData = handler(task);
      const executionTime = performance.now() - executionStart;
      if (executionTime > 2) {
        console.warn(`[TaskExecutor] Task ${task.id} took ${executionTime.toFixed(2)}ms (Goal: < 2ms)`);
      }
      const stateHash = this.computeHash(resultData);
      const result = {
        taskId: task.id,
        type: task.type,
        targetId: task.targetId,
        tick: this.tickSync.getCurrentTick(),
        newStateHash: stateHash,
        resultData
      };
      this.submitVote(result);
    } catch (error) {
      console.error(`[TaskExecutor] Failed to execute task ${task.id}:`, error);
    }
  }
  distributeWork(tasks) {
    for (const t of tasks) this.executeTask(t);
  }
  submitVote(result) {
    const vote = {
      taskId: result.taskId,
      clientId: this.clientId,
      result,
      tick: result.tick,
      timestamp: Date.now()
    };
    this.transport.sendPacket(17, vote);
  }
  // Simple, fast deterministic hash for local results
  computeHash(obj) {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
};

// packages/client/src/visual/VisualSmoothing.ts
var VisualSmoothing = class {
  // We keep track of the rendering position of entities vs their logical position
  renderPositions = /* @__PURE__ */ new Map();
  updateRenderPosition(entityId, logicalTarget, correction, deltaTime) {
    let currentRender = this.renderPositions.get(entityId);
    if (!currentRender) {
      currentRender = new Vec3().copy(logicalTarget);
      this.renderPositions.set(entityId, currentRender);
      return currentRender;
    }
    const distance = currentRender.distanceTo(logicalTarget);
    if (distance > 0.01) {
      if (correction && correction.needsCorrection) {
        currentRender = currentRender.lerp(logicalTarget, correction.lerpFactor);
      } else {
        currentRender = currentRender.lerp(logicalTarget, 0.3);
      }
      if (currentRender.distanceTo(logicalTarget) < 0.05) {
        currentRender.copy(logicalTarget);
      }
    } else {
      currentRender.copy(logicalTarget);
    }
    this.renderPositions.set(entityId, currentRender);
    return currentRender;
  }
  // For removing destroyed entities
  removeEntity(entityId) {
    this.renderPositions.delete(entityId);
  }
};

// packages/client/src/index.ts
var UniPlayClient = class {
  config;
  clientId;
  tickSync;
  transport;
  prediction;
  taskExecutor;
  visual;
  connected = false;
  animationFrameId = 0;
  constructor(clientId, config = {}) {
    this.clientId = clientId;
    this.config = { ...DEFAULT_CLIENT_CONFIG, ...config };
    this.tickSync = new TickSync(60, 2);
    this.transport = new WSClientTransport();
    this.prediction = new ClientPrediction();
    this.taskExecutor = new TaskExecutor(this.clientId, this.transport, this.tickSync);
    this.visual = new VisualSmoothing();
    this.setupInternals();
  }
  setupInternals() {
    this.transport.registerHandler(1, (payload) => {
      this.transport.updatePing(Date.now() - payload.serverTime);
      this.tickSync.onHeartbeat(payload.serverTick, payload.serverTime, this.transport.getPing());
    });
    this.transport.registerHandler(9, (payload) => {
      this.taskExecutor.executeTask(payload.task);
    });
  }
  async connect() {
    console.log(`[UniPlayClient] Connecting to ${this.config.serverUrl}...`);
    await this.transport.connect(this.config.serverUrl);
    this.connected = true;
  }
  disconnect() {
    this.connected = false;
    this.transport.disconnect();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }
  sendInput(input) {
    if (!this.connected) return;
    const frame = {
      ...input,
      tick: this.tickSync.getCurrentTick(),
      timestamp: Date.now()
    };
    this.transport.sendPacket(16, { frames: [frame] });
  }
};
export {
  ClientPrediction,
  TaskExecutor,
  TickSync,
  UniPlayClient,
  VisualSmoothing,
  WSClientTransport
};

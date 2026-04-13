/**
 * @uniplay/core – Shared Type Definitions
 *
 * All types used across server, client, and transport layers.
 * These are the canonical definitions — no duplication allowed.
 */
export type EntityID = string;
export type ClientID = string;
export type ZoneID = string;
export type TaskID = string;
export type Tick = number;
export interface IVec3 {
    x: number;
    y: number;
    z: number;
}
export interface InputFrame {
    /** Client tick when this input was generated */
    tick: Tick;
    /** Movement direction X (-1 to 1) */
    moveX: number;
    /** Movement direction Y (-1 to 1) */
    moveY: number;
    /** Movement direction Z (-1 to 1), for 3D */
    moveZ: number;
    /** Jump pressed */
    jump: boolean;
    /** Sprint pressed */
    sprint: boolean;
    /** Action button (interact, attack, ...) */
    action: boolean;
    /** Timestamp in ms (client local) */
    timestamp: number;
}
export interface EntityState {
    entityId: EntityID;
    position: IVec3;
    velocity: IVec3;
    rotation: number;
    flags: EntityFlags;
    objectState: ObjectState;
}
export declare enum EntityFlags {
    NONE = 0,
    GROUNDED = 1,
    SPRINTING = 2,
    JUMPING = 4,
    CROUCHING = 8,
    CLIMBING = 16,
    INTERACTING = 32
}
export declare enum ObjectState {
    ALIVE = 0,
    DEAD = 1,
    INTERACTING = 2,
    SPECTATING = 3
}
export interface AnchorState extends EntityState {
    /** Server tick at which this anchor was written */
    tick: Tick;
    /** Zone this entity belongs to */
    zoneId: ZoneID;
    /** Health (0-100) */
    health: number;
}
export interface ZoneBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface ZoneConfig {
    id: ZoneID;
    bounds: ZoneBounds;
    maxEntities?: number;
    simulatorCount?: number;
}
export interface ZoneSnapshot {
    zoneId: ZoneID;
    entities: AnchorState[];
    tick: Tick;
    hash: string;
}
export interface Microtask {
    id: TaskID;
    type: MicrotaskType;
    data: MicrotaskData;
    assignedClients: ClientID[];
    deadline: number;
    maxExecutionTime: number;
}
export declare enum MicrotaskType {
    PHYSICS_UPDATE = "physics_update",
    AI_DECISION = "ai_decision",
    COLLISION_CHECK = "collision_check"
}
export interface MicrotaskData {
    entityId?: EntityID;
    zoneId?: ZoneID;
    input?: InputFrame;
    state?: EntityState;
    [key: string]: unknown;
}
export interface MicrotaskResult {
    taskId: TaskID;
    clientId: ClientID;
    result: EntityState | boolean | number;
    executionTime: number;
    timestamp: number;
}
export interface ConsensusVote {
    taskId: TaskID;
    clientId: ClientID;
    result: EntityState | MicrotaskResult;
    tick: Tick;
    timestamp: number;
}
export interface ConsensusResult {
    taskId: TaskID;
    winner: EntityState | MicrotaskResult;
    confidence: number;
    voterCount: number;
    tick: Tick;
}
export declare enum ConsensusOutcome {
    RESOLVED = 0,
    NO_QUORUM = 1,
    TIE = 2,
    TIMEOUT = 3
}
export interface CorrectionResult {
    /** Whether a correction is needed */
    needsCorrection: boolean;
    /** Position delta */
    positionDelta: IVec3;
    /** Corrected velocity (Velocity-Correction, Mechanism #7) */
    correctedVelocity: IVec3;
    /** Distance between client and server positions */
    distance: number;
    /** Interpolation factor (0-1) */
    lerpFactor: number;
}
export interface ValidationResult {
    accept: boolean;
    reason?: string;
}
export interface ServerConfig {
    /** Server tick rate in Hz (default: 60) */
    tickRate: number;
    /** WebSocket port */
    port: number;
    /** Maximum connected players */
    maxPlayers: number;
    /** Zone definitions */
    zones: ZoneConfig[];
    /** Maximum ticks a client can be ahead (default: 2) */
    maxClientLead: number;
    /** Consensus quorum (default: 2) */
    consensusQuorum: number;
    /** Heartbeat interval in ms (default: 1000) */
    heartbeatInterval: number;
    /** State hash interval in ticks (default: 60, ~1s) */
    stateHashInterval: number;
}
export interface ClientConfig {
    /** Server WebSocket URL */
    serverUrl: string;
    /** Enable client-side prediction (default: true) */
    prediction: boolean;
    /** Reconciliation mode */
    reconciliation: 'smooth' | 'snap' | 'off';
    /** Input buffer size in frames (default: 18 = ~300ms at 60Hz) */
    inputBufferSize: number;
    /** Enable visual smoothing (default: true) */
    visualSmoothing: boolean;
    /** Lerp speed for smooth corrections (default: 0.08) */
    lerpSpeed: number;
    /** Jitter buffer size in frames (default: 3) */
    jitterBufferSize: number;
    /** Dead reckoning enabled (default: true) */
    deadReckoning: boolean;
}
export declare enum MessageType {
    HEARTBEAT = 1,
    STATE_UPDATE = 2,
    ANCHOR_UPDATE = 3,
    ZONE_SNAPSHOT = 4,
    CONSENSUS_RESULT = 5,
    PLAYER_JOIN = 6,
    PLAYER_LEAVE = 7,
    WELCOME = 8,
    MICROTASK_ASSIGN = 9,
    INPUT = 16,
    CONSENSUS_VOTE = 17,
    STATE_HASH = 18,
    ZONE_ENTER_REQ = 19,
    ZONE_LEAVE_REQ = 20,
    MICROTASK_RESULT = 21,
    PING = 32,
    PONG = 33
}
export interface NetworkMessage {
    type: MessageType;
    tick: Tick;
    timestamp: number;
    payload: unknown;
}
export interface HeartbeatPayload {
    serverTick: Tick;
    serverTime: number;
}
export interface WelcomePayload {
    clientId: ClientID;
    serverTick: Tick;
    serverTime: number;
    tickRate: number;
    zoneSnapshots: ZoneSnapshot[];
}
export interface StateUpdatePayload {
    entities: AnchorState[];
    tick: Tick;
}
export interface InputPayload {
    clientId: ClientID;
    frames: InputFrame[];
}
export interface MicrotaskAssignPayload {
    tasks: Microtask[];
}
export interface MicrotaskResultPayload {
    results: MicrotaskResult[];
}
export interface GameEvent {
    type: string;
    entityId: EntityID;
    data: unknown;
    tick: Tick;
    lamportTimestamp?: number;
}
export interface OrderedEvent extends GameEvent {
    lamportTimestamp: number;
    globalOrder: number;
}
export declare const DEFAULT_SERVER_CONFIG: ServerConfig;
export declare const DEFAULT_CLIENT_CONFIG: ClientConfig;
//# sourceMappingURL=types.d.ts.map
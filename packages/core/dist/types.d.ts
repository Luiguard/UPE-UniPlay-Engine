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
export type NodeID = string;
export interface IVec3 {
    x: number;
    y: number;
    z: number;
}
export interface InputFrame {
    tick: Tick;
    moveX: number;
    moveY: number;
    moveZ: number;
    jump: boolean;
    sprint: boolean;
    action: boolean;
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
    tick: Tick;
    zoneId: ZoneID;
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
export declare enum MicrotaskType {
    PHYSICS_STEP = 0,
    NPC_AI = 1,
    COLLISION_CHECK = 2,
    ZONE_HASH = 3,
    PATHFINDING = 4
}
export interface Microtask {
    id: TaskID;
    type: MicrotaskType;
    targetId: EntityID | ZoneID;
    tick: Tick;
    data: any;
}
export interface MicrotaskResult {
    taskId: TaskID;
    type: MicrotaskType;
    targetId: EntityID | ZoneID;
    tick: Tick;
    newStateHash: string;
    resultData: any;
}
export interface ConsensusVote {
    taskId: TaskID;
    clientId: ClientID;
    result: MicrotaskResult;
    tick: Tick;
    timestamp: number;
}
export interface ConsensusResult {
    taskId: TaskID;
    winner: MicrotaskResult;
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
export interface EdgeNode {
    id: NodeID;
    region: string;
    host: string;
    capacity: number;
    activeZones: ZoneID[];
}
export interface LatencyMatrix {
    playerId: ClientID;
    pingToNode: Record<NodeID, number>;
}
export interface CorrectionResult {
    needsCorrection: boolean;
    positionDelta: IVec3;
    correctedVelocity: IVec3;
    distance: number;
    lerpFactor: number;
}
export interface ValidationResult {
    accept: boolean;
    reason?: string;
}
export interface ServerConfig {
    tickRate: number;
    port: number;
    maxPlayers: number;
    zones: ZoneConfig[];
    maxClientLead: number;
    consensusQuorum: number;
    heartbeatInterval: number;
    stateHashInterval: number;
    interestRadius: number;
}
export interface ClientConfig {
    serverUrl: string;
    prediction: boolean;
    reconciliation: 'smooth' | 'snap' | 'off';
    inputBufferSize: number;
    visualSmoothing: boolean;
    lerpSpeed: number;
    jitterBufferSize: number;
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
    ASSIGN_TASK = 9,
    MIGRATE_EDGE = 10,// Geografische Optimierung
    INPUT = 16,
    CONSENSUS_VOTE = 17,
    STATE_HASH = 18,
    ZONE_ENTER_REQ = 19,
    ZONE_LEAVE_REQ = 20,
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
export interface AssignTaskPayload {
    task: Microtask;
}
export interface StateUpdatePayload {
    entities: AnchorState[];
    deltas?: any[];
    tick: Tick;
}
export interface InputPayload {
    clientId: ClientID;
    frames: InputFrame[];
}
export interface MigrateEdgePayload {
    newNodeUrl: string;
    targetZone: ZoneID;
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
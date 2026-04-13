/**
 * @uniplay/core – Shared Type Definitions
 *
 * All types used across server, client, and transport layers.
 * These are the canonical definitions — no duplication allowed.
 */

// ─── Primitives ────────────────────────────────────
export type EntityID = string;
export type ClientID = string;
export type ZoneID = string;
export type TaskID = string;
export type Tick = number;

// ─── Vec3 ──────────────────────────────────────────
export interface IVec3 {
  x: number;
  y: number;
  z: number;
}

// ─── Input ─────────────────────────────────────────
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

// ─── Entity State ──────────────────────────────────
export interface EntityState {
  entityId: EntityID;
  position: IVec3;
  velocity: IVec3;
  rotation: number;
  flags: EntityFlags;
  objectState: ObjectState;
}

export enum EntityFlags {
  NONE       = 0,
  GROUNDED   = 1 << 0,
  SPRINTING  = 1 << 1,
  JUMPING    = 1 << 2,
  CROUCHING  = 1 << 3,
  CLIMBING   = 1 << 4,
  INTERACTING = 1 << 5,
}

export enum ObjectState {
  ALIVE        = 0,
  DEAD         = 1,
  INTERACTING  = 2,
  SPECTATING   = 3,
}

// ─── Anchor State (Server-Authoritative) ───────────
export interface AnchorState extends EntityState {
  /** Server tick at which this anchor was written */
  tick: Tick;
  /** Zone this entity belongs to */
  zoneId: ZoneID;
  /** Health (0-100) */
  health: number;
}

// ─── Zone ──────────────────────────────────────────
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

// ─── Microtask ───────────────────────────────────
export interface Microtask {
  id: TaskID;
  type: MicrotaskType;
  data: MicrotaskData;
  assignedClients: ClientID[];
  deadline: number; // ms timestamp
  maxExecutionTime: number; // ms, e.g. 2
}

export enum MicrotaskType {
  PHYSICS_UPDATE = 'physics_update',
  AI_DECISION = 'ai_decision',
  COLLISION_CHECK = 'collision_check',
  // Add more as needed
}

export interface MicrotaskData {
  entityId?: EntityID;
  zoneId?: ZoneID;
  input?: InputFrame;
  state?: EntityState;
  // Flexible for different task types
  [key: string]: unknown;
}

export interface MicrotaskResult {
  taskId: TaskID;
  clientId: ClientID;
  result: EntityState | boolean | number; // Depending on task type
  executionTime: number; // ms
  timestamp: number;
}

// ─── Consensus ─────────────────────────────────────
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

export enum ConsensusOutcome {
  RESOLVED    = 0,
  NO_QUORUM   = 1,
  TIE         = 2,
  TIMEOUT     = 3,
}

// ─── Correction ────────────────────────────────────
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

// ─── Validation ────────────────────────────────────
export interface ValidationResult {
  accept: boolean;
  reason?: string;
}

// ─── Server Config ─────────────────────────────────
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

// ─── Client Config ─────────────────────────────────
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

// ─── Network Messages ──────────────────────────────
export enum MessageType {
  // Server → Client
  HEARTBEAT         = 0x01,
  STATE_UPDATE      = 0x02,
  ANCHOR_UPDATE     = 0x03,
  ZONE_SNAPSHOT     = 0x04,
  CONSENSUS_RESULT  = 0x05,
  PLAYER_JOIN       = 0x06,
  PLAYER_LEAVE      = 0x07,
  WELCOME           = 0x08,
  MICROTASK_ASSIGN  = 0x09,

  // Client → Server
  INPUT             = 0x10,
  CONSENSUS_VOTE    = 0x11,
  STATE_HASH        = 0x12,
  ZONE_ENTER_REQ    = 0x13,
  ZONE_LEAVE_REQ    = 0x14,
  MICROTASK_RESULT  = 0x15,

  // Bidirectional
  PING              = 0x20,
  PONG              = 0x21,
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

// ─── Events ────────────────────────────────────────
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

// ─── Default Configs ───────────────────────────────
export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  tickRate: 60,
  port: 8080,
  maxPlayers: 100,
  zones: [],
  maxClientLead: 2,
  consensusQuorum: 2,
  heartbeatInterval: 1000,
  stateHashInterval: 60,
};

export const DEFAULT_CLIENT_CONFIG: ClientConfig = {
  serverUrl: 'ws://localhost:8080',
  prediction: true,
  reconciliation: 'smooth',
  inputBufferSize: 18,
  visualSmoothing: true,
  lerpSpeed: 0.08,
  jitterBufferSize: 3,
  deadReckoning: true,
};

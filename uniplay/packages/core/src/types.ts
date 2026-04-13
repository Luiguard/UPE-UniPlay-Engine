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
export type NodeID = string;

// ─── Vec3 ──────────────────────────────────────────
export interface IVec3 {
  x: number;
  y: number;
  z: number;
}

// ─── Input ─────────────────────────────────────────
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
  tick: Tick;
  zoneId: ZoneID;
  health: number;
}

// ─── Zone System ───────────────────────────────────
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

// ─── Microtasks & Consensus ────────────────────────
export enum MicrotaskType {
  PHYSICS_STEP    = 0,
  NPC_AI          = 1,
  COLLISION_CHECK = 2,
  ZONE_HASH       = 3,
  PATHFINDING     = 4,
}

export interface Microtask {
  id: TaskID;
  type: MicrotaskType;
  targetId: EntityID | ZoneID;
  tick: Tick;
  data: any; // Context required for the task
}

export interface MicrotaskResult {
  taskId: TaskID;
  type: MicrotaskType;
  targetId: EntityID | ZoneID;
  tick: Tick;
  newStateHash: string;
  resultData: any; // E.g., mutated EntityState
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

export enum ConsensusOutcome {
  RESOLVED    = 0,
  NO_QUORUM   = 1,
  TIE         = 2,
  TIMEOUT     = 3,
}

// ─── Geographic Nodes & Regions ────────────────────
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

// ─── Correction ────────────────────────────────────
export interface CorrectionResult {
  needsCorrection: boolean;
  positionDelta: IVec3;
  correctedVelocity: IVec3;
  distance: number;
  lerpFactor: number;
}

// ─── Validation ────────────────────────────────────
export interface ValidationResult {
  accept: boolean;
  reason?: string;
}

// ─── Server Config ─────────────────────────────────
export interface ServerConfig {
  tickRate: number;
  port: number;
  maxPlayers: number;
  zones: ZoneConfig[];
  maxClientLead: number;
  consensusQuorum: number;
  heartbeatInterval: number;
  stateHashInterval: number;
  interestRadius: number; // For Interest Management
}

// ─── Client Config ─────────────────────────────────
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
  ASSIGN_TASK       = 0x09,
  MIGRATE_EDGE      = 0x0A, // Geografische Optimierung

  // Client → Server
  INPUT             = 0x10,
  CONSENSUS_VOTE    = 0x11,
  STATE_HASH        = 0x12,
  ZONE_ENTER_REQ    = 0x13,
  ZONE_LEAVE_REQ    = 0x14,

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

export interface AssignTaskPayload {
  task: Microtask;
}

export interface StateUpdatePayload {
  entities: AnchorState[]; // Used if uncompressed
  deltas?: any[]; // Used if delta compressed
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
  interestRadius: 150.0 // Distance threshold
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

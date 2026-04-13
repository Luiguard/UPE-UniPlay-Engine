/**
 * @uniplay/core – Shared Type Definitions
 *
 * All types used across server, client, and transport layers.
 * These are the canonical definitions — no duplication allowed.
 */
export var EntityFlags;
(function (EntityFlags) {
    EntityFlags[EntityFlags["NONE"] = 0] = "NONE";
    EntityFlags[EntityFlags["GROUNDED"] = 1] = "GROUNDED";
    EntityFlags[EntityFlags["SPRINTING"] = 2] = "SPRINTING";
    EntityFlags[EntityFlags["JUMPING"] = 4] = "JUMPING";
    EntityFlags[EntityFlags["CROUCHING"] = 8] = "CROUCHING";
    EntityFlags[EntityFlags["CLIMBING"] = 16] = "CLIMBING";
    EntityFlags[EntityFlags["INTERACTING"] = 32] = "INTERACTING";
})(EntityFlags || (EntityFlags = {}));
export var ObjectState;
(function (ObjectState) {
    ObjectState[ObjectState["ALIVE"] = 0] = "ALIVE";
    ObjectState[ObjectState["DEAD"] = 1] = "DEAD";
    ObjectState[ObjectState["INTERACTING"] = 2] = "INTERACTING";
    ObjectState[ObjectState["SPECTATING"] = 3] = "SPECTATING";
})(ObjectState || (ObjectState = {}));
export var MicrotaskType;
(function (MicrotaskType) {
    MicrotaskType["PHYSICS_UPDATE"] = "physics_update";
    MicrotaskType["AI_DECISION"] = "ai_decision";
    MicrotaskType["COLLISION_CHECK"] = "collision_check";
    // Add more as needed
})(MicrotaskType || (MicrotaskType = {}));
export var ConsensusOutcome;
(function (ConsensusOutcome) {
    ConsensusOutcome[ConsensusOutcome["RESOLVED"] = 0] = "RESOLVED";
    ConsensusOutcome[ConsensusOutcome["NO_QUORUM"] = 1] = "NO_QUORUM";
    ConsensusOutcome[ConsensusOutcome["TIE"] = 2] = "TIE";
    ConsensusOutcome[ConsensusOutcome["TIMEOUT"] = 3] = "TIMEOUT";
})(ConsensusOutcome || (ConsensusOutcome = {}));
// ─── Network Messages ──────────────────────────────
export var MessageType;
(function (MessageType) {
    // Server → Client
    MessageType[MessageType["HEARTBEAT"] = 1] = "HEARTBEAT";
    MessageType[MessageType["STATE_UPDATE"] = 2] = "STATE_UPDATE";
    MessageType[MessageType["ANCHOR_UPDATE"] = 3] = "ANCHOR_UPDATE";
    MessageType[MessageType["ZONE_SNAPSHOT"] = 4] = "ZONE_SNAPSHOT";
    MessageType[MessageType["CONSENSUS_RESULT"] = 5] = "CONSENSUS_RESULT";
    MessageType[MessageType["PLAYER_JOIN"] = 6] = "PLAYER_JOIN";
    MessageType[MessageType["PLAYER_LEAVE"] = 7] = "PLAYER_LEAVE";
    MessageType[MessageType["WELCOME"] = 8] = "WELCOME";
    MessageType[MessageType["MICROTASK_ASSIGN"] = 9] = "MICROTASK_ASSIGN";
    // Client → Server
    MessageType[MessageType["INPUT"] = 16] = "INPUT";
    MessageType[MessageType["CONSENSUS_VOTE"] = 17] = "CONSENSUS_VOTE";
    MessageType[MessageType["STATE_HASH"] = 18] = "STATE_HASH";
    MessageType[MessageType["ZONE_ENTER_REQ"] = 19] = "ZONE_ENTER_REQ";
    MessageType[MessageType["ZONE_LEAVE_REQ"] = 20] = "ZONE_LEAVE_REQ";
    MessageType[MessageType["MICROTASK_RESULT"] = 21] = "MICROTASK_RESULT";
    // Bidirectional
    MessageType[MessageType["PING"] = 32] = "PING";
    MessageType[MessageType["PONG"] = 33] = "PONG";
})(MessageType || (MessageType = {}));
// ─── Default Configs ───────────────────────────────
export const DEFAULT_SERVER_CONFIG = {
    tickRate: 60,
    port: 8080,
    maxPlayers: 100,
    zones: [],
    maxClientLead: 2,
    consensusQuorum: 2,
    heartbeatInterval: 1000,
    stateHashInterval: 60,
};
export const DEFAULT_CLIENT_CONFIG = {
    serverUrl: 'ws://localhost:8080',
    prediction: true,
    reconciliation: 'smooth',
    inputBufferSize: 18,
    visualSmoothing: true,
    lerpSpeed: 0.08,
    jitterBufferSize: 3,
    deadReckoning: true,
};
//# sourceMappingURL=types.js.map
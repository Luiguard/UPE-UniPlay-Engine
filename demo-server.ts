import { UniPlayServer } from './uniplay/packages/server/src/index.js';
import { MicrotaskType } from './uniplay/packages/core/src/types.js';

console.log("Starting UniPlay Demo Server...");

// 1. Initialize Server
const server = new UniPlayServer({
  port: 3000,
  tickRate: 60,
  consensusQuorum: 2 // 2 out of 3 votes win
});

// Mock an entity that will be simulated
const entityId = "player_1";

server.stateAnchor.write(entityId, {
  entityId,
  position: { x: 50, y: 50, z: 0 },
  velocity: { x: 1, y: 1, z: 0 },
  rotation: 0,
  flags: 0,
  objectState: 0,
  tick: 0,
  zoneId: "zone_1",
  health: 100
});

// A list to track connected visual clients and workers
const workers = new Set();
let broadcastStateInterval;

server.transport.onClientConnect = (clientId) => {
    console.log(`[Demo] Network Node Connected: ${clientId}`);
    workers.add(clientId);
};

server.transport.onClientDisconnect = (clientId) => {
    console.log(`[Demo] Network Node Disconnected: ${clientId}`);
    workers.delete(clientId);
};

server.start();

// Custom Tick Hook: Assign Tasks to valid workers
server.tickController.onTick((tick, dt) => {
    // We want to simulate Physics 60 times a second.
    // Instead of doing it on server, we ask our workers!

    // Wait until we have at least 1-3 workers to test consensus
    if (workers.size >= 1) {
        
        // Let's create a physics microtask
        const task = server.taskScheduler.createMicrotask(
            MicrotaskType.PHYSICS_STEP,
            entityId,
            { dt, currentPos: server.stateAnchor.read(entityId)?.position },
            tick
        );

        // Assign to up to 3 workers (Redundancy)
        const assigned = server.taskScheduler.assignTask(task, Array.from(workers), 3);

        if (assigned.length > 0) {
            // Send the task to assigned workers
            assigned.forEach(workerId => {
               server.transport.sendTo(workerId, 9 /* ASSIGN_TASK */, { task });
            });
        }
    }
});

// Receive Votes from clients
server.transport.registerHandler(0x11 /* CONSENSUS_VOTE */, (clientId, payload) => {
    // Console log to show action on server 
    // console.log(`Received vote from ${clientId} for task ${payload.taskId}`);
    
    const result = server.consensus.submitVote(payload);
    
    // If consensus is reached
    if (result) {
        // Resolve task from scheduler load
        server.taskScheduler.resolveTask(result.taskId);
        
        // 5. State Anchor Integration (Minimal Correction)
        const winnerObj = result.winner.resultData;
        const currentState = server.stateAnchor.read(entityId);
        if (currentState) {
            currentState.position = winnerObj.position;
            currentState.tick = result.tick;
            server.stateAnchor.write(entityId, currentState);
        }
    }
});

server.consensus.onDivergence = (taskId, votes) => {
    console.warn(`[ANTI-CHEAT] Divergence detected on task ${taskId}!`);
    console.warn(`Votes submitted:`, votes.map(v => v.result.newStateHash));
    broadcastLog(`⚠️ Divergence detected: Discarded fake hash, penalizing cheater...`);
};

server.consensus.onSuspiciousClient = (clientId, points) => {
    console.warn(`[ANTI-CHEAT] Node ${clientId} penalized +${points} trust points.`);
};

// Sync State Down explicitly for demo UI updates
setInterval(() => {
    const currentState = server.stateAnchor.read(entityId);
    if (currentState) {
        server.transport.broadcast(0x02 /* STATE_UPDATE */, {
            entities: [currentState],
            tick: server.tickController.getCurrentTick()
        });
    }
}, 50);

function broadcastLog(message) {
    server.transport.broadcast(0xff /* DEMO_LOG */, { message });
}

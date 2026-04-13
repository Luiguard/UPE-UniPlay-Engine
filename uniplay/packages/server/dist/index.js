import { TickController } from './TickController.js';
import { StateAnchor } from './StateAnchor.js';
import { WSTransportServer } from './transport/WebSocketServerTransport.js';
import { ConsensusEngine } from './consensus/ConsensusEngine.js';
import { TaskScheduler } from './consensus/TaskScheduler.js';
import { ZoneManager } from './zones/ZoneManager.js';
export * from './TickController.js';
export * from './StateAnchor.js';
export * from './transport/WebSocketServerTransport.js';
export * from './consensus/ConsensusEngine.js';
export * from './consensus/TaskScheduler.js';
export * from './zones/ZoneManager.js';
import { DEFAULT_SERVER_CONFIG } from '@uniplay/core';
export class UniPlayServer {
    config;
    tickController;
    transport;
    stateAnchor;
    consensus;
    taskScheduler;
    zoneManager;
    constructor(config = {}) {
        this.config = { ...DEFAULT_SERVER_CONFIG, ...config };
        this.tickController = new TickController(this.config.tickRate);
        this.transport = new WSTransportServer(this.config.port);
        this.stateAnchor = new StateAnchor();
        this.consensus = new ConsensusEngine(this.config.consensusQuorum);
        this.taskScheduler = new TaskScheduler();
        this.zoneManager = new ZoneManager(this.stateAnchor);
        this.config.zones.forEach(z => this.zoneManager.registerZone(z));
        this.setupInternals();
    }
    setupInternals() {
        // Step 8: Penalize on divergence
        this.consensus.onSuspiciousClient = (clientId, points) => {
            this.taskScheduler.penalizeClient(clientId, points);
        };
        this.tickController.onTick((tick, deltaTime) => {
            // 1. Process network packets
            // 2. Perform authoritative logic / apply consensus updates
            // Here we would dispatch tasks to clients via TaskScheduler
            // 3. Clear old consensus tasks
            if (tick % 60 === 0) {
                this.consensus.cleanupOldTasks(tick);
            }
            // 4. Broadcast Heartbeat
            if (tick % (this.config.tickRate / 2) === 0) {
                this.transport.broadcast(1 /* HEARTBEAT */, {
                    serverTick: tick,
                    serverTime: Date.now()
                });
            }
        });
    }
    start() {
        console.log(`[UniPlayServer] Starting server on port ${this.config.port}...`);
        this.tickController.start();
    }
    stop() {
        console.log(`[UniPlayServer] Stopping server...`);
        this.tickController.stop();
        this.transport.close();
    }
}
//# sourceMappingURL=index.js.map
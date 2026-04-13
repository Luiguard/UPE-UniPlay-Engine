import { TaskScheduler } from './consensus/taskScheduler.js';
import { ConsensusManager } from './consensus/consensusManager.js';
import { WebSocketServer } from './transport/WebSocketServer.js';
import { ZoneManager } from './zones/zoneManager.js';
const config = {
    tickRate: 60,
    port: 8080,
    maxPlayers: 100,
    zones: [],
    maxClientLead: 2,
    consensusQuorum: 2,
    heartbeatInterval: 1000,
    stateHashInterval: 60,
};
class UniPlayServer {
    taskScheduler;
    consensusManager;
    wsServer;
    zoneManager;
    tickInterval = null;
    currentTick = 0;
    constructor() {
        this.taskScheduler = new TaskScheduler();
        this.consensusManager = new ConsensusManager();
        this.wsServer = new WebSocketServer(config.port);
        this.zoneManager = new ZoneManager();
        // Initial Zone
        this.zoneManager.addZone({ id: 'zone1', bounds: { x: 0, y: 0, width: 100, height: 100 } });
        // Hier Message-Handler hinzufügen
        this.setupMessageHandlers();
    }
    start() {
        console.log('Starting UniPlay Server...');
        this.tickInterval = setInterval(() => this.tick(), 1000 / config.tickRate);
    }
    stop() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
        }
        console.log('Server stopped.');
    }
    tick() {
        this.currentTick++;
        // Simuliere Task-Zuweisung
        const clients = ['client1', 'client2'];
        const tasks = this.taskScheduler.assignTasks(clients, 'zone1', 'entity1');
        // Sende Tasks an Clients
        tasks.forEach(task => {
            this.wsServer.sendToClient(task.assignedClients[0], {
                type: 0x09, // MICROTASK_ASSIGN
                tick: this.currentTick,
                timestamp: Date.now(),
                payload: { tasks: [task] },
            });
        });
        // Verarbeite Consensus
        // Mock: Angenommen ein Consensus-Result kommt herein
        const mockResult = {
            taskId: 'task1',
            winner: { entityId: 'entity1', position: { x: 1, y: 1, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, rotation: 0, flags: 0, objectState: 0, tick: this.currentTick, zoneId: 'zone1', health: 100 },
            confidence: 1,
            voterCount: 2,
            tick: this.currentTick,
        };
        this.applyConsensusResult(mockResult);
    }
    applyConsensusResult(result) {
        // Aktualisiere Entity-State
        this.zoneManager.assignEntityToZone(result.winner.entityId, result.winner);
        console.log(`Applied consensus for ${result.winner.entityId}: position ${result.winner.position.x}, ${result.winner.position.y}`);
    }
    setupMessageHandlers() {
        // Placeholder: Höre auf MICROTASK_RESULT, submit Vote
        // Z.B. this.wsServer.onMessage((clientId, message) => { ... });
    }
}
// Start Server
const server = new UniPlayServer();
server.start();
// Graceful shutdown
process.on('SIGINT', () => {
    server.stop();
    process.exit(0);
});
//# sourceMappingURL=index.js.map
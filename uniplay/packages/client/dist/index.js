import { TaskExecutor } from './taskExecutor.js';
import { WebSocketClient } from './transport/WebSocketClient.js';
const config = {
    serverUrl: 'ws://localhost:8080',
    prediction: true,
    reconciliation: 'smooth',
    inputBufferSize: 18,
    visualSmoothing: true,
    lerpSpeed: 0.08,
    jitterBufferSize: 3,
    deadReckoning: true,
};
class UniPlayClient {
    taskExecutor;
    wsClient;
    clientId;
    constructor(clientId) {
        this.clientId = clientId;
        this.taskExecutor = new TaskExecutor(clientId);
        this.wsClient = new WebSocketClient(config.serverUrl, clientId);
        this.setupMessageHandlers();
    }
    setupMessageHandlers() {
        // Placeholder: Höre auf MICROTASK_ASSIGN, führe aus, sende MICROTASK_RESULT
    }
    start() {
        console.log(`Starting UniPlay Client ${this.clientId}...`);
        // Simuliere Task-Empfang und -Ausführung
        setTimeout(() => {
            // Mock Task
            const mockTask = {
                id: 'task1',
                type: 'physics_update',
                data: { entityId: 'entity1', state: { entityId: 'entity1', position: { x: 0, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, rotation: 0, flags: 0, objectState: 0 } },
                assignedClients: [this.clientId],
                deadline: Date.now() + 10,
                maxExecutionTime: 2,
            };
            (async () => {
                const results = await this.taskExecutor.executeTasks([mockTask]);
                // Sende Ergebnisse zurück
                this.wsClient.sendMessage({
                    type: 0x15, // MICROTASK_RESULT
                    tick: 1,
                    timestamp: Date.now(),
                    payload: { results },
                });
            })();
        }, 1000);
    }
}
// Start Client
const client = new UniPlayClient('client1');
client.start();
//# sourceMappingURL=index.js.map
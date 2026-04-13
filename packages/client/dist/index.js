import { DEFAULT_CLIENT_CONFIG } from '@uniplay/core';
import { TickSync } from './TickSync.js';
import { WSClientTransport } from './transport/WebSocketClientTransport.js';
import { ClientPrediction } from './prediction/ClientPrediction.js';
import { TaskExecutor } from './prediction/TaskExecutor.js';
import { VisualSmoothing } from './visual/VisualSmoothing.js';
export * from './TickSync.js';
export * from './transport/WebSocketClientTransport.js';
export * from './prediction/ClientPrediction.js';
export * from './prediction/TaskExecutor.js';
export * from './visual/VisualSmoothing.js';
export * from './api/DualConnectionManager.js';
export class UniPlayClient {
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
        this.transport.registerHandler(1 /* HEARTBEAT */, (payload) => {
            this.transport.updatePing(Date.now() - payload.serverTime);
            this.tickSync.onHeartbeat(payload.serverTick, payload.serverTime, this.transport.getPing());
        });
        this.transport.registerHandler(9 /* ASSIGN_TASK */, (payload) => {
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
        if (this.animationFrameId)
            cancelAnimationFrame(this.animationFrameId);
    }
    sendInput(input) {
        if (!this.connected)
            return;
        const frame = {
            ...input,
            tick: this.tickSync.getCurrentTick(),
            timestamp: Date.now()
        };
        this.transport.sendPacket(0x10 /* INPUT */, { frames: [frame] });
    }
}
//# sourceMappingURL=index.js.map
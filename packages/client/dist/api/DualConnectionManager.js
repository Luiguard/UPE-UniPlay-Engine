import { UniPlayClient } from '../index.js';
/**
 * DualConnectionManager
 *
 * Routes high-frequency physics data to UniPlay (UDP/WebSocket)
 * and low-frequency game logic (Chat, Inventory) to the Host Game Server.
 *
 * Works in both Browser (native WebSocket) and Node.js (ws package).
 */
export class DualConnectionManager {
    uniPlayWorker;
    hostSocket = null; // WebSocket instance (browser or ws)
    hostUrl;
    connected = false;
    constructor(uniPlayUrl, hostEngineUrl, clientId) {
        this.hostUrl = hostEngineUrl;
        // 1. UniPlay connection for physics consensus (high frequency)
        this.uniPlayWorker = new UniPlayClient(clientId, { serverUrl: uniPlayUrl });
    }
    /**
     * Establish both connections.
     * Call this instead of manually connecting each socket.
     */
    async connect() {
        // Resolve WebSocket class for the current environment
        const WS = await this.resolveWebSocket();
        return new Promise((resolve, reject) => {
            this.hostSocket = new WS(this.hostUrl);
            this.hostSocket.onopen = () => {
                console.log(`[DualConnection] Connected to Host Engine at ${this.hostUrl}`);
                // Connect physics layer only after host auth succeeds
                this.uniPlayWorker.connect().then(() => {
                    this.connected = true;
                    resolve();
                }).catch(reject);
            };
            this.hostSocket.onerror = (err) => {
                reject(new Error(`Host connection failed: ${err.message || err}`));
            };
            this.hostSocket.onclose = () => {
                this.connected = false;
                console.log(`[DualConnection] Host connection closed.`);
            };
        });
    }
    /**
     * Route data to the correct connection based on category.
     */
    send(category, data) {
        if (!this.connected)
            return;
        if (category === 'physics' || category === 'input') {
            // Fast path → UniPlay Mesh (60 Hz, consensus-verified)
            this.uniPlayWorker.sendInput(data);
        }
        else {
            // Slow reliable path → Host Game Engine (TCP, ordered)
            if (this.hostSocket && this.hostSocket.readyState === 1 /* OPEN */) {
                const payload = JSON.stringify({ type: category, payload: data });
                this.hostSocket.send(payload);
            }
        }
    }
    disconnect() {
        this.connected = false;
        this.uniPlayWorker.disconnect();
        if (this.hostSocket) {
            this.hostSocket.close();
            this.hostSocket = null;
        }
    }
    /**
     * Detect environment and return the correct WebSocket constructor.
     * Browser: native WebSocket. Node.js: dynamic import of 'ws'.
     */
    async resolveWebSocket() {
        if (typeof globalThis.WebSocket !== 'undefined') {
            return globalThis.WebSocket; // Browser
        }
        try {
            const wsModule = await import('ws');
            return wsModule.default || wsModule.WebSocket;
        }
        catch {
            throw new Error('[DualConnection] No WebSocket available. In Node.js, install "ws": npm install ws');
        }
    }
}
//# sourceMappingURL=DualConnectionManager.js.map
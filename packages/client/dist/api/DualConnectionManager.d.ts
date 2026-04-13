import { UniPlayClient } from '../index.js';
/**
 * DualConnectionManager
 *
 * Routes high-frequency physics data to UniPlay (UDP/WebSocket)
 * and low-frequency game logic (Chat, Inventory) to the Host Game Server.
 *
 * Works in both Browser (native WebSocket) and Node.js (ws package).
 */
export declare class DualConnectionManager {
    uniPlayWorker: UniPlayClient;
    hostSocket: any;
    private hostUrl;
    private connected;
    constructor(uniPlayUrl: string, hostEngineUrl: string, clientId: string);
    /**
     * Establish both connections.
     * Call this instead of manually connecting each socket.
     */
    connect(): Promise<void>;
    /**
     * Route data to the correct connection based on category.
     */
    send(category: 'physics' | 'input' | 'inventory' | 'chat', data: any): void;
    disconnect(): void;
    /**
     * Detect environment and return the correct WebSocket constructor.
     * Browser: native WebSocket. Node.js: dynamic import of 'ws'.
     */
    private resolveWebSocket;
}
//# sourceMappingURL=DualConnectionManager.d.ts.map
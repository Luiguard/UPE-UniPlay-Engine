import { WebSocketServer, WebSocket } from 'ws';
export class WSTransportServer {
    wss;
    clients = new Map();
    messageHandlers = new Map();
    // connection callbacks
    onClientConnect = null;
    onClientDisconnect = null;
    constructor(port) {
        this.wss = new WebSocketServer({ port });
        this.wss.on('connection', (ws) => {
            const clientId = this.generateClientId();
            this.clients.set(clientId, ws);
            if (this.onClientConnect) {
                this.onClientConnect(clientId);
            }
            ws.on('message', (message, isBinary) => {
                // Assume binary protocol decoding here (flatbuffers/msgpack)
                // For SDK skeleton, we just parse JSON to simulate the binary payload
                try {
                    const packet = JSON.parse(message.toString());
                    const handler = this.messageHandlers.get(packet.type);
                    if (handler) {
                        handler(clientId, packet.payload);
                    }
                }
                catch (e) {
                    console.error("Failed to parse packet", e);
                }
            });
            ws.on('close', () => {
                this.clients.delete(clientId);
                if (this.onClientDisconnect) {
                    this.onClientDisconnect(clientId);
                }
            });
        });
    }
    registerHandler(type, handler) {
        this.messageHandlers.set(type, handler);
    }
    sendTo(clientId, type, payload) {
        const ws = this.clients.get(clientId);
        if (!ws || ws.readyState !== WebSocket.OPEN)
            return;
        // Simulate binary encode
        const packet = JSON.stringify({ type, payload });
        ws.send(packet);
    }
    broadcast(type, payload) {
        const packet = JSON.stringify({ type, payload });
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(packet);
            }
        });
    }
    generateClientId() {
        return Math.random().toString(36).substring(2, 10);
    }
    close() {
        this.wss.close();
    }
}
//# sourceMappingURL=WebSocketServerTransport.js.map
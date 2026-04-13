import * as WebSocket from 'ws';
export class WebSocketServer {
    wss;
    clients = new Map();
    constructor(port) {
        this.wss = new WebSocket.Server({ port });
        this.wss.on('connection', (ws, req) => {
            const clientId = req.url?.split('?id=')[1] || 'unknown';
            this.clients.set(clientId, ws);
            ws.on('message', (data) => this.handleMessage(clientId, data));
            ws.on('close', () => this.clients.delete(clientId));
        });
    }
    sendToClient(clientId, message) {
        const ws = this.clients.get(clientId);
        if (ws) {
            ws.send(JSON.stringify(message));
        }
    }
    broadcast(message) {
        this.clients.forEach(ws => ws.send(JSON.stringify(message)));
    }
    handleMessage(clientId, data) {
        const message = JSON.parse(data.toString());
        // Hier Events emittieren oder Handler aufrufen
        console.log(`Message from ${clientId}:`, message);
    }
}
//# sourceMappingURL=WebSocketServer.js.map
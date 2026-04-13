import * as WebSocket from 'ws';
export class WebSocketClient {
    ws;
    constructor(serverUrl, clientId) {
        this.ws = new WebSocket(`${serverUrl}?id=${clientId}`);
        this.ws.on('open', () => console.log('Connected to server'));
        this.ws.on('message', (data) => this.handleMessage(data));
        this.ws.on('close', () => console.log('Disconnected'));
    }
    sendMessage(message) {
        this.ws.send(JSON.stringify(message));
    }
    handleMessage(data) {
        const message = JSON.parse(data.toString());
        // Handler für eingehende Messages
        console.log('Received:', message);
    }
}
//# sourceMappingURL=WebSocketClient.js.map
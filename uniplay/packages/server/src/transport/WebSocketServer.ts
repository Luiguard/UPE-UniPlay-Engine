import * as WebSocket from 'ws';
import { MessageType, NetworkMessage, MicrotaskAssignPayload, MicrotaskResultPayload } from '@uniplay/core';

export class WebSocketServer {
  private wss: any;
  private clients: Map<string, any> = new Map();

  constructor(port: number) {
    this.wss = new (WebSocket as any).Server({ port });
    this.wss.on('connection', (ws: any, req: any) => {
      const clientId = req.url?.split('?id=')[1] || 'unknown';
      this.clients.set(clientId, ws);
      ws.on('message', (data: any) => this.handleMessage(clientId, data));
      ws.on('close', () => this.clients.delete(clientId));
    });
  }

  sendToClient(clientId: string, message: NetworkMessage) {
    const ws = this.clients.get(clientId);
    if (ws) {
      ws.send(JSON.stringify(message));
    }
  }

  broadcast(message: NetworkMessage) {
    this.clients.forEach(ws => ws.send(JSON.stringify(message)));
  }

  private handleMessage(clientId: string, data: WebSocket.Data) {
    const message: NetworkMessage = JSON.parse(data.toString());
    // Hier Events emittieren oder Handler aufrufen
    console.log(`Message from ${clientId}:`, message);
  }
}
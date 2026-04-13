import { WebSocketServer, WebSocket } from 'ws';
import { Transport, MessageType, ClientID } from '@uniplay/core';

export class WSTransportServer {
  private wss: WebSocketServer;
  private clients: Map<ClientID, WebSocket> = new Map();
  private messageHandlers: Map<MessageType, (clientId: ClientID, payload: any) => void> = new Map();
  
  // connection callbacks
  public onClientConnect: ((clientId: ClientID) => void) | null = null;
  public onClientDisconnect: ((clientId: ClientID) => void) | null = null;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);
      
      if (this.onClientConnect) {
        this.onClientConnect(clientId);
      }

      ws.on('message', (message: Buffer, isBinary: boolean) => {
        // Assume binary protocol decoding here (flatbuffers/msgpack)
        // For SDK skeleton, we just parse JSON to simulate the binary payload
        try {
          const packet = JSON.parse(message.toString());
          const handler = this.messageHandlers.get(packet.type);
          if (handler) {
            handler(clientId, packet.payload);
          }
        } catch (e) {
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

  public registerHandler(type: MessageType, handler: (clientId: ClientID, payload: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  public sendTo(clientId: ClientID, type: MessageType, payload: any): void {
    const ws = this.clients.get(clientId);
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    
    // Simulate binary encode
    const packet = JSON.stringify({ type, payload });
    ws.send(packet);
  }

  public broadcast(type: MessageType, payload: any): void {
    const packet = JSON.stringify({ type, payload });
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(packet);
      }
    });
  }

  private generateClientId(): ClientID {
    return Math.random().toString(36).substring(2, 10);
  }

  public close(): void {
    this.wss.close();
  }
}

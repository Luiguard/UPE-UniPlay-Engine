import * as WebSocket from 'ws';
import { NetworkMessage } from '@uniplay/core';

export class WebSocketClient {
  private ws: any;

  constructor(serverUrl: string, clientId: string) {
    this.ws = new (WebSocket as any)(`${serverUrl}?id=${clientId}`);
    this.ws.on('open', () => console.log('Connected to server'));
    this.ws.on('message', (data: any) => this.handleMessage(data));
    this.ws.on('close', () => console.log('Disconnected'));
  }

  sendMessage(message: NetworkMessage) {
    this.ws.send(JSON.stringify(message));
  }

  private handleMessage(data: WebSocket.Data) {
    const message: NetworkMessage = JSON.parse(data.toString());
    // Handler für eingehende Messages
    console.log('Received:', message);
  }
}
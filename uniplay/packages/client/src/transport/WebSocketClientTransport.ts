import { Transport, MessageType } from '@uniplay/core';

export class WSClientTransport implements Transport {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<MessageType, (payload: any) => void> = new Map();
  
  private ping: number = 0;
  private jitter: number = 0;
  private pings: number[] = [];
  
  public onConnect: (() => void) | null = null;
  public onDisconnect: (() => void) | null = null;

  public async connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        if (this.onConnect) this.onConnect();
        resolve();
      };
      
      this.ws.onerror = (err) => {
        reject(err);
      };
      
      this.ws.onclose = () => {
        if (this.onDisconnect) this.onDisconnect();
      };
      
      this.ws.onmessage = async (event) => {
        let msgStr: string;
        
        // Handle Blob if browser environment
        if (typeof Blob !== 'undefined' && event.data instanceof Blob) {
          msgStr = await event.data.text();
        } else {
          msgStr = event.data.toString();
        }

        try {
          const packet = JSON.parse(msgStr);
          const handler = this.messageHandlers.get(packet.type);
          if (handler) {
            handler(packet.payload);
          }
        } catch (e) {
          console.error("Failed to parse packet", e);
        }
      };
    });
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public send(channel: string, data: Uint8Array): void {
    // We ignore channel here and use WebSocket text for the skeleton
    // The `sendPacket` method takes care of actual formatting
  }
  
  public sendPacket(type: MessageType, payload: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type, payload }));
  }

  public onMessage(channel: string, handler: (data: Uint8Array) => void): void {
    // Unused in basic setup without channels
  }
  
  public registerHandler(type: MessageType, handler: (payload: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  public getPing(): number {
    return this.ping;
  }

  public getJitter(): number {
    return this.jitter;
  }

  public getPacketLoss(): number {
    return 0; // Requires sequence number tracking
  }
  
  // Call this when processing heartbeats to calculate ping/jitter
  public updatePing(rtt: number): void {
    this.pings.push(rtt);
    if (this.pings.length > 10) this.pings.shift();
    
    let sum = 0;
    for (let p of this.pings) sum += p;
    this.ping = sum / this.pings.length;
    
    // Simple jitter math (variance of recent pings)
    let variance = 0;
    for (let p of this.pings) variance += Math.abs(p - this.ping);
    this.jitter = variance / this.pings.length;
  }
}

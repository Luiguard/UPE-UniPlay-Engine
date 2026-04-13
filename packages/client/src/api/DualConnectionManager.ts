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
  public uniPlayWorker: UniPlayClient;
  public hostSocket: any = null; // WebSocket instance (browser or ws)
  private hostUrl: string;
  private connected: boolean = false;

  constructor(uniPlayUrl: string, hostEngineUrl: string, clientId: string) {
    this.hostUrl = hostEngineUrl;

    // 1. UniPlay connection for physics consensus (high frequency)
    this.uniPlayWorker = new UniPlayClient(clientId, { serverUrl: uniPlayUrl });
  }

  /**
   * Establish both connections.
   * Call this instead of manually connecting each socket.
   */
  public async connect(): Promise<void> {
    // Resolve WebSocket class for the current environment
    const WS = await this.resolveWebSocket();

    return new Promise<void>((resolve, reject) => {
      this.hostSocket = new WS(this.hostUrl);

      this.hostSocket.onopen = () => {
        console.log(`[DualConnection] Connected to Host Engine at ${this.hostUrl}`);
        // Connect physics layer only after host auth succeeds
        this.uniPlayWorker.connect().then(() => {
          this.connected = true;
          resolve();
        }).catch(reject);
      };

      this.hostSocket.onerror = (err: any) => {
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
  public send(category: 'physics' | 'input' | 'inventory' | 'chat', data: any): void {
    if (!this.connected) return;

    if (category === 'physics' || category === 'input') {
      // Fast path → UniPlay Mesh (60 Hz, consensus-verified)
      this.uniPlayWorker.sendInput(data);
    } else {
      // Slow reliable path → Host Game Engine (TCP, ordered)
      if (this.hostSocket && this.hostSocket.readyState === 1 /* OPEN */) {
        const payload = JSON.stringify({ type: category, payload: data });
        this.hostSocket.send(payload);
      }
    }
  }

  public disconnect(): void {
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
  private async resolveWebSocket(): Promise<any> {
    if (typeof globalThis.WebSocket !== 'undefined') {
      return globalThis.WebSocket; // Browser
    }
    try {
      const wsModule = await import('ws');
      return wsModule.default || wsModule.WebSocket;
    } catch {
      throw new Error(
        '[DualConnection] No WebSocket available. In Node.js, install "ws": npm install ws'
      );
    }
  }
}

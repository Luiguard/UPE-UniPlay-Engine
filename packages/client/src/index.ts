import { ClientConfig, DEFAULT_CLIENT_CONFIG, EntityState, InputFrame } from '@uniplay/core';
import { TickSync } from './TickSync.js';
import { WSClientTransport } from './transport/WebSocketClientTransport.js';
import { ClientPrediction } from './prediction/ClientPrediction.js';
import { TaskExecutor } from './prediction/TaskExecutor.js';
import { VisualSmoothing } from './visual/VisualSmoothing.js';

export * from './TickSync.js';
export * from './transport/WebSocketClientTransport.js';
export * from './prediction/ClientPrediction.js';
export * from './prediction/TaskExecutor.js';
export * from './visual/VisualSmoothing.js';
export * from './api/DualConnectionManager.js';

export class UniPlayClient {
  public config: ClientConfig;
  public clientId: string;
  public tickSync: TickSync;
  public transport: WSClientTransport;
  public prediction: ClientPrediction;
  public taskExecutor: TaskExecutor;
  public visual: VisualSmoothing;

  private connected: boolean = false;
  private animationFrameId: number = 0;

  constructor(clientId: string, config: Partial<ClientConfig> = {}) {
    this.clientId = clientId;
    this.config = { ...DEFAULT_CLIENT_CONFIG, ...config };
    
    this.tickSync = new TickSync(60, 2);
    this.transport = new WSClientTransport();
    this.prediction = new ClientPrediction();
    this.taskExecutor = new TaskExecutor(this.clientId, this.transport, this.tickSync);
    this.visual = new VisualSmoothing();

    this.setupInternals();
  }

  private setupInternals(): void {
    this.transport.registerHandler(1 /* HEARTBEAT */, (payload: { serverTick: number, serverTime: number }) => {
      this.transport.updatePing(Date.now() - payload.serverTime);
      this.tickSync.onHeartbeat(payload.serverTick, payload.serverTime, this.transport.getPing());
    });

    this.transport.registerHandler(9 /* ASSIGN_TASK */, (payload: any) => {
      this.taskExecutor.executeTask(payload.task);
    });
  }

  public async connect(): Promise<void> {
    console.log(`[UniPlayClient] Connecting to ${this.config.serverUrl}...`);
    await this.transport.connect(this.config.serverUrl);
    this.connected = true;
  }

  public disconnect(): void {
    this.connected = false;
    this.transport.disconnect();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  public sendInput(input: Omit<InputFrame, 'tick' | 'timestamp'>): void {
      if (!this.connected) return;
      
      const frame: InputFrame = {
          ...input,
          tick: this.tickSync.getCurrentTick(),
          timestamp: Date.now()
      };
      
      this.transport.sendPacket(0x10 /* INPUT */, { frames: [frame] });
  }
}
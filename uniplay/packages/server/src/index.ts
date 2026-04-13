import { TickController } from './TickController.js';
import { StateAnchor } from './StateAnchor.js';
import { WSTransportServer } from './transport/WebSocketServerTransport.js';
import { ConsensusEngine } from './consensus/ConsensusEngine.js';
import { TaskScheduler } from './consensus/TaskScheduler.js';
import { ZoneManager } from './zones/ZoneManager.js';
import { InterestManager } from './network/InterestManager.js';
import { EdgeCoordinator } from './network/EdgeCoordinator.js';

export * from './TickController.js';
export * from './StateAnchor.js';
export * from './transport/WebSocketServerTransport.js';
export * from './consensus/ConsensusEngine.js';
export * from './consensus/TaskScheduler.js';
export * from './zones/ZoneManager.js';
export * from './network/InterestManager.js';
export * from './network/EdgeCoordinator.js';

import { ServerConfig, DEFAULT_SERVER_CONFIG } from '@uniplay/core';

export class UniPlayServer {
  public config: ServerConfig;
  public tickController: TickController;
  public transport: WSTransportServer;
  public stateAnchor: StateAnchor;
  public consensus: ConsensusEngine;
  public taskScheduler: TaskScheduler;
  public zoneManager: ZoneManager;
  public interestManager: InterestManager;
  public edgeCoordinator: EdgeCoordinator;

  constructor(config: Partial<ServerConfig> = {}) {
    this.config = { ...DEFAULT_SERVER_CONFIG, ...config };
    
    this.tickController = new TickController(this.config.tickRate);
    this.transport = new WSTransportServer(this.config.port);
    this.stateAnchor = new StateAnchor();
    this.consensus = new ConsensusEngine(this.config.consensusQuorum);
    this.taskScheduler = new TaskScheduler();
    this.zoneManager = new ZoneManager(this.stateAnchor);
    this.interestManager = new InterestManager(this.stateAnchor, this.config.interestRadius);
    this.edgeCoordinator = new EdgeCoordinator();

    this.config.zones.forEach(z => this.zoneManager.registerZone(z));

    this.setupInternals();
  }

  private setupInternals(): void {
    this.consensus.onSuspiciousClient = (clientId, points) => {
      this.taskScheduler.penalizeClient(clientId, points);
    };

    this.tickController.onTick((tick, deltaTime) => {
      if (tick % 60 === 0) {
        this.consensus.cleanupOldTasks(tick);
      }

      if (tick % (this.config.tickRate / 2) === 0) {
        this.transport.broadcast(1 /* HEARTBEAT */, {
          serverTick: tick,
          serverTime: Date.now()
        });
      }
    });
  }

  public start(): void {
    console.log(`[UniPlayServer] Starting server on port ${this.config.port}...`);
    this.tickController.start();
  }

  public stop(): void {
    console.log(`[UniPlayServer] Stopping server...`);
    this.tickController.stop();
    this.transport.close();
  }
}
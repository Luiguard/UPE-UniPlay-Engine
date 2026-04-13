import { TickController } from './TickController.js';
import { StateAnchor } from './StateAnchor.js';
import { WSTransportServer } from './transport/WebSocketServerTransport.js';
import { ConsensusEngine } from './consensus/ConsensusEngine.js';
import { TaskScheduler } from './consensus/TaskScheduler.js';
import { ZoneManager } from './zones/ZoneManager.js';
import { InterestManager } from './network/InterestManager.js';
import { EdgeCoordinator } from './network/EdgeCoordinator.js';
import { MetricsRegistry } from './MetricsRegistry.js';
import { RedisStateAnchor } from './RedisStateAnchor.js';
import { HostGateway } from './api/HostGateway.js';
import { WebhookEmitter } from './api/WebhookEmitter.js';

export * from './TickController.js';
export * from './StateAnchor.js';
export * from './transport/WebSocketServerTransport.js';
export * from './consensus/ConsensusEngine.js';
export * from './consensus/TaskScheduler.js';
export * from './zones/ZoneManager.js';
export * from './network/InterestManager.js';
export * from './network/EdgeCoordinator.js';
export * from './MetricsRegistry.js';
export * from './RedisStateAnchor.js';
export * from './api/HostGateway.js';
export * from './api/WebhookEmitter.js';

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
  public metrics: MetricsRegistry; // Enterprise Telemetry
  public hostGateway: HostGateway;
  public webhook: WebhookEmitter;

  constructor(config: Partial<ServerConfig> = {}, redisClient?: any, webhookUrl: string = 'http://localhost:8080/uniplay/webhook') {
    this.config = { ...DEFAULT_SERVER_CONFIG, ...config };
    
    this.tickController = new TickController(this.config.tickRate);
    this.transport = new WSTransportServer(this.config.port);
    
    // Enterprise HA support
    if (redisClient) {
        this.stateAnchor = new RedisStateAnchor(redisClient);
    } else {
        this.stateAnchor = new StateAnchor();
    }
    
    this.consensus = new ConsensusEngine(this.config.consensusQuorum);
    this.taskScheduler = new TaskScheduler();
    this.zoneManager = new ZoneManager(this.stateAnchor);
    this.interestManager = new InterestManager(this.stateAnchor, this.config.interestRadius);
    this.edgeCoordinator = new EdgeCoordinator();
    this.metrics = new MetricsRegistry();
    this.webhook = new WebhookEmitter(webhookUrl);
    
    // Start IPC REST API for local host game processes
    this.hostGateway = new HostGateway(this.stateAnchor, this.zoneManager, this.tickController, this.config.port + 1);

    this.config.zones.forEach(z => this.zoneManager.registerZone(z));

    this.setupInternals();
  }

  private setupInternals(): void {
    this.consensus.onSuspiciousClient = (clientId, points) => {
      this.taskScheduler.penalizeClient(clientId, points);
      this.metrics.increment('uniplay_security_suspicious_votes_total'); // Telemetry
      
      // Fire Webhook back to Host Engine (Spigot to kick player)
      this.webhook.notifyCheatDetected(clientId, points, "Consensus Hash Divergence");
    };

    this.tickController.onTick((tick, deltaTime) => {
      this.metrics.gauge('uniplay_active_tasks_count', this.consensus['pendingVotes']?.size || 0);

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

    // Simple hack to log metrics continuously for demo
    // setInterval(() => console.log(this.metrics.getPrometheusMetrics()), 10000);
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
import { TickController } from './TickController.js';
import { StateAnchor } from './StateAnchor.js';
import { WSTransportServer } from './transport/WebSocketServerTransport.js';
import { ConsensusEngine } from './consensus/ConsensusEngine.js';
import { TaskScheduler } from './consensus/TaskScheduler.js';
import { ZoneManager } from './zones/ZoneManager.js';
export * from './TickController.js';
export * from './StateAnchor.js';
export * from './transport/WebSocketServerTransport.js';
export * from './consensus/ConsensusEngine.js';
export * from './consensus/TaskScheduler.js';
export * from './zones/ZoneManager.js';
import { ServerConfig } from '@uniplay/core';
export declare class UniPlayServer {
    config: ServerConfig;
    tickController: TickController;
    transport: WSTransportServer;
    stateAnchor: StateAnchor;
    consensus: ConsensusEngine;
    taskScheduler: TaskScheduler;
    zoneManager: ZoneManager;
    constructor(config?: Partial<ServerConfig>);
    private setupInternals;
    start(): void;
    stop(): void;
}
//# sourceMappingURL=index.d.ts.map
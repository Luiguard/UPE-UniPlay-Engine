import { ClientConfig, InputFrame } from '@uniplay/core';
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
export declare class UniPlayClient {
    config: ClientConfig;
    clientId: string;
    tickSync: TickSync;
    transport: WSClientTransport;
    prediction: ClientPrediction;
    taskExecutor: TaskExecutor;
    visual: VisualSmoothing;
    private connected;
    private animationFrameId;
    constructor(clientId: string, config?: Partial<ClientConfig>);
    private setupInternals;
    connect(): Promise<void>;
    disconnect(): void;
    sendInput(input: Omit<InputFrame, 'tick' | 'timestamp'>): void;
}
//# sourceMappingURL=index.d.ts.map
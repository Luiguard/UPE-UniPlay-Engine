import { Microtask, ClientID } from '@uniplay/core';
import { WSClientTransport, TickSync } from '../index.js';
export declare class TaskExecutor {
    private clientId;
    private transport;
    private tickSync;
    handlers: Map<number, (task: Microtask) => any>;
    constructor(clientId: ClientID, transport: WSClientTransport, tickSync: TickSync);
    registerHandler(type: number, handler: (task: Microtask) => any): void;
    executeTask(task: Microtask): void;
    private distributeWork;
    private submitVote;
    private computeHash;
}
//# sourceMappingURL=TaskExecutor.d.ts.map
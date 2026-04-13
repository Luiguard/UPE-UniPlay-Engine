import { Microtask, MicrotaskResult, ClientID } from '@uniplay/core';
export declare class TaskExecutor {
    private clientId;
    constructor(clientId: ClientID);
    /**
     * Execute assigned microtasks
     */
    executeTasks(tasks: Microtask[]): Promise<MicrotaskResult[]>;
    private executeWithTimeout;
    /**
     * Execute a single task
     */
    private executeTask;
}
//# sourceMappingURL=taskExecutor.d.ts.map
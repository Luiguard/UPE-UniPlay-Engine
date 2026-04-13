import { Microtask, ClientID, TaskID, MicrotaskType, Tick } from '@uniplay/core';
export declare class TaskScheduler {
    private activeTasks;
    private assignedClients;
    private clientLoad;
    private clientScore;
    constructor();
    createMicrotask(type: MicrotaskType, targetId: string, data: any, currentTick: Tick): Microtask;
    assignTask(task: Microtask, availableClients: ClientID[], redundancy?: number): ClientID[];
    resolveTask(taskId: TaskID): void;
    penalizeClient(clientId: ClientID, strikePoints: number): void;
    private revokeAllTasks;
    private generateId;
}
//# sourceMappingURL=TaskScheduler.d.ts.map
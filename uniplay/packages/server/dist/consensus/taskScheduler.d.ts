import { ClientID, Microtask, TaskID, ZoneID, EntityID, InputFrame, EntityState } from '@uniplay/core';
export declare class TaskScheduler {
    private clients;
    private tasks;
    private taskCounter;
    /**
     * Assign up to 2 microtasks per client, ensuring they don't overload (1-2ms each)
     */
    assignTasks(clients: ClientID[], zoneId: ZoneID, entityId: EntityID, input?: InputFrame, state?: EntityState): Microtask[];
    /**
     * Remove completed tasks from client
     */
    completeTask(clientId: ClientID, taskId: TaskID): void;
    /**
     * Get tasks for a client
     */
    getTasksForClient(clientId: ClientID): Microtask[];
}
//# sourceMappingURL=taskScheduler.d.ts.map
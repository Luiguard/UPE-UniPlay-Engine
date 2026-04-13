import { ClientID, Microtask, MicrotaskType, TaskID, ZoneID, EntityID, InputFrame, EntityState } from '@uniplay/core';

export class TaskScheduler {
  private clients: Map<ClientID, { tasks: TaskID[]; lastAssigned: number }> = new Map();
  private tasks: Map<TaskID, Microtask> = new Map();
  private taskCounter = 0;

  /**
   * Assign up to 2 microtasks per client, ensuring they don't overload (1-2ms each)
   */
  assignTasks(clients: ClientID[], zoneId: ZoneID, entityId: EntityID, input?: InputFrame, state?: EntityState): Microtask[] {
    const assignedTasks: Microtask[] = [];
    const now = Date.now();

    for (const clientId of clients) {
      const clientInfo = this.clients.get(clientId) || { tasks: [], lastAssigned: 0 };
      if (clientInfo.tasks.length >= 2) continue; // Max 2 tasks per client

      // Create a microtask, e.g., physics update
      const taskId = `task_${this.taskCounter++}`;
      const task: Microtask = {
        id: taskId,
        type: MicrotaskType.PHYSICS_UPDATE,
        data: { entityId, zoneId, input, state },
        assignedClients: [clientId], // For simplicity, assign to one, but can be multiple for consensus
        deadline: now + 10, // 10ms deadline
        maxExecutionTime: 2,
      };

      this.tasks.set(taskId, task);
      clientInfo.tasks.push(taskId);
      clientInfo.lastAssigned = now;
      this.clients.set(clientId, clientInfo);
      assignedTasks.push(task);

      if (assignedTasks.length >= 2) break; // Limit assignments
    }

    return assignedTasks;
  }

  /**
   * Remove completed tasks from client
   */
  completeTask(clientId: ClientID, taskId: TaskID) {
    const clientInfo = this.clients.get(clientId);
    if (clientInfo) {
      clientInfo.tasks = clientInfo.tasks.filter(id => id !== taskId);
      this.clients.set(clientId, clientInfo);
    }
    this.tasks.delete(taskId);
  }

  /**
   * Get tasks for a client
   */
  getTasksForClient(clientId: ClientID): Microtask[] {
    const clientInfo = this.clients.get(clientId);
    if (!clientInfo) return [];
    return clientInfo.tasks.map(id => this.tasks.get(id)!).filter(Boolean);
  }
}
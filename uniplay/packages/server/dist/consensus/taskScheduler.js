export class TaskScheduler {
    activeTasks = new Map();
    assignedClients = new Map();
    // Maps a client to the tasks they are currently processing (for Load Balancing)
    clientLoad = new Map();
    // Metrics for Step 8: Node-Scoring
    clientScore = new Map();
    constructor() { }
    // Generates a new task
    createMicrotask(type, targetId, data, currentTick) {
        const id = this.generateId();
        const task = {
            id,
            type,
            targetId,
            tick: currentTick,
            data
        };
        this.activeTasks.set(id, task);
        this.assignedClients.set(id, new Set());
        return task;
    }
    // Step 3: Microtask-Verteilung (Load Balancing & Redundancy)
    assignTask(task, availableClients, redundancy = 3) {
        // Basic Load Balancing: Find clients with fewest active tasks and highest trust score
        const sortedClients = [...availableClients].sort((a, b) => {
            // 1. Check trust score (higher score = worse penalization)
            const scoreA = this.clientScore.get(a) || 0;
            const scoreB = this.clientScore.get(b) || 0;
            if (scoreA !== scoreB)
                return scoreA - scoreB;
            // 2. Check load
            const loadA = this.clientLoad.get(a)?.size || 0;
            const loadB = this.clientLoad.get(b)?.size || 0;
            return loadA - loadB;
        });
        // Select the top 'redundancy' clients
        const selected = sortedClients.slice(0, redundancy);
        for (const clientId of selected) {
            this.assignedClients.get(task.id)?.add(clientId);
            if (!this.clientLoad.has(clientId)) {
                this.clientLoad.set(clientId, new Set());
            }
            this.clientLoad.get(clientId)?.add(task.id);
        }
        return selected;
    }
    // Step 3: Microtask-Abbruch & Neuvergabe
    resolveTask(taskId) {
        this.activeTasks.delete(taskId);
        const clients = this.assignedClients.get(taskId);
        if (clients) {
            for (const clientId of clients) {
                this.clientLoad.get(clientId)?.delete(taskId);
            }
        }
        this.assignedClients.delete(taskId);
    }
    // Step 8: Node-Misbehavior-Scoring
    penalizeClient(clientId, strikePoints) {
        const current = this.clientScore.get(clientId) || 0;
        const newScore = current + strikePoints;
        this.clientScore.set(clientId, newScore);
        if (newScore > 50) {
            console.warn(`[TaskScheduler] Deprioritizing Client ${clientId} due to high cheat score (${newScore})`);
            // Step 8: automatische Depriorisierung & Task-Entzug
            this.revokeAllTasks(clientId);
        }
    }
    revokeAllTasks(clientId) {
        const tasks = this.clientLoad.get(clientId);
        if (tasks) {
            for (const taskId of tasks) {
                this.assignedClients.get(taskId)?.delete(clientId);
                // We might want to reassign this task to someone else if quorum drops
            }
            tasks.clear();
        }
    }
    generateId() {
        return Math.random().toString(36).substring(2, 10);
    }
}
//# sourceMappingURL=TaskScheduler.js.map
export class TaskExecutor {
    clientId;
    transport;
    tickSync;
    // Custom handler hooks to connect game engine physics/AI to UniPlay
    handlers = new Map();
    constructor(clientId, transport, tickSync) {
        this.clientId = clientId;
        this.transport = transport;
        this.tickSync = tickSync;
    }
    // Registers an engine-specific execution handler for a MicrotaskType
    registerHandler(type, handler) {
        this.handlers.set(type, handler);
    }
    // Step 3: Ausführung des vom Server vergebenen Microtasks
    executeTask(task) {
        const handler = this.handlers.get(task.type);
        if (!handler) {
            console.warn(`[TaskExecutor] No handler registered for MicrotaskType ${task.type}`);
            return;
        }
        try {
            // Execute local deterministic simulation (e.g. physics step, NPC decision)
            const executionStart = performance.now();
            const resultData = handler(task);
            const executionTime = performance.now() - executionStart;
            // Step 15 requirements: "Microtasks unter 2ms halten"
            if (executionTime > 2.0) {
                // We log but don't fail, client might just be slow
                console.warn(`[TaskExecutor] Task ${task.id} took ${executionTime.toFixed(2)}ms (Goal: < 2ms)`);
            }
            // Step 4: Hash-Mechanismus
            const stateHash = this.computeHash(resultData);
            const result = {
                taskId: task.id,
                type: task.type,
                targetId: task.targetId,
                tick: this.tickSync.getCurrentTick(),
                newStateHash: stateHash,
                resultData
            };
            this.submitVote(result);
        }
        catch (error) {
            console.error(`[TaskExecutor] Failed to execute task ${task.id}:`, error);
        }
    }
    distributeWork(tasks) {
        // If we receive multiple tasks, we can process them or queue them
        for (const t of tasks)
            this.executeTask(t);
    }
    submitVote(result) {
        const vote = {
            taskId: result.taskId,
            clientId: this.clientId,
            result: result,
            tick: result.tick,
            timestamp: Date.now()
        };
        // Send to server (0x11 is CONSENSUS_VOTE)
        this.transport.sendPacket(0x11, vote);
    }
    // Simple, fast deterministic hash for local results
    computeHash(obj) {
        const str = JSON.stringify(obj);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit int
        }
        return hash.toString(16);
    }
}
//# sourceMappingURL=TaskExecutor.js.map
import { MicrotaskType } from '@uniplay/core';
export class TaskExecutor {
    clientId;
    constructor(clientId) {
        this.clientId = clientId;
    }
    /**
     * Execute assigned microtasks
     */
    async executeTasks(tasks) {
        const results = [];
        for (const task of tasks) {
            const start = performance.now();
            try {
                const result = await this.executeWithTimeout(task, task.maxExecutionTime);
                const executionTime = performance.now() - start;
                if (executionTime <= task.maxExecutionTime) {
                    results.push({
                        taskId: task.id,
                        clientId: this.clientId,
                        result,
                        executionTime,
                        timestamp: Date.now(),
                    });
                }
                else {
                    console.warn(`Task ${task.id} exceeded time: ${executionTime}ms`);
                }
            }
            catch (error) {
                console.error(`Task ${task.id} failed:`, error);
            }
        }
        return results;
    }
    executeWithTimeout(task, timeoutMs) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Timeout')), timeoutMs);
            try {
                const result = this.executeTask(task);
                clearTimeout(timer);
                resolve(result);
            }
            catch (error) {
                clearTimeout(timer);
                reject(error);
            }
        });
    }
    /**
     * Execute a single task
     */
    executeTask(task) {
        switch (task.type) {
            case MicrotaskType.PHYSICS_UPDATE:
                // Simple physics: update position based on input
                const state = task.data.state;
                const input = task.data.input;
                if (state && input) {
                    // Dummy calculation: move position
                    state.position.x += input.moveX * 0.1;
                    state.position.y += input.moveY * 0.1;
                    return state;
                }
                return null;
            default:
                return null;
        }
    }
}
//# sourceMappingURL=taskExecutor.js.map
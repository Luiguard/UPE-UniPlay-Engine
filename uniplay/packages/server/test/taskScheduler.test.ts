import { TaskScheduler } from '../src/consensus/taskScheduler';

describe('TaskScheduler', () => {
  let scheduler: TaskScheduler;

  beforeEach(() => {
    scheduler = new TaskScheduler();
  });

  test('assigns tasks to clients', () => {
    const clients = ['client1', 'client2'];
    const tasks = scheduler.assignTasks(clients, 'zone1', 'entity1');
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0].assignedClients).toContain('client1');
  });

  test('limits assignments', () => {
    const clients = ['client1'];
    scheduler.assignTasks(clients, 'zone1', 'entity1');
    scheduler.assignTasks(clients, 'zone1', 'entity2');
    const tasks3 = scheduler.assignTasks(clients, 'zone1', 'entity3'); // Should not assign
    expect(tasks3.length).toBe(0);
  });
});
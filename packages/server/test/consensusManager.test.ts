import { ConsensusManager } from '../src/consensus/consensusManager';

describe('ConsensusManager', () => {
  let consensus: ConsensusManager;

  beforeEach(() => {
    consensus = new ConsensusManager();
  });

  test('reaches consensus with majority votes', () => {
    const vote1 = { taskId: 'task1', clientId: 'client1', result: { position: { x: 10, y: 20, z: 0 }, velocity: { x: 1, y: 1, z: 0 }, health: 50 }, tick: 1 };
    const vote2 = { taskId: 'task1', clientId: 'client2', result: { position: { x: 10, y: 20, z: 0 }, velocity: { x: 1, y: 1, z: 0 }, health: 50 }, tick: 1 };
    consensus.submitVote(vote1);
    const result = consensus.submitVote(vote2);
    expect(result).not.toBeNull();
    expect(result?.winner).toEqual({ position: { x: 10, y: 20, z: 0 }, velocity: { x: 1, y: 1, z: 0 }, health: 50 });
  });

  test('no consensus without quorum', () => {
    const vote = { taskId: 'task2', clientId: 'client1', result: { position: { x: 10, y: 20, z: 0 }, velocity: { x: 1, y: 1, z: 0 }, health: 50 }, tick: 1 };
    const result = consensus.submitVote(vote);
    expect(result).toBeNull();
  });
});
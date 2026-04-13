import { ZoneManager } from '../src/zones/zoneManager';

describe('ZoneManager', () => {
  let zoneManager: ZoneManager;

  beforeEach(() => {
    zoneManager = new ZoneManager();
  });

  test('adds zones', () => {
    const config = { id: 'zone1', bounds: { x: 0, y: 0, width: 100, height: 100 } };
    zoneManager.addZone(config);
    // No direct getter, but we can test assignment
  });

  test('assigns entities to zones', () => {
    const config = { id: 'zone1', bounds: { x: 0, y: 0, width: 100, height: 100 } };
    zoneManager.addZone(config);
    const state = { position: { x: 10, y: 20, z: 0 }, velocity: { x: 0, y: 0, z: 0 } };
    const zoneId = zoneManager.assignEntityToZone('entity1', state);
    expect(zoneId).toBe('zone1');
  });
});
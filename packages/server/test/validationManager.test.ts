import { ValidationManager } from '../src/consensus/validationManager';

describe('ValidationManager', () => {
  let validator: ValidationManager;

  beforeEach(() => {
    validator = new ValidationManager();
  });

  test('validates entity state', () => {
    const state = { position: { x: 10, y: 20, z: 0 }, velocity: { x: 1, y: 1, z: 0 }, health: 50 };
    const isValid = validator.validateEntityState(state);
    expect(isValid.accept).toBe(true);
  });

  test('rejects invalid state', () => {
    const state = { position: { x: 10000, y: 20, z: 0 }, velocity: { x: 1, y: 1, z: 0 }, health: 50 }; // Out of bounds
    const isValid = validator.validateEntityState(state);
    expect(isValid.accept).toBe(false);
  });
});
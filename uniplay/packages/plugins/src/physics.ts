import { Plugin } from './index.js';

export class PhysicsPlugin implements Plugin {
  name = 'physics';

  init() {
    console.log('Physics Plugin initialisiert');
  }

  update(deltaTime: number) {
    // Physik-Berechnungen
  }
}
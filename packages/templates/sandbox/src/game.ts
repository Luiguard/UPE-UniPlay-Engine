// Einfaches Sandbox-Spiel
import { EntityID, IVec3 } from '@uniplay/core';

export class SandboxGame {
  entities: Map<EntityID, { position: IVec3 }> = new Map();

  addEntity(id: EntityID, pos: IVec3) {
    this.entities.set(id, { position: pos });
  }

  update() {
    // Spiel-Logik hier
  }
}
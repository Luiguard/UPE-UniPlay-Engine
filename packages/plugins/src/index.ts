export interface Plugin {
  name: string;
  init(): void;
  update(deltaTime: number): void;
}

export class PluginManager {
  private plugins: Plugin[] = [];

  register(plugin: Plugin) {
    this.plugins.push(plugin);
    plugin.init();
  }

  update(deltaTime: number) {
    for (const plugin of this.plugins) {
      plugin.update(deltaTime);
    }
  }
}
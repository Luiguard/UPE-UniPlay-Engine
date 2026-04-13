export class PluginManager {
    plugins = [];
    register(plugin) {
        this.plugins.push(plugin);
        plugin.init();
    }
    update(deltaTime) {
        for (const plugin of this.plugins) {
            plugin.update(deltaTime);
        }
    }
}
//# sourceMappingURL=index.js.map
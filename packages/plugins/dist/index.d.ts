export interface Plugin {
    name: string;
    init(): void;
    update(deltaTime: number): void;
}
export declare class PluginManager {
    private plugins;
    register(plugin: Plugin): void;
    update(deltaTime: number): void;
}
//# sourceMappingURL=index.d.ts.map
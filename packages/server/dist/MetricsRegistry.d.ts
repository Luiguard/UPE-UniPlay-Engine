export declare class MetricsRegistry {
    private metrics;
    getPrometheusMetrics(): string;
    increment(metric: string, count?: number): void;
    gauge(metric: string, value: number): void;
}
//# sourceMappingURL=MetricsRegistry.d.ts.map
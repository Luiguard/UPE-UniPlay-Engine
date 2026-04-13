export class MetricsRegistry {
    metrics = new Map();
    // Prometheus-compatible stringification
    getPrometheusMetrics() {
        let output = '';
        for (const [key, value] of this.metrics.entries()) {
            output += `# HELP ${key} UniPlay System Metric\n`;
            output += `# TYPE ${key} gauge\n`;
            output += `${key} ${value}\n`;
        }
        return output;
    }
    increment(metric, count = 1) {
        const current = this.metrics.get(metric) || 0;
        this.metrics.set(metric, current + count);
    }
    gauge(metric, value) {
        this.metrics.set(metric, value);
    }
}
//# sourceMappingURL=MetricsRegistry.js.map
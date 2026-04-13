export class MetricsRegistry {
  private metrics: Map<string, number> = new Map();

  // Prometheus-compatible stringification
  public getPrometheusMetrics(): string {
    let output = '';
    for (const [key, value] of this.metrics.entries()) {
      output += `# HELP ${key} UniPlay System Metric\n`;
      output += `# TYPE ${key} gauge\n`;
      output += `${key} ${value}\n`;
    }
    return output;
  }

  public increment(metric: string, count: number = 1): void {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + count);
  }

  public gauge(metric: string, value: number): void {
    this.metrics.set(metric, value);
  }
}

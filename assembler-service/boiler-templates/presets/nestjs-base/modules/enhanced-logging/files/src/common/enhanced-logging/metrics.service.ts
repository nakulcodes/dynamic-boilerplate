import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly logger = new Logger(MetricsService.name);
  private enabled = false;

  // Custom metrics
  private httpRequestsTotal: Counter<string>;
  private httpRequestDuration: Histogram<string>;
  private activeConnections: Gauge<string>;

  constructor(private configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('METRICS_ENABLED', false);

    if (this.enabled) {
      // Collect default metrics
      collectDefaultMetrics({ prefix: '{{projectName}}_' });

      // Custom metrics
      this.httpRequestsTotal = new Counter({
        name: '{{projectName}}_http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code'],
      });

      this.httpRequestDuration = new Histogram({
        name: '{{projectName}}_http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: ['method', 'route'],
        buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      });

      this.activeConnections = new Gauge({
        name: '{{projectName}}_active_connections',
        help: 'Number of active connections',
      });

      this.logger.log('Metrics collection enabled');
    }
  }

  async onModuleInit() {
    if (this.enabled) {
      this.logger.log('Metrics service initialized');
    }
  }

  incrementHttpRequests(method: string, route: string, statusCode: number) {
    if (this.enabled) {
      this.httpRequestsTotal
        .labels(method, route, statusCode.toString())
        .inc();
    }
  }

  observeHttpDuration(method: string, route: string, duration: number) {
    if (this.enabled) {
      this.httpRequestDuration
        .labels(method, route)
        .observe(duration);
    }
  }

  setActiveConnections(count: number) {
    if (this.enabled) {
      this.activeConnections.set(count);
    }
  }

  async getMetrics(): Promise<string> {
    if (!this.enabled) {
      return '# Metrics disabled\n';
    }
    return register.metrics();
  }
}
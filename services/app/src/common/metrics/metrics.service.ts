import { Injectable } from '@nestjs/common';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private httpRequestsTotal: Counter<string>;
  private httpRequestDuration: Histogram<string>;
  private httpRequestsInFlight: Gauge<string>;

  constructor() {
    // Collect default metrics
    collectDefaultMetrics();

    // Custom metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
    });

    this.httpRequestsInFlight = new Gauge({
      name: 'http_requests_in_flight',
      help: 'Current number of HTTP requests being processed',
    });
  }

  getMetrics() {
    return register.metrics();
  }

  incrementHttpRequests(method: string, route: string, statusCode: number) {
    this.httpRequestsTotal
      .labels(method, route, statusCode.toString())
      .inc();
  }

  observeHttpRequestDuration(method: string, route: string, durationSeconds: number) {
    this.httpRequestDuration
      .labels(method, route)
      .observe(durationSeconds);
  }

  incrementHttpRequestsInFlight() {
    this.httpRequestsInFlight.inc();
  }

  decrementHttpRequestsInFlight() {
    this.httpRequestsInFlight.dec();
  }
}
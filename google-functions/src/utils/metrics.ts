/**
 * Enterprise Metrics and Monitoring System
 * Comprehensive observability with Prometheus, custom metrics, and alerting
 */

import { register, Counter, Histogram, Gauge, Summary, collectDefaultMetrics } from 'prom-client';
import { createLogger } from '@/utils/logger';

const logger = createLogger('Metrics');

export interface MetricLabels {
  [key: string]: string | number;
}

export interface AlertRule {
  name: string;
  condition: string;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  description: string;
}

export class Metrics {
  private readonly prefix: string;
  private counters = new Map<string, Counter<string>>();
  private histograms = new Map<string, Histogram<string>>();
  private gauges = new Map<string, Gauge<string>>();
  private summaries = new Map<string, Summary<string>>();
  private alertRules = new Map<string, AlertRule>();

  constructor(serviceName: string) {
    this.prefix = `handyman_${serviceName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // Collect default Node.js metrics
    collectDefaultMetrics({
      prefix: `${this.prefix}_nodejs_`,
      register,
    });

    // Initialize service-specific metrics
    this.initializeDefaultMetrics();

    logger.info(`Metrics initialized for service: ${serviceName}`, {
      prefix: this.prefix,
    });
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, labels: MetricLabels = {}, value: number = 1): void {
    try {
      const counter = this.getOrCreateCounter(name, 'Counter metric', Object.keys(labels));
      counter.inc(labels, value);

      logger.debug(`Counter incremented: ${name}`, { labels, value });
    } catch (error) {
      logger.error(`Failed to increment counter: ${name}`, error, { labels, value });
    }
  }

  /**
   * Record a histogram metric (for latency, response times, etc.)
   */
  recordLatency(name: string, value: number, labels: MetricLabels = {}): void {
    try {
      const histogram = this.getOrCreateHistogram(
        name,
        'Latency metric in milliseconds',
        Object.keys(labels)
      );
      histogram.observe(labels, value);

      logger.debug(`Histogram recorded: ${name}`, { labels, value });

      // Check for performance alerts
      this.checkPerformanceAlerts(name, value);
    } catch (error) {
      logger.error(`Failed to record histogram: ${name}`, error, { labels, value });
    }
  }

  /**
   * Set a gauge metric (for current values like active connections, memory usage, etc.)
   */
  setGauge(name: string, value: number, labels: MetricLabels = {}): void {
    try {
      const gauge = this.getOrCreateGauge(name, 'Gauge metric', Object.keys(labels));
      gauge.set(labels, value);

      logger.debug(`Gauge set: ${name}`, { labels, value });

      // Check for threshold alerts
      this.checkThresholdAlerts(name, value);
    } catch (error) {
      logger.error(`Failed to set gauge: ${name}`, error, { labels, value });
    }
  }

  /**
   * Increment a gauge metric
   */
  incrementGauge(name: string, labels: MetricLabels = {}, value: number = 1): void {
    try {
      const gauge = this.getOrCreateGauge(name, 'Gauge metric', Object.keys(labels));
      gauge.inc(labels, value);

      logger.debug(`Gauge incremented: ${name}`, { labels, value });
    } catch (error) {
      logger.error(`Failed to increment gauge: ${name}`, error, { labels, value });
    }
  }

  /**
   * Decrement a gauge metric
   */
  decrementGauge(name: string, labels: MetricLabels = {}, value: number = 1): void {
    try {
      const gauge = this.getOrCreateGauge(name, 'Gauge metric', Object.keys(labels));
      gauge.dec(labels, value);

      logger.debug(`Gauge decremented: ${name}`, { labels, value });
    } catch (error) {
      logger.error(`Failed to decrement gauge: ${name}`, error, { labels, value });
    }
  }

  /**
   * Record a summary metric (for quantiles)
   */
  recordSummary(name: string, value: number, labels: MetricLabels = {}): void {
    try {
      const summary = this.getOrCreateSummary(name, 'Summary metric', Object.keys(labels));
      summary.observe(labels, value);

      logger.debug(`Summary recorded: ${name}`, { labels, value });
    } catch (error) {
      logger.error(`Failed to record summary: ${name}`, error, { labels, value });
    }
  }

  /**
   * Start timing an operation
   */
  startTimer(name: string, labels: MetricLabels = {}): () => void {
    const start = Date.now();

    return () => {
      const duration = Date.now() - start;
      this.recordLatency(name, duration, labels);
    };
  }

  /**
   * Measure function execution time
   */
  measureTime<T>(name: string, fn: () => T, labels: MetricLabels = {}): T {
    const endTimer = this.startTimer(name, labels);
    try {
      const result = fn();
      return result;
    } finally {
      endTimer();
    }
  }

  /**
   * Measure async function execution time
   */
  async measureAsyncTime<T>(
    name: string,
    fn: () => Promise<T>,
    labels: MetricLabels = {}
  ): Promise<T> {
    const endTimer = this.startTimer(name, labels);
    try {
      const result = await fn();
      return result;
    } finally {
      endTimer();
    }
  }

  /**
   * Record business metrics
   */
  recordBusinessEvent(event: string, value: number = 1, labels: MetricLabels = {}): void {
    const metricName = `business_events_${event}`;
    this.incrementCounter(metricName, labels, value);

    logger.logBusinessEvent(`Business event: ${event}`, {
      value,
      labels,
    });
  }

  /**
   * Record error metrics
   */
  recordError(errorType: string, labels: MetricLabels = {}): void {
    this.incrementCounter('errors_total', {
      error_type: errorType,
      ...labels,
    });

    logger.error(`Error recorded in metrics: ${errorType}`, undefined, labels);
  }

  /**
   * Record API endpoint metrics
   */
  recordApiCall(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    labels: MetricLabels = {}
  ): void {
    const apiLabels = {
      method,
      endpoint,
      status_code: statusCode.toString(),
      ...labels,
    };

    this.incrementCounter('api_requests_total', apiLabels);
    this.recordLatency('api_request_duration', duration, apiLabels);

    // Record by status class
    const statusClass = Math.floor(statusCode / 100);
    this.incrementCounter(`api_responses_${statusClass}xx`, apiLabels);
  }

  /**
   * Record database operation metrics
   */
  recordDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
    labels: MetricLabels = {}
  ): void {
    const dbLabels = {
      operation,
      table,
      status: success ? 'success' : 'error',
      ...labels,
    };

    this.incrementCounter('database_operations_total', dbLabels);
    this.recordLatency('database_operation_duration', duration, dbLabels);

    if (!success) {
      this.recordError('database_operation', dbLabels);
    }
  }

  /**
   * Record external service call metrics
   */
  recordExternalServiceCall(
    service: string,
    operation: string,
    duration: number,
    success: boolean,
    labels: MetricLabels = {}
  ): void {
    const serviceLabels = {
      service,
      operation,
      status: success ? 'success' : 'error',
      ...labels,
    };

    this.incrementCounter('external_service_calls_total', serviceLabels);
    this.recordLatency('external_service_duration', duration, serviceLabels);

    if (!success) {
      this.recordError('external_service_call', serviceLabels);
    }
  }

  /**
   * Add custom alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.name, rule);
    logger.info(`Alert rule added: ${rule.name}`, { rule });
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    try {
      return await register.metrics();
    } catch (error) {
      logger.error('Failed to get metrics', error);
      return '';
    }
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): Record<string, any> {
    return {
      counters: Array.from(this.counters.keys()),
      histograms: Array.from(this.histograms.keys()),
      gauges: Array.from(this.gauges.keys()),
      summaries: Array.from(this.summaries.keys()),
      alertRules: Array.from(this.alertRules.keys()),
      registryMetrics: register.getMetricsAsJSON().length,
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    register.clear();
    this.counters.clear();
    this.histograms.clear();
    this.gauges.clear();
    this.summaries.clear();

    logger.info('All metrics reset');
  }

  /**
   * Flush metrics to external systems
   */
  async flush(): Promise<void> {
    try {
      // In production, this would send metrics to external systems
      // like CloudWatch, DataDog, or custom metric stores
      const metrics = await this.getMetrics();

      logger.debug('Metrics flushed', {
        metricsLength: metrics.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to flush metrics', error);
    }
  }

  // Private methods

  private initializeDefaultMetrics(): void {
    // Application health metrics
    this.setGauge('application_health', 1, { status: 'healthy' });

    // Service startup time
    this.setGauge('service_start_time', Date.now());

    // Initialize common counters
    this.getOrCreateCounter('requests_total', 'Total number of requests');
    this.getOrCreateCounter('errors_total', 'Total number of errors', ['error_type']);

    // Initialize common histograms
    this.getOrCreateHistogram('request_duration', 'Request duration in milliseconds');
    this.getOrCreateHistogram('database_operation_duration', 'Database operation duration');

    logger.debug('Default metrics initialized');
  }

  private getOrCreateCounter(name: string, help: string, labelNames: string[] = []): Counter<string> {
    const metricName = `${this.prefix}_${name}`;

    if (!this.counters.has(metricName)) {
      const counter = new Counter({
        name: metricName,
        help,
        labelNames,
        registers: [register],
      });
      this.counters.set(metricName, counter);
    }

    return this.counters.get(metricName)!;
  }

  private getOrCreateHistogram(name: string, help: string, labelNames: string[] = []): Histogram<string> {
    const metricName = `${this.prefix}_${name}`;

    if (!this.histograms.has(metricName)) {
      const histogram = new Histogram({
        name: metricName,
        help,
        labelNames,
        buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 300, 600, 1800, 3600], // Reasonable buckets for most use cases
        registers: [register],
      });
      this.histograms.set(metricName, histogram);
    }

    return this.histograms.get(metricName)!;
  }

  private getOrCreateGauge(name: string, help: string, labelNames: string[] = []): Gauge<string> {
    const metricName = `${this.prefix}_${name}`;

    if (!this.gauges.has(metricName)) {
      const gauge = new Gauge({
        name: metricName,
        help,
        labelNames,
        registers: [register],
      });
      this.gauges.set(metricName, gauge);
    }

    return this.gauges.get(metricName)!;
  }

  private getOrCreateSummary(name: string, help: string, labelNames: string[] = []): Summary<string> {
    const metricName = `${this.prefix}_${name}`;

    if (!this.summaries.has(metricName)) {
      const summary = new Summary({
        name: metricName,
        help,
        labelNames,
        percentiles: [0.5, 0.9, 0.95, 0.99],
        registers: [register],
      });
      this.summaries.set(metricName, summary);
    }

    return this.summaries.get(metricName)!;
  }

  private checkPerformanceAlerts(metricName: string, value: number): void {
    const alertName = `${metricName}_performance`;
    const alert = this.alertRules.get(alertName);

    if (alert && value > alert.threshold) {
      logger.logSecurityEvent(`Performance alert triggered: ${alertName}`, alert.severity, {
        metricName,
        value,
        threshold: alert.threshold,
        description: alert.description,
      });
    }
  }

  private checkThresholdAlerts(metricName: string, value: number): void {
    const alertName = `${metricName}_threshold`;
    const alert = this.alertRules.get(alertName);

    if (alert && value > alert.threshold) {
      logger.logSecurityEvent(`Threshold alert triggered: ${alertName}`, alert.severity, {
        metricName,
        value,
        threshold: alert.threshold,
        description: alert.description,
      });
    }
  }
}

/**
 * Metrics decorator for automatic method instrumentation
 */
export function Instrumented(metricName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;
    const finalMetricName = metricName || `${className}_${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const metrics = new Metrics(className);
      const endTimer = metrics.startTimer(`${finalMetricName}_duration`);

      try {
        metrics.incrementCounter(`${finalMetricName}_calls`);

        const result = await method.apply(this, args);

        metrics.incrementCounter(`${finalMetricName}_success`);
        return result;
      } catch (error) {
        metrics.incrementCounter(`${finalMetricName}_error`);
        throw error;
      } finally {
        endTimer();
      }
    };

    return descriptor;
  };
}

/**
 * Global metrics instance
 */
export const globalMetrics = new Metrics('global');

/**
 * Express middleware for automatic API metrics collection
 */
export const metricsMiddleware = (req: any, res: any, next: any): void => {
  const startTime = Date.now();

  // Capture original end method
  const originalEnd = res.end;

  res.end = function (...args: any[]) {
    // Calculate duration
    const duration = Date.now() - startTime;

    // Record metrics
    globalMetrics.recordApiCall(
      req.method,
      req.route?.path || req.path,
      res.statusCode,
      duration,
      {
        user_agent: req.headers['user-agent'] || 'unknown',
        endpoint: req.route?.path || req.path,
      }
    );

    // Call original end method
    originalEnd.apply(res, args);
  };

  next();
};
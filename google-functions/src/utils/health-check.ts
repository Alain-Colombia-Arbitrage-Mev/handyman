/**
 * Enterprise Health Check System
 * Comprehensive health monitoring for all system components
 */

import { createLogger } from '@/utils/logger';
import { Metrics } from '@/utils/metrics';

const logger = createLogger('HealthCheck');

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  duration: number;
  details?: Record<string, any>;
  error?: string;
}

export interface HealthCheckConfig {
  name: string;
  timeout: number;
  interval: number;
  retries: number;
  critical: boolean;
  tags: string[];
}

export interface SystemHealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  checks: Record<string, HealthCheckResult>;
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
    critical_failing: number;
  };
}

export abstract class BaseHealthCheck {
  protected readonly config: HealthCheckConfig;
  protected readonly metrics: Metrics;
  private lastResult?: HealthCheckResult;
  private consecutiveFailures = 0;

  constructor(config: HealthCheckConfig) {
    this.config = config;
    this.metrics = new Metrics(`HealthCheck_${config.name}`);
  }

  abstract performCheck(): Promise<HealthCheckResult>;

  async execute(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Set timeout for health check
      const result = await this.executeWithTimeout();

      // Update metrics
      this.metrics.incrementCounter('health_check_total', {
        name: this.config.name,
        status: result.status,
      });

      this.metrics.recordLatency('health_check_duration', result.duration, {
        name: this.config.name,
      });

      // Track consecutive failures
      if (result.status === 'healthy') {
        this.consecutiveFailures = 0;
      } else {
        this.consecutiveFailures++;
      }

      this.lastResult = result;

      logger.debug(`Health check completed: ${this.config.name}`, {
        status: result.status,
        duration: result.duration,
        consecutiveFailures: this.consecutiveFailures,
      });

      return result;

    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.consecutiveFailures++;

      const result: HealthCheckResult = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        duration,
        error: error.message,
      };

      this.metrics.incrementCounter('health_check_total', {
        name: this.config.name,
        status: 'unhealthy',
      });

      this.metrics.incrementCounter('health_check_errors', {
        name: this.config.name,
        error_type: error.name || 'unknown',
      });

      this.lastResult = result;

      logger.error(`Health check failed: ${this.config.name}`, error, {
        duration,
        consecutiveFailures: this.consecutiveFailures,
      });

      return result;
    }
  }

  getLastResult(): HealthCheckResult | undefined {
    return this.lastResult;
  }

  getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }

  private async executeWithTimeout(): Promise<HealthCheckResult> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Health check timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      this.performCheck()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeout));
    });
  }
}

/**
 * Database health check
 */
export class DatabaseHealthCheck extends BaseHealthCheck {
  constructor(private connectionPool: any) {
    super({
      name: 'database',
      timeout: 5000,
      interval: 30000,
      retries: 3,
      critical: true,
      tags: ['database', 'storage'],
    });
  }

  async performCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Test database connection with simple query
      const result = await this.connectionPool.query(
        'SELECT 1 as health_check, NOW() as current_time',
        [],
        { timeout: 3000 }
      );

      // Check connection pool stats
      const poolStats = this.connectionPool.getPoolStats();

      const duration = Date.now() - startTime;

      // Determine status based on performance and pool health
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      if (duration > 2000) {
        status = 'degraded';
      }

      if (poolStats.idleConnections === 0) {
        status = 'degraded';
      }

      return {
        status,
        timestamp: new Date().toISOString(),
        duration,
        details: {
          query_result: result[0],
          connection_pool: poolStats,
          response_time_ms: duration,
        },
      };

    } catch (error: any) {
      throw new Error(`Database health check failed: ${error.message}`);
    }
  }
}

/**
 * Redis health check
 */
export class RedisHealthCheck extends BaseHealthCheck {
  constructor(private redisClient: any) {
    super({
      name: 'redis',
      timeout: 3000,
      interval: 30000,
      retries: 2,
      critical: false,
      tags: ['cache', 'redis'],
    });
  }

  async performCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Test Redis connection with ping
      const pingResult = await this.redisClient.ping();

      // Test read/write operations
      const testKey = `health_check:${Date.now()}`;
      const testValue = 'health_check_value';

      await this.redisClient.setex(testKey, 10, testValue);
      const retrievedValue = await this.redisClient.get(testKey);
      await this.redisClient.del(testKey);

      const duration = Date.now() - startTime;

      // Check Redis info
      const info = await this.redisClient.info('memory');
      const memoryInfo = this.parseRedisInfo(info);

      const status = retrievedValue === testValue ? 'healthy' : 'unhealthy';

      return {
        status,
        timestamp: new Date().toISOString(),
        duration,
        details: {
          ping_result: pingResult,
          read_write_test: retrievedValue === testValue,
          memory_usage_mb: Math.round(parseInt(memoryInfo.used_memory || '0') / 1024 / 1024),
          response_time_ms: duration,
        },
      };

    } catch (error: any) {
      throw new Error(`Redis health check failed: ${error.message}`);
    }
  }

  private parseRedisInfo(info: string): Record<string, string> {
    const result: Record<string, string> = {};
    info.split('\r\n').forEach(line => {
      const [key, value] = line.split(':');
      if (key && value) {
        result[key] = value;
      }
    });
    return result;
  }
}

/**
 * External service health check
 */
export class ExternalServiceHealthCheck extends BaseHealthCheck {
  constructor(
    private serviceName: string,
    private healthEndpoint: string,
    private timeout: number = 5000
  ) {
    super({
      name: `external_${serviceName}`,
      timeout,
      interval: 60000,
      retries: 2,
      critical: false,
      tags: ['external', 'api'],
    });
  }

  async performCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Use fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(this.healthEndpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'HandymanAuction-HealthCheck/1.0',
        },
      });

      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;
      const isHealthy = response.ok;

      let responseData: any = null;
      try {
        responseData = await response.json();
      } catch {
        // Response might not be JSON
        responseData = await response.text();
      }

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        duration,
        details: {
          service_name: this.serviceName,
          endpoint: this.healthEndpoint,
          status_code: response.status,
          response_time_ms: duration,
          response_data: responseData,
        },
      };

    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`External service health check timeout: ${this.serviceName}`);
      }
      throw new Error(`External service health check failed: ${this.serviceName} - ${error.message}`);
    }
  }
}

/**
 * Memory usage health check
 */
export class MemoryHealthCheck extends BaseHealthCheck {
  constructor(private warningThreshold: number = 80, private criticalThreshold: number = 95) {
    super({
      name: 'memory',
      timeout: 1000,
      interval: 15000,
      retries: 1,
      critical: true,
      tags: ['system', 'memory'],
    });
  }

  async performCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const memUsage = process.memoryUsage();
      const totalMemory = require('os').totalmem();
      const freeMemory = require('os').freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;

      const duration = Date.now() - startTime;

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      if (memoryUsagePercent > this.criticalThreshold) {
        status = 'unhealthy';
      } else if (memoryUsagePercent > this.warningThreshold) {
        status = 'degraded';
      }

      return {
        status,
        timestamp: new Date().toISOString(),
        duration,
        details: {
          system_memory: {
            total_mb: Math.round(totalMemory / 1024 / 1024),
            used_mb: Math.round(usedMemory / 1024 / 1024),
            free_mb: Math.round(freeMemory / 1024 / 1024),
            usage_percent: Math.round(memoryUsagePercent * 100) / 100,
          },
          process_memory: {
            rss_mb: Math.round(memUsage.rss / 1024 / 1024),
            heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
            heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
            external_mb: Math.round(memUsage.external / 1024 / 1024),
          },
          thresholds: {
            warning_percent: this.warningThreshold,
            critical_percent: this.criticalThreshold,
          },
        },
      };

    } catch (error: any) {
      throw new Error(`Memory health check failed: ${error.message}`);
    }
  }
}

/**
 * Health check manager
 */
export class HealthCheckManager {
  private checks = new Map<string, BaseHealthCheck>();
  private intervals = new Map<string, NodeJS.Timeout>();
  private metrics: Metrics;

  constructor() {
    this.metrics = new Metrics('HealthCheckManager');
  }

  register(healthCheck: BaseHealthCheck): void {
    const name = healthCheck['config'].name;
    this.checks.set(name, healthCheck);

    // Start periodic health checks
    const interval = setInterval(async () => {
      await healthCheck.execute();
    }, healthCheck['config'].interval);

    this.intervals.set(name, interval);

    logger.info(`Health check registered: ${name}`, {
      interval: healthCheck['config'].interval,
      critical: healthCheck['config'].critical,
    });
  }

  unregister(name: string): void {
    const interval = this.intervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(name);
    }

    this.checks.delete(name);

    logger.info(`Health check unregistered: ${name}`);
  }

  async runAll(): Promise<SystemHealthStatus> {
    const startTime = Date.now();

    try {
      // Execute all health checks in parallel
      const checkResults = await Promise.allSettled(
        Array.from(this.checks.entries()).map(async ([name, check]) => {
          const result = await check.execute();
          return { name, result };
        })
      );

      // Process results
      const checks: Record<string, HealthCheckResult> = {};
      let healthy = 0;
      let unhealthy = 0;
      let degraded = 0;
      let criticalFailing = 0;

      checkResults.forEach((checkResult) => {
        if (checkResult.status === 'fulfilled') {
          const { name, result } = checkResult.value;
          checks[name] = result;

          switch (result.status) {
            case 'healthy':
              healthy++;
              break;
            case 'degraded':
              degraded++;
              break;
            case 'unhealthy':
              unhealthy++;
              if (this.checks.get(name)?.['config'].critical) {
                criticalFailing++;
              }
              break;
          }
        } else {
          // Handle rejected promises
          const name = 'unknown';
          checks[name] = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime,
            error: checkResult.reason?.message || 'Unknown error',
          };
          unhealthy++;
        }
      });

      // Determine overall system status
      let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      if (criticalFailing > 0) {
        overallStatus = 'unhealthy';
      } else if (unhealthy > 0 || degraded > 0) {
        overallStatus = 'degraded';
      }

      const systemHealth: SystemHealthStatus = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        checks,
        summary: {
          total: this.checks.size,
          healthy,
          unhealthy,
          degraded,
          critical_failing: criticalFailing,
        },
      };

      // Record metrics
      this.metrics.incrementCounter('health_check_runs_total');
      this.metrics.setGauge('system_health_status', overallStatus === 'healthy' ? 1 : 0);
      this.metrics.setGauge('healthy_checks', healthy);
      this.metrics.setGauge('unhealthy_checks', unhealthy);
      this.metrics.setGauge('degraded_checks', degraded);
      this.metrics.setGauge('critical_failing_checks', criticalFailing);

      const duration = Date.now() - startTime;
      this.metrics.recordLatency('health_check_duration', duration);

      logger.info('System health check completed', {
        status: overallStatus,
        duration,
        summary: systemHealth.summary,
      });

      return systemHealth;

    } catch (error: any) {
      logger.error('Health check execution failed', error);

      this.metrics.incrementCounter('health_check_errors_total');

      throw error;
    }
  }

  getCheck(name: string): BaseHealthCheck | undefined {
    return this.checks.get(name);
  }

  getAllChecks(): Map<string, BaseHealthCheck> {
    return new Map(this.checks);
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down health check manager');

    // Clear all intervals
    for (const [name, interval] of this.intervals) {
      clearInterval(interval);
      logger.debug(`Cleared health check interval: ${name}`);
    }

    this.intervals.clear();
    this.checks.clear();

    logger.info('Health check manager shutdown completed');
  }
}

// Global health check manager instance
export const globalHealthCheckManager = new HealthCheckManager();
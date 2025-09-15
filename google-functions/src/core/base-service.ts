/**
 * Base Service Class for Enterprise-Grade Service Architecture
 * Provides common functionality, dependency injection, and lifecycle management
 */

import { createLogger, Logger } from '@/utils/logger';
import { CustomError } from '@/utils/errors';
import { Metrics } from '@/utils/metrics';
import { CacheManager } from '@/utils/cache';
import { CircuitBreaker } from '@/utils/circuit-breaker';

export interface ServiceConfig {
  name: string;
  timeout?: number;
  retryAttempts?: number;
  circuitBreakerOptions?: {
    failureThreshold: number;
    resetTimeout: number;
  };
  cacheOptions?: {
    ttl: number;
    maxSize: number;
  };
}

export abstract class BaseService {
  protected readonly logger: Logger;
  protected readonly metrics: Metrics;
  protected readonly cache: CacheManager;
  protected readonly circuitBreaker: CircuitBreaker;
  protected readonly config: ServiceConfig;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.logger = createLogger(config.name);
    this.metrics = new Metrics(config.name);
    this.cache = new CacheManager(config.cacheOptions);
    this.circuitBreaker = new CircuitBreaker(
      config.circuitBreakerOptions?.failureThreshold || 5,
      config.circuitBreakerOptions?.resetTimeout || 60000
    );
  }

  /**
   * Execute operation with circuit breaker, metrics, and error handling
   */
  protected async executeWithProtection<T>(
    operationName: string,
    operation: () => Promise<T>,
    options?: {
      cacheKey?: string;
      cacheTtl?: number;
      skipCache?: boolean;
    }
  ): Promise<T> {
    const startTime = Date.now();
    const { cacheKey, cacheTtl, skipCache = false } = options || {};

    try {
      // Check cache first
      if (cacheKey && !skipCache) {
        const cached = await this.cache.get<T>(cacheKey);
        if (cached) {
          this.metrics.incrementCounter(`${operationName}_cache_hit`);
          return cached;
        }
      }

      // Execute with circuit breaker
      const result = await this.circuitBreaker.execute(operation);

      // Cache result if specified
      if (cacheKey && result) {
        await this.cache.set(cacheKey, result, cacheTtl);
      }

      // Record metrics
      const duration = Date.now() - startTime;
      this.metrics.recordLatency(operationName, duration);
      this.metrics.incrementCounter(`${operationName}_success`);

      this.logger.debug(`Operation ${operationName} completed successfully`, {
        duration,
        cached: !!cacheKey,
      });

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.metrics.recordLatency(operationName, duration);
      this.metrics.incrementCounter(`${operationName}_error`);

      this.logger.error(`Operation ${operationName} failed`, error, {
        duration,
        operationName,
      });

      throw error;
    }
  }

  /**
   * Validate input data with performance tracking
   */
  protected async validateInput<T>(
    data: unknown,
    validator: (data: unknown) => T,
    operationName: string
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = validator(data);
      const duration = Date.now() - startTime;
      this.metrics.recordLatency(`${operationName}_validation`, duration);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.metrics.recordLatency(`${operationName}_validation`, duration);
      this.metrics.incrementCounter(`${operationName}_validation_error`);

      this.logger.error(`Validation failed for ${operationName}`, error);
      throw error;
    }
  }

  /**
   * Handle graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info(`Shutting down ${this.config.name} service`);

    try {
      // Close cache connections
      await this.cache.close();

      // Reset circuit breaker
      this.circuitBreaker.reset();

      // Flush metrics
      await this.metrics.flush();

      this.logger.info(`${this.config.name} service shutdown completed`);
    } catch (error: any) {
      this.logger.error(`Error during ${this.config.name} service shutdown`, error);
      throw error;
    }
  }

  /**
   * Health check method
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: Record<string, any>;
  }> {
    const details: Record<string, any> = {
      service: this.config.name,
      circuitBreakerState: this.circuitBreaker.getState(),
      cacheStats: await this.cache.getStats(),
      timestamp: new Date().toISOString(),
    };

    const isHealthy = this.circuitBreaker.getState() !== 'open';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      details,
    };
  }
}

/**
 * Service Registry for Dependency Injection
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services = new Map<string, BaseService>();

  private constructor() {}

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  register<T extends BaseService>(name: string, service: T): void {
    this.services.set(name, service);
  }

  get<T extends BaseService>(name: string): T {
    const service = this.services.get(name) as T;
    if (!service) {
      throw new CustomError(`Service ${name} not found in registry`, 'SERVICE_NOT_FOUND', 500);
    }
    return service;
  }

  async shutdownAll(): Promise<void> {
    const shutdownPromises = Array.from(this.services.values()).map(service =>
      service.shutdown()
    );
    await Promise.allSettled(shutdownPromises);
  }

  async healthCheckAll(): Promise<Record<string, any>> {
    const healthChecks = await Promise.allSettled(
      Array.from(this.services.entries()).map(async ([name, service]) => {
        const health = await service.healthCheck();
        return { name, ...health };
      })
    );

    return healthChecks.reduce((acc, result, index) => {
      const serviceName = Array.from(this.services.keys())[index];
      acc[serviceName] = result.status === 'fulfilled' ? result.value : { status: 'unhealthy', error: result.reason };
      return acc;
    }, {} as Record<string, any>);
  }
}
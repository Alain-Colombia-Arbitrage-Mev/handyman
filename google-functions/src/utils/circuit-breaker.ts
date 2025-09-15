/**
 * Enterprise Circuit Breaker Implementation
 * Provides fault tolerance and prevents cascade failures
 */

import { createLogger } from '@/utils/logger';
import { Metrics } from '@/utils/metrics';

const logger = createLogger('CircuitBreaker');

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
  expectedErrorRate: number;
  minimumRequests: number;
  successThreshold?: number;
}

export interface CircuitBreakerMetrics {
  requestCount: number;
  failureCount: number;
  successCount: number;
  lastFailureTime?: number;
  state: CircuitState;
  stateChangedAt: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private requestCount = 0;
  private lastFailureTime?: number;
  private stateChangedAt = Date.now();
  private metrics: Metrics;

  private readonly config: CircuitBreakerConfig;

  constructor(
    private name: string,
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      resetTimeout: config.resetTimeout || 60000,
      monitoringPeriod: config.monitoringPeriod || 60000,
      expectedErrorRate: config.expectedErrorRate || 0.5,
      minimumRequests: config.minimumRequests || 10,
      successThreshold: config.successThreshold || 3,
    };

    this.metrics = new Metrics(`CircuitBreaker_${name}`);

    // Start monitoring
    this.startMonitoring();

    logger.info(`Circuit breaker initialized for ${name}`, {
      config: this.config,
    });
  }

  /**
   * Execute operation through circuit breaker
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      // Check if circuit breaker allows the request
      if (!this.allowRequest()) {
        const error = new CircuitBreakerOpenError(
          `Circuit breaker is ${this.state} for ${this.name}`
        );
        this.recordMetrics('blocked');
        reject(error);
        return;
      }

      const startTime = Date.now();

      try {
        // Execute the operation
        const result = await operation();

        // Record success
        this.onSuccess();
        this.recordMetrics('success', Date.now() - startTime);

        resolve(result);

      } catch (error: any) {
        // Record failure
        this.onFailure();
        this.recordMetrics('failure', Date.now() - startTime);

        reject(error);
      }
    });
  }

  /**
   * Get current circuit breaker state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      requestCount: this.requestCount,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      state: this.state,
      stateChangedAt: this.stateChangedAt,
    };
  }

  /**
   * Force reset circuit breaker to closed state
   */
  reset(): void {
    logger.info(`Manually resetting circuit breaker for ${this.name}`);
    this.resetCounters();
    this.setState(CircuitState.CLOSED);
  }

  /**
   * Force open circuit breaker
   */
  forceOpen(): void {
    logger.warn(`Manually opening circuit breaker for ${this.name}`);
    this.setState(CircuitState.OPEN);
  }

  // Private methods

  private allowRequest(): boolean {
    this.requestCount++;

    switch (this.state) {
      case CircuitState.CLOSED:
        return true;

      case CircuitState.OPEN:
        // Check if enough time has passed to try again
        if (this.shouldAttemptReset()) {
          this.setState(CircuitState.HALF_OPEN);
          return true;
        }
        return false;

      case CircuitState.HALF_OPEN:
        // Allow limited requests in half-open state
        return this.successCount < (this.config.successThreshold || 3);

      default:
        return false;
    }
  }

  private onSuccess(): void {
    this.successCount++;
    this.lastFailureTime = undefined;

    switch (this.state) {
      case CircuitState.HALF_OPEN:
        // If we've had enough successes, close the circuit
        if (this.successCount >= (this.config.successThreshold || 3)) {
          this.setState(CircuitState.CLOSED);
          this.resetCounters();
        }
        break;

      case CircuitState.CLOSED:
        // Reset failure count on success
        this.failureCount = 0;
        break;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    switch (this.state) {
      case CircuitState.CLOSED:
        // Check if we should open the circuit
        if (this.shouldOpenCircuit()) {
          this.setState(CircuitState.OPEN);
        }
        break;

      case CircuitState.HALF_OPEN:
        // Any failure in half-open state should open the circuit
        this.setState(CircuitState.OPEN);
        break;
    }
  }

  private shouldOpenCircuit(): boolean {
    // Need minimum number of requests to make a decision
    if (this.requestCount < this.config.minimumRequests) {
      return false;
    }

    // Check failure threshold
    if (this.failureCount >= this.config.failureThreshold) {
      return true;
    }

    // Check error rate
    const errorRate = this.failureCount / this.requestCount;
    return errorRate >= this.config.expectedErrorRate;
  }

  private shouldAttemptReset(): boolean {
    const timeSinceLastFailure = Date.now() - this.stateChangedAt;
    return timeSinceLastFailure >= this.config.resetTimeout;
  }

  private setState(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.stateChangedAt = Date.now();

    logger.info(`Circuit breaker state changed for ${this.name}`, {
      from: oldState,
      to: newState,
      failureCount: this.failureCount,
      successCount: this.successCount,
      requestCount: this.requestCount,
    });

    // Record state change metrics
    this.metrics.incrementCounter(`state_change_to_${newState}`);
    this.metrics.setGauge('current_state', this.getStateAsNumber());
  }

  private resetCounters(): void {
    this.failureCount = 0;
    this.successCount = 0;
    this.requestCount = 0;
  }

  private getStateAsNumber(): number {
    switch (this.state) {
      case CircuitState.CLOSED: return 0;
      case CircuitState.HALF_OPEN: return 1;
      case CircuitState.OPEN: return 2;
      default: return -1;
    }
  }

  private recordMetrics(type: 'success' | 'failure' | 'blocked', duration?: number): void {
    this.metrics.incrementCounter(`request_${type}`);

    if (duration !== undefined) {
      this.metrics.recordLatency('operation_duration', duration);
    }

    this.metrics.setGauge('failure_count', this.failureCount);
    this.metrics.setGauge('success_count', this.successCount);
    this.metrics.setGauge('request_count', this.requestCount);

    // Calculate and record error rate
    if (this.requestCount > 0) {
      const errorRate = this.failureCount / this.requestCount;
      this.metrics.setGauge('error_rate', errorRate);
    }
  }

  private startMonitoring(): void {
    // Reset counters periodically to prevent stale data
    setInterval(() => {
      const now = Date.now();
      const timeSinceReset = now - this.stateChangedAt;

      // Reset counters if they're older than monitoring period
      if (timeSinceReset > this.config.monitoringPeriod) {
        logger.debug(`Resetting counters for circuit breaker ${this.name}`);
        this.resetCounters();
      }
    }, this.config.monitoringPeriod);
  }
}

/**
 * Circuit Breaker Registry for managing multiple circuit breakers
 */
export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private breakers = new Map<string, CircuitBreaker>();

  private constructor() {}

  static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }

  register(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (this.breakers.has(name)) {
      return this.breakers.get(name)!;
    }

    const breaker = new CircuitBreaker(name, config);
    this.breakers.set(name, breaker);
    return breaker;
  }

  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  getAll(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }

  getHealthStatus(): Record<string, any> {
    const status: Record<string, any> = {};

    for (const [name, breaker] of this.breakers) {
      const metrics = breaker.getMetrics();
      status[name] = {
        state: metrics.state,
        healthy: metrics.state === CircuitState.CLOSED,
        metrics,
      };
    }

    return status;
  }

  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

/**
 * Circuit Breaker Open Error
 */
export class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

/**
 * Decorator for automatic circuit breaker integration
 */
export function WithCircuitBreaker(
  name: string,
  config?: Partial<CircuitBreakerConfig>
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const registry = CircuitBreakerRegistry.getInstance();
    const breaker = registry.register(name, config);

    descriptor.value = async function (...args: any[]) {
      return breaker.execute(() => method.apply(this, args));
    };

    return descriptor;
  };
}
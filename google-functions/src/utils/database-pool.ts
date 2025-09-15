/**
 * Enterprise Database Connection Pool with Performance Optimization
 * Implements connection pooling, query optimization, and monitoring
 */

import { Pool, PoolClient, PoolConfig } from 'pg';
import Redis from 'ioredis';
import { createLogger } from '@/utils/logger';
import { Metrics } from '@/utils/metrics';

const logger = createLogger('DatabasePool');

interface QueryOptions {
  timeout?: number;
  cache?: {
    key: string;
    ttl: number;
  };
  retries?: number;
  priority?: 'high' | 'normal' | 'low';
}

interface ConnectionPoolConfig extends PoolConfig {
  maxConnections?: number;
  minConnections?: number;
  acquireTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export class DatabaseConnectionPool {
  private pool: Pool;
  private redis: Redis;
  private metrics: Metrics;
  private readonly config: ConnectionPoolConfig;
  private connectionCount = 0;
  private queryQueue: Array<{ query: string; params: any[]; options: QueryOptions; resolve: any; reject: any }> = [];
  private isProcessingQueue = false;

  constructor(config: ConnectionPoolConfig, redisConfig: any) {
    this.config = {
      max: config.maxConnections || 20,
      min: config.minConnections || 2,
      acquireTimeoutMillis: config.acquireTimeoutMillis || 30000,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
      ...config,
    };

    this.pool = new Pool(this.config);
    this.redis = new Redis(redisConfig);
    this.metrics = new Metrics('DatabasePool');

    this.setupEventHandlers();
    this.startHealthCheck();
  }

  /**
   * Execute query with connection pooling and caching
   */
  async query<T = any>(
    sql: string,
    params: any[] = [],
    options: QueryOptions = {}
  ): Promise<T[]> {
    const startTime = Date.now();
    const queryId = this.generateQueryId(sql, params);

    try {
      // Check cache first
      if (options.cache) {
        const cached = await this.getCachedResult<T>(options.cache.key);
        if (cached) {
          this.metrics.incrementCounter('query_cache_hit');
          logger.debug('Query cache hit', { queryId, cacheKey: options.cache.key });
          return cached;
        }
      }

      // Execute query with retry logic
      const result = await this.executeWithRetry(sql, params, options);

      // Cache result if specified
      if (options.cache && result) {
        await this.setCachedResult(options.cache.key, result, options.cache.ttl);
      }

      const duration = Date.now() - startTime;
      this.metrics.recordLatency('query_execution', duration);
      this.metrics.incrementCounter('query_success');

      logger.debug('Query executed successfully', {
        queryId,
        duration,
        rowCount: result.length,
        cached: !!options.cache,
      });

      return result;

    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.metrics.recordLatency('query_execution', duration);
      this.metrics.incrementCounter('query_error');

      logger.error('Query execution failed', error, {
        queryId,
        duration,
        sql: sql.substring(0, 100),
      });

      throw error;
    }
  }

  /**
   * Execute transaction with automatic retry and rollback
   */
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    const startTime = Date.now();
    let client: PoolClient | null = null;

    try {
      client = await this.pool.connect();
      await client.query('BEGIN');

      const result = await callback(client);

      await client.query('COMMIT');

      const duration = Date.now() - startTime;
      this.metrics.recordLatency('transaction_execution', duration);
      this.metrics.incrementCounter('transaction_success');

      logger.debug('Transaction completed successfully', { duration });

      return result;

    } catch (error: any) {
      if (client) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          logger.error('Transaction rollback failed', rollbackError);
        }
      }

      const duration = Date.now() - startTime;
      this.metrics.recordLatency('transaction_execution', duration);
      this.metrics.incrementCounter('transaction_error');

      logger.error('Transaction failed', error, { duration });
      throw error;

    } finally {
      if (client) {
        client.release();
      }
    }
  }

  /**
   * Batch execute multiple queries efficiently
   */
  async batchQuery(
    queries: Array<{ sql: string; params: any[]; options?: QueryOptions }>
  ): Promise<any[]> {
    const startTime = Date.now();

    try {
      // Group queries by priority
      const highPriority = queries.filter(q => q.options?.priority === 'high');
      const normalPriority = queries.filter(q => q.options?.priority !== 'high' && q.options?.priority !== 'low');
      const lowPriority = queries.filter(q => q.options?.priority === 'low');

      // Execute in priority order with concurrency control
      const results = [];

      // High priority queries - execute immediately
      if (highPriority.length > 0) {
        const highResults = await Promise.all(
          highPriority.map(q => this.query(q.sql, q.params, q.options))
        );
        results.push(...highResults);
      }

      // Normal priority queries - execute with limited concurrency
      if (normalPriority.length > 0) {
        const normalResults = await this.executeBatchWithConcurrency(normalPriority, 5);
        results.push(...normalResults);
      }

      // Low priority queries - execute with minimal concurrency
      if (lowPriority.length > 0) {
        const lowResults = await this.executeBatchWithConcurrency(lowPriority, 2);
        results.push(...lowResults);
      }

      const duration = Date.now() - startTime;
      this.metrics.recordLatency('batch_query_execution', duration);
      this.metrics.incrementCounter('batch_query_success');

      logger.debug('Batch query completed', {
        totalQueries: queries.length,
        duration,
      });

      return results;

    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.metrics.recordLatency('batch_query_execution', duration);
      this.metrics.incrementCounter('batch_query_error');

      logger.error('Batch query failed', error, { totalQueries: queries.length });
      throw error;
    }
  }

  /**
   * Get connection pool statistics
   */
  getPoolStats() {
    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingClients: this.pool.waitingCount,
      maxConnections: this.config.max,
      minConnections: this.config.min,
    };
  }

  /**
   * Health check for connection pool
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: Record<string, any>;
  }> {
    try {
      const startTime = Date.now();

      // Test database connection
      const result = await this.query('SELECT 1 as health_check', [], { timeout: 5000 });
      const dbLatency = Date.now() - startTime;

      // Test Redis connection
      const redisStartTime = Date.now();
      await this.redis.ping();
      const redisLatency = Date.now() - redisStartTime;

      const poolStats = this.getPoolStats();

      const isHealthy = (
        result.length > 0 &&
        dbLatency < 1000 &&
        redisLatency < 100 &&
        poolStats.idleConnections > 0
      );

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        details: {
          database: {
            latency: dbLatency,
            connected: result.length > 0,
          },
          redis: {
            latency: redisLatency,
            connected: true,
          },
          connectionPool: poolStats,
          timestamp: new Date().toISOString(),
        },
      };

    } catch (error: any) {
      logger.error('Health check failed', error);

      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down database connection pool');

    try {
      // Wait for active queries to complete (with timeout)
      await this.waitForActiveQueries(30000);

      // Close all connections
      await this.pool.end();

      // Close Redis connection
      await this.redis.quit();

      logger.info('Database connection pool shutdown completed');

    } catch (error: any) {
      logger.error('Error during database pool shutdown', error);
      throw error;
    }
  }

  // Private methods

  private setupEventHandlers(): void {
    this.pool.on('connect', (client) => {
      this.connectionCount++;
      logger.debug('New database connection established', {
        totalConnections: this.connectionCount,
      });
    });

    this.pool.on('remove', (client) => {
      this.connectionCount--;
      logger.debug('Database connection removed', {
        totalConnections: this.connectionCount,
      });
    });

    this.pool.on('error', (error) => {
      logger.error('Database pool error', error);
      this.metrics.incrementCounter('pool_error');
    });

    this.redis.on('error', (error) => {
      logger.error('Redis connection error', error);
      this.metrics.incrementCounter('redis_error');
    });
  }

  private async executeWithRetry<T = any>(
    sql: string,
    params: any[],
    options: QueryOptions
  ): Promise<T[]> {
    const maxRetries = options.retries || 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const client = await this.pool.connect();

        try {
          // Set query timeout if specified
          if (options.timeout) {
            await client.query(`SET statement_timeout = ${options.timeout}`);
          }

          const result = await client.query(sql, params);
          return result.rows;

        } finally {
          client.release();
        }

      } catch (error: any) {
        lastError = error;

        if (attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff for retries
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));

        logger.warn(`Query retry attempt ${attempt}/${maxRetries}`, {
          error: error.message,
          delay,
        });
      }
    }

    throw lastError!;
  }

  private async executeBatchWithConcurrency(
    queries: Array<{ sql: string; params: any[]; options?: QueryOptions }>,
    concurrency: number
  ): Promise<any[]> {
    const results: any[] = [];

    for (let i = 0; i < queries.length; i += concurrency) {
      const batch = queries.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(q => this.query(q.sql, q.params, q.options))
      );
      results.push(...batchResults);
    }

    return results;
  }

  private async getCachedResult<T>(key: string): Promise<T[] | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.warn('Cache read failed', { key, error });
      return null;
    }
  }

  private async setCachedResult<T>(key: string, data: T[], ttl: number): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      logger.warn('Cache write failed', { key, error });
    }
  }

  private generateQueryId(sql: string, params: any[]): string {
    const hash = require('crypto')
      .createHash('md5')
      .update(sql + JSON.stringify(params))
      .digest('hex');
    return hash.substring(0, 8);
  }

  private startHealthCheck(): void {
    // Perform health check every 30 seconds
    setInterval(() => {
      this.healthCheck().catch(error => {
        logger.error('Periodic health check failed', error);
      });
    }, 30000);
  }

  private async waitForActiveQueries(timeout: number): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const stats = this.getPoolStats();
      if (stats.totalConnections === stats.idleConnections) {
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.warn('Timeout waiting for active queries to complete');
  }
}

// Singleton instance
let dbPool: DatabaseConnectionPool | null = null;

export const createDatabasePool = (
  config: ConnectionPoolConfig,
  redisConfig: any
): DatabaseConnectionPool => {
  if (!dbPool) {
    dbPool = new DatabaseConnectionPool(config, redisConfig);
  }
  return dbPool;
};

export const getDatabasePool = (): DatabaseConnectionPool => {
  if (!dbPool) {
    throw new Error('Database pool not initialized. Call createDatabasePool first.');
  }
  return dbPool;
};
/**
 * Performance Optimization Middleware
 * Comprehensive performance enhancements for enterprise-scale applications
 */

import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import { LRUCache } from 'lru-cache';

import { createLogger } from '@/utils/logger';
import { globalMetrics } from '@/utils/metrics';

const logger = createLogger('PerformanceMiddleware');

// Response caching
const responseCache = new LRUCache<string, any>({
  max: 1000, // Maximum number of cached responses
  ttl: 5 * 60 * 1000, // 5 minutes TTL
  updateAgeOnGet: true,
  allowStale: false,
});

// Request deduplication cache
const requestDeduplicationCache = new LRUCache<string, Promise<any>>({
  max: 500,
  ttl: 30 * 1000, // 30 seconds
});

/**
 * Response compression middleware with intelligent configuration
 */
export const compressionMiddleware = compression({
  level: 6, // Good balance between compression and speed
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress already compressed content
    if (res.getHeader('content-encoding')) {
      return false;
    }

    // Compress JSON, text, and JavaScript
    const contentType = res.getHeader('content-type') as string;
    if (contentType) {
      return /json|text|javascript|xml/.test(contentType);
    }

    return compression.filter(req, res);
  },
});

/**
 * Response caching middleware for GET requests
 */
export const responseCacheMiddleware = (options: {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  shouldCache?: (req: Request, res: Response) => boolean;
} = {}) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    keyGenerator = (req) => `${req.method}:${req.originalUrl}`,
    shouldCache = (req, res) => req.method === 'GET' && res.statusCode === 200,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = keyGenerator(req);
    const cached = responseCache.get(cacheKey);

    if (cached) {
      // Cache hit
      globalMetrics.incrementCounter('response_cache_hits');

      res.set({
        'X-Cache': 'HIT',
        'Cache-Control': `public, max-age=${Math.floor(ttl / 1000)}`,
      });

      return res.json(cached);
    }

    // Cache miss - intercept response
    const originalJson = res.json;
    res.json = function(body: any) {
      if (shouldCache(req, res)) {
        responseCache.set(cacheKey, body, { ttl });
        globalMetrics.incrementCounter('response_cache_misses');

        res.set({
          'X-Cache': 'MISS',
          'Cache-Control': `public, max-age=${Math.floor(ttl / 1000)}`,
        });
      }

      return originalJson.call(this, body);
    };

    next();
  };
};

/**
 * Request deduplication middleware to prevent duplicate concurrent requests
 */
export const requestDeduplicationMiddleware = (
  keyGenerator: (req: Request) => string = (req) => `${req.method}:${req.originalUrl}:${JSON.stringify(req.body)}`
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only deduplicate for specific methods
    if (!['GET', 'POST'].includes(req.method)) {
      return next();
    }

    const dedupeKey = keyGenerator(req);
    const existingRequest = requestDeduplicationCache.get(dedupeKey);

    if (existingRequest) {
      globalMetrics.incrementCounter('request_deduplications');

      try {
        const result = await existingRequest;
        res.set('X-Request-Deduped', 'true');
        return res.json(result);
      } catch (error) {
        // If the original request failed, allow this request to proceed
        requestDeduplicationCache.delete(dedupeKey);
      }
    }

    // Create new request promise
    const requestPromise = new Promise((resolve, reject) => {
      const originalJson = res.json;
      const originalStatus = res.status;
      let statusCode = 200;

      res.status = function(code: number) {
        statusCode = code;
        return originalStatus.call(this, code);
      };

      res.json = function(body: any) {
        if (statusCode === 200) {
          resolve(body);
        } else {
          reject(new Error(`Request failed with status ${statusCode}`));
        }
        requestDeduplicationCache.delete(dedupeKey);
        return originalJson.call(this, body);
      };

      // Handle errors
      res.on('error', (error) => {
        reject(error);
        requestDeduplicationCache.delete(dedupeKey);
      });
    });

    requestDeduplicationCache.set(dedupeKey, requestPromise);
    next();
  };
};

/**
 * Performance monitoring middleware
 */
export const performanceMonitoringMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = process.hrtime.bigint();
  const startCpuUsage = process.cpuUsage();

  // Add performance context to request
  (req as any).performance = {
    startTime,
    startCpuUsage,
  };

  // Monitor response
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const endTime = process.hrtime.bigint();
    const endCpuUsage = process.cpuUsage(startCpuUsage);

    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const cpuTime = (endCpuUsage.user + endCpuUsage.system) / 1000; // Convert to milliseconds

    // Record performance metrics
    globalMetrics.recordLatency('request_duration', duration, {
      method: req.method,
      endpoint: req.route?.path || req.path,
      status_code: res.statusCode.toString(),
    });

    globalMetrics.recordLatency('request_cpu_time', cpuTime, {
      method: req.method,
      endpoint: req.route?.path || req.path,
    });

    // Add performance headers
    res.set({
      'X-Response-Time': `${duration.toFixed(2)}ms`,
      'X-CPU-Time': `${cpuTime.toFixed(2)}ms`,
    });

    // Log slow requests
    if (duration > 2000) { // Requests slower than 2 seconds
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration,
        cpuTime,
        statusCode: res.statusCode,
      });

      globalMetrics.incrementCounter('slow_requests', {
        method: req.method,
        endpoint: req.route?.path || req.path,
      });
    }

    return originalEnd.apply(this, args);
  };

  next();
};

/**
 * Memory usage monitoring middleware
 */
export const memoryMonitoringMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const memoryBefore = process.memoryUsage();

  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const memoryAfter = process.memoryUsage();

    const memoryDelta = {
      rss: memoryAfter.rss - memoryBefore.rss,
      heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
      heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
      external: memoryAfter.external - memoryBefore.external,
    };

    // Record memory metrics
    globalMetrics.setGauge('memory_usage_rss', memoryAfter.rss / 1024 / 1024); // MB
    globalMetrics.setGauge('memory_usage_heap_used', memoryAfter.heapUsed / 1024 / 1024);
    globalMetrics.setGauge('memory_usage_heap_total', memoryAfter.heapTotal / 1024 / 1024);

    // Log memory leaks
    if (memoryDelta.heapUsed > 10 * 1024 * 1024) { // More than 10MB increase
      logger.warn('Potential memory leak detected', {
        method: req.method,
        path: req.path,
        memoryDelta: {
          rss: `${(memoryDelta.rss / 1024 / 1024).toFixed(2)}MB`,
          heapUsed: `${(memoryDelta.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${(memoryDelta.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        },
      });

      globalMetrics.incrementCounter('potential_memory_leaks');
    }

    return originalEnd.apply(this, args);
  };

  next();
};

/**
 * Connection pooling and keep-alive optimization
 */
export const connectionOptimizationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Enable keep-alive
  res.set({
    'Connection': 'keep-alive',
    'Keep-Alive': 'timeout=5, max=1000',
  });

  // Optimize for HTTP/2
  if (req.httpVersion === '2.0') {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    });
  }

  next();
};

/**
 * Preflight optimization for CORS
 */
export const corsOptimizationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.method === 'OPTIONS') {
    // Cache preflight responses for 24 hours
    res.set({
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'public, max-age=86400',
    });

    globalMetrics.incrementCounter('preflight_requests');

    return res.status(204).end();
  }

  next();
};

/**
 * ETag generation for better caching
 */
export const etagMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.method !== 'GET') {
    return next();
  }

  const originalJson = res.json;
  res.json = function(body: any) {
    // Generate ETag based on content
    const crypto = require('crypto');
    const etag = crypto.createHash('md5').update(JSON.stringify(body)).digest('hex');

    res.set('ETag', `"${etag}"`);

    // Check if client has the same ETag
    const clientETag = req.headers['if-none-match'];
    if (clientETag === `"${etag}"`) {
      globalMetrics.incrementCounter('etag_cache_hits');
      return res.status(304).end();
    }

    globalMetrics.incrementCounter('etag_cache_misses');
    return originalJson.call(this, body);
  };

  next();
};

/**
 * Batch response processing for multiple requests
 */
export const batchProcessingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Only process POST requests to /batch endpoint
  if (req.method !== 'POST' || !req.path.includes('/batch')) {
    return next();
  }

  const batchRequests = req.body.requests;
  if (!Array.isArray(batchRequests)) {
    return next();
  }

  // Process batch requests efficiently
  const startTime = Date.now();

  Promise.allSettled(
    batchRequests.map(async (batchReq: any) => {
      // Process individual request
      // This would integrate with your existing request processing logic
      return { id: batchReq.id, result: 'processed' };
    })
  ).then(results => {
    const duration = Date.now() - startTime;

    globalMetrics.recordLatency('batch_processing_duration', duration);
    globalMetrics.incrementCounter('batch_requests_processed', {
      count: batchRequests.length.toString(),
    });

    res.json({
      success: true,
      results,
      duration,
      timestamp: Date.now(),
    });
  }).catch(next);
};

/**
 * Comprehensive performance middleware stack
 */
export const performanceMiddlewareStack = [
  compressionMiddleware,
  connectionOptimizationMiddleware,
  corsOptimizationMiddleware,
  performanceMonitoringMiddleware,
  memoryMonitoringMiddleware,
  etagMiddleware,
  responseCacheMiddleware(),
  requestDeduplicationMiddleware(),
  batchProcessingMiddleware,
];

/**
 * Cache management utilities
 */
export const cacheUtils = {
  clearResponseCache: () => {
    responseCache.clear();
    logger.info('Response cache cleared');
  },

  clearDeduplicationCache: () => {
    requestDeduplicationCache.clear();
    logger.info('Request deduplication cache cleared');
  },

  getCacheStats: () => ({
    responseCache: {
      size: responseCache.size,
      max: responseCache.max,
    },
    deduplicationCache: {
      size: requestDeduplicationCache.size,
      max: requestDeduplicationCache.max,
    },
  }),
};
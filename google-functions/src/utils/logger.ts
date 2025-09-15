import { appConfig } from './config';

// Enhanced log levels with TypeScript 5.9+ const assertions
export const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

// Performance monitoring constants
export const PERFORMANCE_THRESHOLDS = {
  SLOW_QUERY: 1000,
  SLOW_REQUEST: 2000,
  MEMORY_WARNING: 80,
} as const satisfies Record<string, number>;

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  correlationId?: string;
  userId?: string;
  functionName?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private correlationId?: string;
  private userId?: string;
  private functionName?: string;

  constructor(functionName?: string) {
    this.functionName = functionName;
  }

  setContext(correlationId?: string, userId?: string): void {
    this.correlationId = correlationId;
    this.userId = userId;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(appConfig.logLevel as LogLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }

  private formatLog(level: LogLevel, message: string, metadata?: Record<string, any>, error?: Error): LogEntry {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      correlationId: this.correlationId,
      userId: this.userId,
      functionName: this.functionName,
      metadata,
    };

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      };
    }

    return logEntry;
  }

  private output(logEntry: LogEntry): void {
    if (!this.shouldLog(logEntry.level)) {
      return;
    }

    const jsonLog = JSON.stringify(logEntry);

    switch (logEntry.level) {
      case LogLevel.ERROR:
        console.error(jsonLog);
        break;
      case LogLevel.WARN:
        console.warn(jsonLog);
        break;
      case LogLevel.INFO:
        console.info(jsonLog);
        break;
      case LogLevel.DEBUG:
        console.debug(jsonLog);
        break;
    }
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    const logEntry = this.formatLog(LogLevel.ERROR, message, metadata, error);
    this.output(logEntry);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    const logEntry = this.formatLog(LogLevel.WARN, message, metadata);
    this.output(logEntry);
  }

  info(message: string, metadata?: Record<string, any>): void {
    const logEntry = this.formatLog(LogLevel.INFO, message, metadata);
    this.output(logEntry);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    const logEntry = this.formatLog(LogLevel.DEBUG, message, metadata);
    this.output(logEntry);
  }

  // Performance logging
  time(label: string): void {
    if (appConfig.nodeEnv === 'development') {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (appConfig.nodeEnv === 'development') {
      console.timeEnd(label);
    }
  }

  // Request logging helper
  logRequest(method: string, path: string, statusCode: number, duration: number, metadata?: Record<string, any>): void {
    this.info('HTTP Request', {
      method,
      path,
      statusCode,
      duration,
      ...metadata,
    });
  }

  // Database operation logging
  logDatabaseOperation(operation: string, collection: string, duration: number, metadata?: Record<string, any>): void {
    this.debug('Database Operation', {
      operation,
      collection,
      duration,
      ...metadata,
    });
  }

  // External service logging
  logExternalService(service: string, operation: string, duration: number, success: boolean, metadata?: Record<string, any>): void {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    const message = `External Service ${success ? 'Success' : 'Failed'}`;

    const logEntry = this.formatLog(level, message, {
      service,
      operation,
      duration,
      success,
      ...metadata,
    });

    this.output(logEntry);
  }

  // Security logging
  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', metadata?: Record<string, any>): void {
    const level = severity === 'high' ? LogLevel.ERROR : LogLevel.WARN;

    this.output(this.formatLog(level, `Security Event: ${event}`, {
      securityEvent: true,
      severity,
      ...metadata,
    }));
  }

  // Business logic logging
  logBusinessEvent(event: string, metadata?: Record<string, any>): void {
    this.info(`Business Event: ${event}`, {
      businessEvent: true,
      ...metadata,
    });
  }
}

// Factory function to create logger instances
export const createLogger = (functionName?: string): Logger => {
  return new Logger(functionName);
};

// Default logger instance
export const logger = createLogger();

// Helper function to generate correlation IDs
export const generateCorrelationId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
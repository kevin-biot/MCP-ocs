/**
 * Structured Logging System - Addressing Qwen Review
 * 
 * Production-ready logging with proper structure and context
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  sessionId?: string;
  toolName?: string;
  namespace?: string;
  operation?: string;
  duration?: number;
  error?: Error;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

/**
 * Production-ready structured logger
 */
export class StructuredLogger {
  private serviceName: string;
  private logLevel: LogLevel;
  
  constructor(serviceName: string = 'mcp-ocs', logLevel: LogLevel = 'info') {
    this.serviceName = serviceName;
    this.logLevel = logLevel;
  }
  
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
  
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      this.writeLog('debug', message, context);
    }
  }
  
  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      this.writeLog('info', message, context);
    }
  }
  
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      this.writeLog('warn', message, context);
    }
  }
  
  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = error ? { ...context, error } : context;
      this.writeLog('error', message, errorContext);
    }
  }
  
  /**
   * Log tool execution with timing
   */
  toolExecution(toolName: string, sessionId: string, duration: number, success: boolean, context?: LogContext): void {
    this.info(`Tool execution ${success ? 'completed' : 'failed'}`, {
      toolName,
      sessionId,
      duration,
      success,
      operation: 'tool_execution',
      ...context
    });
  }
  
  /**
   * Log workflow state changes
   */
  workflowTransition(sessionId: string, fromState: string, toState: string, context?: LogContext): void {
    this.info('Workflow state transition', {
      sessionId,
      fromState,
      toState,
      operation: 'workflow_transition',
      ...context
    });
  }
  
  /**
   * Log memory operations
   */
  memoryOperation(operation: string, sessionId: string, resultCount: number, context?: LogContext): void {
    this.info('Memory operation completed', {
      sessionId,
      operation: `memory_${operation}`,
      resultCount,
      ...context
    });
  }
  
  /**
   * Log panic detection events
   */
  panicDetection(sessionId: string, panicType: string, severity: string, context?: LogContext): void {
    this.warn('Panic pattern detected', {
      sessionId,
      panicType,
      severity,
      operation: 'panic_detection',
      ...context
    });
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    return levels[level] >= levels[this.logLevel];
  }
  
  private writeLog(level: LogLevel, message: string, context?: LogContext): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      context: context ? this.sanitizeContext(context) : undefined
    };
    
    // Handle error objects specially
    if (context?.error) {
      logEntry.error = {
        message: context.error.message,
        stack: context.error.stack,
        name: context.error.name
      };
      // Remove error from context to avoid duplication
      const { error, ...cleanContext } = context;
      logEntry.context = Object.keys(cleanContext).length > 0 ? cleanContext : undefined;
    }
    
    // Use appropriate console method
    const output = JSON.stringify(logEntry);
    switch (level) {
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.log(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        break;
    }
  }
  
  private sanitizeContext(context: LogContext): LogContext {
    const sanitized: LogContext = {};
    
    for (const [key, value] of Object.entries(context)) {
      // Skip error objects (handled separately)
      if (key === 'error') continue;
      
      // Sanitize sensitive information
      if (this.isSensitiveKey(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > 1000) {
        // Truncate very long strings
        sanitized[key] = value.substring(0, 1000) + '... [TRUNCATED]';
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'credential',
      'authorization', 'cookie', 'session'
    ];
    
    return sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive)
    );
  }
}

/**
 * Global logger instance
 */
export const logger = new StructuredLogger();

/**
 * Logger middleware for timing operations
 */
export function withTiming<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      logger.debug(`Operation completed: ${operation}`, { operation, duration });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`Operation failed: ${operation}`, error instanceof Error ? error : new Error(String(error)), { operation, duration });
      throw error;
    }
  };
}

/**
 * Logger decorator for class methods
 */
export function LogMethod(operation?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const operationName = operation || `${target.constructor.name}.${propertyName}`;
    
    descriptor.value = withTiming(operationName, method);
  };
}

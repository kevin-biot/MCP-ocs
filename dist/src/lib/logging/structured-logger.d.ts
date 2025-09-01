/**
 * Structured Logging System - Addressing Qwen Review
 *
 * Production-ready logging with proper structure and context
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogContext {
    sessionId?: string | undefined;
    toolName?: string | undefined;
    namespace?: string | undefined;
    operation?: string | undefined;
    duration?: number | undefined;
    error?: Error | undefined;
    [key: string]: any;
}
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    service: string;
    context?: LogContext | undefined;
    error?: {
        message: string;
        stack?: string | undefined;
        name?: string | undefined;
    };
}
/**
 * Production-ready structured logger
 */
export declare class StructuredLogger {
    private serviceName;
    private logLevel;
    constructor(serviceName?: string, logLevel?: LogLevel);
    setLogLevel(level: LogLevel): void;
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, error?: Error, context?: LogContext): void;
    /**
     * Log tool execution with timing
     */
    toolExecution(toolName: string, sessionId: string, duration: number, success: boolean, context?: LogContext): void;
    /**
     * Log workflow state changes
     */
    workflowTransition(sessionId: string, fromState: string, toState: string, context?: LogContext): void;
    /**
     * Log memory operations
     */
    memoryOperation(operation: string, sessionId: string, resultCount: number, context?: LogContext): void;
    /**
     * Log panic detection events
     */
    panicDetection(sessionId: string, panicType: string, severity: string, context?: LogContext): void;
    private shouldLog;
    private writeLog;
    private sanitizeContext;
    private isSensitiveKey;
}
/**
 * Global logger instance
 */
export declare const logger: StructuredLogger;
/**
 * Logger middleware for timing operations
 */
export declare function withTiming<T extends any[], R>(operation: string, fn: (...args: T) => Promise<R>): (...args: T) => Promise<R>;
/**
 * Logger decorator for class methods
 */
export declare function LogMethod(operation?: string): (target: any, propertyName: string, descriptor: PropertyDescriptor) => void;

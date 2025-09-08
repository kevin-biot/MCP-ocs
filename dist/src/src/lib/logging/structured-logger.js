/**
 * Structured Logging System - Addressing Qwen Review
 *
 * Production-ready logging with proper structure and context
 */
/**
 * Production-ready structured logger
 */
export class StructuredLogger {
    serviceName;
    logLevel;
    constructor(serviceName = 'mcp-ocs', logLevel = 'info') {
        this.serviceName = serviceName;
        this.logLevel = logLevel;
    }
    setLogLevel(level) {
        this.logLevel = level;
    }
    debug(message, context) {
        if (this.shouldLog('debug')) {
            this.writeLog('debug', message, context);
        }
    }
    info(message, context) {
        if (this.shouldLog('info')) {
            this.writeLog('info', message, context);
        }
    }
    warn(message, context) {
        if (this.shouldLog('warn')) {
            this.writeLog('warn', message, context);
        }
    }
    error(message, error, context) {
        if (this.shouldLog('error')) {
            const errorContext = error ? { ...context, error } : context;
            this.writeLog('error', message, errorContext);
        }
    }
    /**
     * Log tool execution with timing
     */
    toolExecution(toolName, sessionId, duration, success, context) {
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
    workflowTransition(sessionId, fromState, toState, context) {
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
    memoryOperation(operation, sessionId, resultCount, context) {
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
    panicDetection(sessionId, panicType, severity, context) {
        this.warn('Panic pattern detected', {
            sessionId,
            panicType,
            severity,
            operation: 'panic_detection',
            ...context
        });
    }
    shouldLog(level) {
        const levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        return levels[level] >= levels[this.logLevel];
    }
    writeLog(level, message, context) {
        const logEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            service: this.serviceName,
            ...(context ? { context: this.sanitizeContext(context) } : {})
        };
        // Handle error objects specially
        if (context?.error) {
            const err = {
                message: context.error.message,
            };
            if (context.error.stack)
                err.stack = context.error.stack;
            if (context.error.name)
                err.name = context.error.name;
            logEntry.error = err;
            // Remove error from context to avoid duplication
            const { error, ...cleanContext } = context;
            if (Object.keys(cleanContext).length > 0) {
                logEntry.context = cleanContext;
            }
            else {
                if ('context' in logEntry)
                    delete logEntry.context;
            }
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
    sanitizeContext(context) {
        const sanitized = {};
        for (const [key, value] of Object.entries(context)) {
            // Skip error objects (handled separately)
            if (key === 'error')
                continue;
            // Sanitize sensitive information
            if (this.isSensitiveKey(key)) {
                sanitized[key] = '[REDACTED]';
            }
            else if (typeof value === 'string' && value.length > 1000) {
                // Truncate very long strings
                sanitized[key] = value.substring(0, 1000) + '... [TRUNCATED]';
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    isSensitiveKey(key) {
        const sensitiveKeys = [
            'password', 'token', 'secret', 'key', 'credential',
            'authorization', 'cookie', 'session'
        ];
        return sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive));
    }
}
/**
 * Global logger instance
 */
export const logger = new StructuredLogger();
/**
 * Logger middleware for timing operations
 */
export function withTiming(operation, fn) {
    return async (...args) => {
        const start = Date.now();
        try {
            const result = await fn(...args);
            const duration = Date.now() - start;
            logger.debug(`Operation completed: ${operation}`, { operation, duration });
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            logger.error(`Operation failed: ${operation}`, error instanceof Error ? error : new Error(String(error)), { operation, duration });
            throw error;
        }
    };
}
/**
 * Logger decorator for class methods
 */
export function LogMethod(operation) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        const operationName = operation || `${target.constructor.name}.${propertyName}`;
        descriptor.value = withTiming(operationName, method);
    };
}

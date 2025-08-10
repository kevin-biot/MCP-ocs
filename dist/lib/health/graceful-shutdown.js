/**
 * Graceful Shutdown Manager - Addressing Qwen Review
 *
 * Proper process lifecycle management for production deployments
 */
import { logger } from '../logging/structured-logger.js';
/**
 * Manages graceful shutdown of the MCP server
 */
export class GracefulShutdown {
    shutdownInProgress = false;
    shutdownHandlers = [];
    inflightOperations = new Set();
    shutdownTimeout = 30000; // 30 seconds default
    constructor() {
        this.setupSignalHandlers();
    }
    /**
     * Register a shutdown handler
     */
    registerHandler(handler) {
        this.shutdownHandlers.push(handler);
        logger.debug(`Registered shutdown handler: ${handler.name}`);
    }
    /**
     * Track an in-flight operation
     */
    trackOperation(operationId) {
        this.inflightOperations.add(operationId);
        logger.debug('Operation started', { operationId, totalInflight: this.inflightOperations.size });
    }
    /**
     * Complete an in-flight operation
     */
    completeOperation(operationId) {
        this.inflightOperations.delete(operationId);
        logger.debug('Operation completed', { operationId, totalInflight: this.inflightOperations.size });
    }
    /**
     * Set shutdown timeout
     */
    setShutdownTimeout(timeoutMs) {
        this.shutdownTimeout = timeoutMs;
    }
    /**
     * Check if shutdown is in progress
     */
    isShuttingDown() {
        return this.shutdownInProgress;
    }
    /**
     * Initiate graceful shutdown
     */
    async initiateShutdown(signal, exitCode = 0) {
        if (this.shutdownInProgress) {
            logger.warn('Shutdown already in progress, ignoring signal', { signal });
            return;
        }
        this.shutdownInProgress = true;
        logger.info('Initiating graceful shutdown', {
            signal,
            inflightOperations: this.inflightOperations.size,
            registeredHandlers: this.shutdownHandlers.length
        });
        const shutdownStart = Date.now();
        try {
            // Phase 1: Wait for in-flight operations to complete
            await this.waitForInflightOperations();
            // Phase 2: Execute shutdown handlers in reverse order
            await this.executeShutdownHandlers();
            const shutdownDuration = Date.now() - shutdownStart;
            logger.info('Graceful shutdown completed successfully', {
                signal,
                duration: shutdownDuration
            });
        }
        catch (error) {
            const shutdownDuration = Date.now() - shutdownStart;
            logger.error('Graceful shutdown encountered errors', error instanceof Error ? error : new Error(String(error)), {
                signal,
                duration: shutdownDuration
            });
        }
        finally {
            // Force exit after timeout to prevent hanging
            setTimeout(() => {
                logger.error('Forcing process exit after timeout');
                process.exit(1);
            }, 5000); // 5 second force-exit timeout
            process.exit(exitCode);
        }
    }
    /**
     * Setup signal handlers for various shutdown scenarios
     */
    setupSignalHandlers() {
        // Graceful shutdown signals
        process.on('SIGTERM', () => this.initiateShutdown('SIGTERM', 0));
        process.on('SIGINT', () => this.initiateShutdown('SIGINT', 0));
        // Immediate shutdown signals (with minimal cleanup)
        process.on('SIGQUIT', () => {
            logger.warn('Received SIGQUIT - immediate shutdown');
            process.exit(0);
        });
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught exception - initiating emergency shutdown', error instanceof Error ? error : new Error(String(error)));
            this.initiateShutdown('uncaughtException', 1);
        });
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled promise rejection - initiating emergency shutdown', reason instanceof Error ? reason : new Error(String(reason)), { promise: promise.toString() });
            this.initiateShutdown('unhandledRejection', 1);
        });
        logger.info('Signal handlers registered for graceful shutdown');
    }
    /**
     * Wait for all in-flight operations to complete
     */
    async waitForInflightOperations() {
        if (this.inflightOperations.size === 0) {
            logger.info('No in-flight operations to wait for');
            return;
        }
        logger.info('Waiting for in-flight operations to complete', {
            count: this.inflightOperations.size
        });
        const maxWait = 15000; // 15 seconds max wait
        const checkInterval = 500; // Check every 500ms
        const startTime = Date.now();
        while (this.inflightOperations.size > 0) {
            const elapsed = Date.now() - startTime;
            if (elapsed >= maxWait) {
                logger.warn('Timeout waiting for in-flight operations', {
                    remainingOperations: Array.from(this.inflightOperations),
                    timeoutMs: maxWait
                });
                break;
            }
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
        logger.info('In-flight operations completed', {
            finalCount: this.inflightOperations.size,
            waitTime: Date.now() - startTime
        });
    }
    /**
     * Execute all registered shutdown handlers
     */
    async executeShutdownHandlers() {
        if (this.shutdownHandlers.length === 0) {
            logger.info('No shutdown handlers to execute');
            return;
        }
        logger.info('Executing shutdown handlers', { count: this.shutdownHandlers.length });
        // Execute handlers in reverse order (LIFO)
        const handlersToExecute = [...this.shutdownHandlers].reverse();
        for (const handler of handlersToExecute) {
            const handlerStart = Date.now();
            try {
                logger.debug(`Executing shutdown handler: ${handler.name}`);
                // Execute with timeout
                const timeout = handler.timeout || 5000; // 5 second default
                await Promise.race([
                    handler.handler(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Handler timeout')), timeout))
                ]);
                const duration = Date.now() - handlerStart;
                logger.debug(`Shutdown handler completed: ${handler.name}`, { duration });
            }
            catch (error) {
                const duration = Date.now() - handlerStart;
                if (handler.critical) {
                    logger.error(`Critical shutdown handler failed: ${handler.name}`, error instanceof Error ? error : new Error(String(error)), { duration });
                    throw error; // Fail the entire shutdown process
                }
                else {
                    logger.warn(`Non-critical shutdown handler failed: ${handler.name}: ${error instanceof Error ? error.message : String(error)}`);
                    // Continue with other handlers
                }
            }
        }
        logger.info('All shutdown handlers executed');
    }
}
/**
 * Operation tracker for managing in-flight operations
 */
export class OperationTracker {
    static instance;
    gracefulShutdown;
    operationCounter = 0;
    constructor(gracefulShutdown) {
        this.gracefulShutdown = gracefulShutdown;
        OperationTracker.instance = this;
    }
    static getInstance() {
        if (!OperationTracker.instance) {
            throw new Error('OperationTracker not initialized');
        }
        return OperationTracker.instance;
    }
    /**
     * Track an async operation
     */
    async trackOperation(operationName, operation) {
        // Check if shutdown is in progress
        if (this.gracefulShutdown.isShuttingDown()) {
            throw new Error('Server is shutting down, rejecting new operations');
        }
        const operationId = `${operationName}-${++this.operationCounter}-${Date.now()}`;
        try {
            this.gracefulShutdown.trackOperation(operationId);
            logger.debug('Starting tracked operation', { operationId, operationName });
            const result = await operation();
            logger.debug('Tracked operation completed successfully', { operationId, operationName });
            return result;
        }
        catch (error) {
            logger.error('Tracked operation failed', error instanceof Error ? error : new Error(String(error)), { operationId, operationName });
            throw error;
        }
        finally {
            this.gracefulShutdown.completeOperation(operationId);
        }
    }
}
/**
 * Decorator for automatically tracking method operations
 */
export function TrackOperation(operationName) {
    return function (target, propertyName, descriptor) {
        const originalMethod = descriptor.value;
        const opName = operationName || `${target.constructor.name}.${propertyName}`;
        descriptor.value = async function (...args) {
            const tracker = OperationTracker.getInstance();
            return tracker.trackOperation(opName, () => originalMethod.apply(this, args));
        };
        return descriptor;
    };
}
/**
 * Utility function to create a shutdown handler
 */
export function createShutdownHandler(name, handler, options = {}) {
    return {
        name,
        handler,
        timeout: options.timeout || 5000,
        critical: options.critical || false
    };
}
/**
 * Global graceful shutdown instance
 */
export const gracefulShutdown = new GracefulShutdown();

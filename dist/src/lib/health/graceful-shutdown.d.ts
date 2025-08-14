/**
 * Graceful Shutdown Manager - Addressing Qwen Review
 *
 * Proper process lifecycle management for production deployments
 */
export interface ShutdownHandler {
    name: string;
    handler: () => Promise<void>;
    timeout?: number;
    critical?: boolean;
}
/**
 * Manages graceful shutdown of the MCP server
 */
export declare class GracefulShutdown {
    private shutdownInProgress;
    private shutdownHandlers;
    private inflightOperations;
    private shutdownTimeout;
    constructor();
    /**
     * Register a shutdown handler
     */
    registerHandler(handler: ShutdownHandler): void;
    /**
     * Track an in-flight operation
     */
    trackOperation(operationId: string): void;
    /**
     * Complete an in-flight operation
     */
    completeOperation(operationId: string): void;
    /**
     * Set shutdown timeout
     */
    setShutdownTimeout(timeoutMs: number): void;
    /**
     * Check if shutdown is in progress
     */
    isShuttingDown(): boolean;
    /**
     * Initiate graceful shutdown
     */
    initiateShutdown(signal: string, exitCode?: number): Promise<void>;
    /**
     * Setup signal handlers for various shutdown scenarios
     */
    private setupSignalHandlers;
    /**
     * Wait for all in-flight operations to complete
     */
    private waitForInflightOperations;
    /**
     * Execute all registered shutdown handlers
     */
    private executeShutdownHandlers;
}
/**
 * Operation tracker for managing in-flight operations
 */
export declare class OperationTracker {
    private static instance;
    private gracefulShutdown;
    private operationCounter;
    constructor(gracefulShutdown: GracefulShutdown);
    static getInstance(): OperationTracker;
    /**
     * Track an async operation
     */
    trackOperation<T>(operationName: string, operation: () => Promise<T>): Promise<T>;
}
/**
 * Decorator for automatically tracking method operations
 */
export declare function TrackOperation(operationName?: string): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Utility function to create a shutdown handler
 */
export declare function createShutdownHandler(name: string, handler: () => Promise<void>, options?: {
    timeout?: number;
    critical?: boolean;
}): ShutdownHandler;
/**
 * Global graceful shutdown instance
 */
export declare const gracefulShutdown: GracefulShutdown;

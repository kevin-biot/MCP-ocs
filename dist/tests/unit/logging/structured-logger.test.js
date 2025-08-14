/**
 * Unit tests for Structured Logger
 */
import { StructuredLogger, withTiming } from '../../../src/lib/logging/structured-logger';
describe('StructuredLogger', () => {
    let logger;
    let mockConsoleLog;
    let mockConsoleError;
    let mockConsoleWarn;
    let mockConsoleDebug;
    beforeEach(() => {
        logger = new StructuredLogger('test-service', 'debug');
        mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
        mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
        mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
        mockConsoleDebug = jest.spyOn(console, 'debug').mockImplementation();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('Basic Logging', () => {
        it('should log debug messages when level allows', () => {
            logger.debug('Debug message');
            expect(mockConsoleDebug).toHaveBeenCalledTimes(1);
        });
        it('should log info messages', () => {
            logger.info('Info message');
            expect(mockConsoleLog).toHaveBeenCalledTimes(1);
        });
        it('should log warning messages', () => {
            logger.warn('Warning message');
            expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
        });
        it('should log error messages', () => {
            logger.error('Error message');
            expect(mockConsoleError).toHaveBeenCalledTimes(1);
        });
    });
    describe('Context Handling', () => {
        it('should include basic context in log output', () => {
            logger.info('Test message', { operation: 'test' });
            expect(mockConsoleLog).toHaveBeenCalledTimes(1);
            const logCall = mockConsoleLog.mock.calls[0][0];
            const logEntry = JSON.parse(logCall);
            expect(logEntry.context.operation).toBe('test');
        });
    });
    describe('Error Handling', () => {
        it('should handle Error objects properly', () => {
            const testError = new Error('Test error');
            // API is error(message, error?, context?)
            logger.error('Operation failed', testError, {});
            expect(mockConsoleError).toHaveBeenCalledTimes(1);
            const logCall = mockConsoleError.mock.calls[0][0];
            const logEntry = JSON.parse(logCall);
            expect(logEntry.error).toBeDefined();
            expect(logEntry.error.message).toBe('Test error');
        });
    });
    describe('Specialized Logging Methods', () => {
        it('should log tool execution with correct method', () => {
            logger.toolExecution('oc_get_pods', 'session-123', 250, true, { operation: 'tool_execution' });
            expect(mockConsoleLog).toHaveBeenCalledTimes(1);
            const logCall = mockConsoleLog.mock.calls[0][0];
            const logEntry = JSON.parse(logCall);
            expect(logEntry.message).toBe('Tool execution completed');
            expect(logEntry.context.toolName).toBe('oc_get_pods');
            expect(logEntry.context.duration).toBe(250);
            expect(logEntry.context.success).toBe(true);
        });
        it('should log memory operations with correct method', () => {
            logger.memoryOperation('store', 'session-123', 150, { type: 'vector' });
            expect(mockConsoleLog).toHaveBeenCalledTimes(1);
            const logCall = mockConsoleLog.mock.calls[0][0];
            const logEntry = JSON.parse(logCall);
            expect(logEntry.message).toBe('Memory operation completed');
        });
    });
});
describe('withTiming utility', () => {
    it('should time operations', async () => {
        const testFunction = async () => 'success';
        // API is withTiming(operation, fn) -> returns wrapped function
        const wrapped = withTiming('test-operation', testFunction);
        const result = await wrapped();
        expect(result).toBe('success');
    });
});

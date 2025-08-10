/**
 * Unit tests for Structured Logger
 * Tests production-ready logging with security and context
 */

import { StructuredLogger, withTiming, LogMethod } from '../../../src/lib/logging/structured-logger.js';

describe('StructuredLogger', () => {
  let logger: StructuredLogger;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockConsoleWarn: jest.SpyInstance;
  let mockConsoleDebug: jest.SpyInstance;

  beforeEach(() => {
    logger = new StructuredLogger('test-service', 'debug');
    
    // Mock console methods
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
      logger.debug('Test debug message');
      
      expect(mockConsoleDebug).toHaveBeenCalledWith(
        expect.stringContaining('"level":"debug"')
      );
      expect(mockConsoleDebug).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Test debug message"')
      );
    });

    it('should log info messages', () => {
      logger.info('Test info message');
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('"level":"info"')
      );
    });

    it('should log warning messages', () => {
      logger.warn('Test warning message');
      
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('"level":"warn"')
      );
    });

    it('should log error messages', () => {
      const testError = new Error('Test error');
      logger.error('Test error message', testError);
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('"level":"error"')
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Test error message"')
      );
    });
  });

  describe('Log Level Filtering', () => {
    it('should respect log level settings', () => {
      // Set logger to info level
      logger.setLogLevel('info');
      
      // Debug should be filtered out
      logger.debug('Debug message');
      expect(mockConsoleDebug).not.toHaveBeenCalled();
      
      // Info and above should be logged
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');
      
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should filter based on error level', () => {
      logger.setLogLevel('error');
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      
      expect(mockConsoleDebug).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      
      logger.error('Error message');
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('Context Handling', () => {
    it('should include context in log output', () => {
      const context = {
        sessionId: 'test-session',
        operation: 'test-operation',
        duration: 150
      };
      
      logger.info('Test with context', context);
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.context.sessionId).toBe('test-session');
      expect(logEntry.context.operation).toBe('test-operation');
      expect(logEntry.context.duration).toBe(150);
    });

    it('should sanitize sensitive data in context', () => {
      const context = {
        password: 'secret123',
        token: 'bearer-token',
        apiKey: 'api-key-value',
        normal: 'normal-value'
      };
      
      logger.info('Test with sensitive data', context);
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.context.password).toBe('[REDACTED]');
      expect(logEntry.context.token).toBe('[REDACTED]');
      expect(logEntry.context.apiKey).toBe('[REDACTED]');
      expect(logEntry.context.normal).toBe('normal-value');
    });

    it('should truncate very long strings', () => {
      const context = {
        longString: 'A'.repeat(1500),
        normalString: 'normal'
      };
      
      logger.info('Test with long string', context);
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.context.longString).toContain('[TRUNCATED]');
      expect(logEntry.context.longString.length).toBeLessThan(1100);
      expect(logEntry.context.normalString).toBe('normal');
    });
  });

  describe('Error Handling', () => {
    it('should handle Error objects properly', () => {
      const testError = new Error('Test error message');
      testError.name = 'TestError';
      testError.stack = 'Error stack trace';
      
      logger.error('Error occurred', testError, { sessionId: 'test' });
      
      const logCall = mockConsoleError.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.error.message).toBe('Test error message');
      expect(logEntry.error.name).toBe('TestError');
      expect(logEntry.error.stack).toBe('Error stack trace');
      expect(logEntry.context.sessionId).toBe('test');
    });

    it('should exclude error from context when moved to error field', () => {
      const testError = new Error('Test error');
      const context = {
        sessionId: 'test',
        error: testError,
        otherData: 'value'
      };
      
      logger.error('Error with context', testError, context);
      
      const logCall = mockConsoleError.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.error).toBeDefined();
      expect(logEntry.context.error).toBeUndefined();
      expect(logEntry.context.sessionId).toBe('test');
      expect(logEntry.context.otherData).toBe('value');
    });
  });

  describe('Specialized Logging Methods', () => {
    it('should log tool execution with proper context', () => {
      logger.toolExecution('oc_get_pods', 'session-123', 250, true, {
        namespace: 'default',
        podCount: 5
      });
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.message).toBe('Tool execution completed');
      expect(logEntry.context.toolName).toBe('oc_get_pods');
      expect(logEntry.context.sessionId).toBe('session-123');
      expect(logEntry.context.duration).toBe(250);
      expect(logEntry.context.success).toBe(true);
      expect(logEntry.context.operation).toBe('tool_execution');
    });

    it('should log workflow transitions', () => {
      logger.workflowTransition('session-123', 'gathering', 'analyzing', {
        evidence: 3
      });
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.message).toBe('Workflow state transition');
      expect(logEntry.context.fromState).toBe('gathering');
      expect(logEntry.context.toState).toBe('analyzing');
      expect(logEntry.context.operation).toBe('workflow_transition');
    });

    it('should log memory operations', () => {
      logger.memoryOperation('search', 'session-123', 5, {
        query: 'pod failing'
      });
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.message).toBe('Memory operation completed');
      expect(logEntry.context.operation).toBe('memory_search');
      expect(logEntry.context.resultCount).toBe(5);
    });

    it('should log panic detection as warning', () => {
      logger.panicDetection('session-123', 'rapid-fire', 'high', {
        commandCount: 5,
        timeWindow: 30
      });
      
      const logCall = mockConsoleWarn.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.level).toBe('warn');
      expect(logEntry.message).toBe('Panic pattern detected');
      expect(logEntry.context.panicType).toBe('rapid-fire');
      expect(logEntry.context.severity).toBe('high');
    });
  });

  describe('Log Entry Structure', () => {
    it('should produce properly structured JSON logs', () => {
      logger.info('Test message', { key: 'value' });
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry).toMatchObject({
        level: 'info',
        message: 'Test message',
        timestamp: expect.any(String),
        service: 'test-service',
        context: {
          key: 'value'
        }
      });
      
      // Validate timestamp format
      expect(new Date(logEntry.timestamp)).toBeInstanceOf(Date);
    });

    it('should handle logs without context', () => {
      logger.info('Simple message');
      
      const logCall = mockConsoleLog.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.context).toBeUndefined();
      expect(logEntry.message).toBe('Simple message');
    });
  });
});

describe('withTiming utility', () => {
  let mockLogger: StructuredLogger;
  
  beforeEach(() => {
    mockLogger = new StructuredLogger('test');
    jest.spyOn(mockLogger, 'debug').mockImplementation();
    jest.spyOn(mockLogger, 'error').mockImplementation();
    
    // Mock the global logger
    jest.doMock('../../../src/lib/logging/structured-logger.js', () => ({
      logger: mockLogger
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should time successful operations', async () => {
    const mockOperation = jest.fn().mockResolvedValue('success');
    const timedOperation = withTiming('test-operation', mockOperation);
    
    const result = await timedOperation('arg1', 'arg2');
    
    expect(result).toBe('success');
    expect(mockOperation).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should time failed operations', async () => {
    const mockError = new Error('Operation failed');
    const mockOperation = jest.fn().mockRejectedValue(mockError);
    const timedOperation = withTiming('test-operation', mockOperation);
    
    await expect(timedOperation()).rejects.toThrow('Operation failed');
  });
});

describe('LogMethod decorator', () => {
  it('should wrap class methods with timing', async () => {
    class TestClass {
      @LogMethod('custom-operation')
      async testMethod(value: string): Promise<string> {
        return `processed-${value}`;
      }
    }
    
    const instance = new TestClass();
    const result = await instance.testMethod('input');
    
    expect(result).toBe('processed-input');
    // Note: Full integration test would require mocking the logger module
  });
});

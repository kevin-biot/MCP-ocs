/**
 * Simple test setup file - minimal version
 */
import { beforeEach, afterEach, jest } from '@jest/globals';
// Mock console methods to avoid noise in tests
beforeEach(() => {
    // Reset environment variables before each test
    process.env.NODE_ENV = 'test';
    process.env.MCP_LOG_LEVEL = 'error';
});
afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
});
// Global test utilities
globalThis.testUtils = {
    // Helper to create mock OpenShift command responses
    mockOcResponse: (command, output, exitCode = 0) => ({
        stdout: output,
        stderr: '',
        code: exitCode
    }),
    // Helper to create test configuration
    createTestConfig: (overrides = {}) => ({
        memory: {
            namespace: 'test-mcp-ocs',
            chromaHost: '127.0.0.1',
            chromaPort: 8000,
            jsonDir: './tests/tmp/memory',
            compression: false
        },
        openshift: {
            ocPath: 'oc',
            timeout: 5000
        },
        tools: {
            mode: 'single',
            enabledDomains: ['cluster', 'filesystem', 'knowledge', 'system'],
            contextFiltering: true
        },
        workflow: {
            panicDetection: true,
            enforcement: 'guidance',
            minEvidence: 2
        },
        environment: 'test',
        logLevel: 'error',
        ...overrides
    }),
    // Helper to create test memory entries
    createTestMemory: (type, overrides = {}) => {
        if (type === 'conversation') {
            return {
                sessionId: 'test-session',
                domain: 'test',
                timestamp: Date.now(),
                userMessage: 'Test user message',
                assistantResponse: 'Test assistant response',
                context: ['test', 'context'],
                tags: ['test', 'memory'],
                ...overrides
            };
        }
        else {
            return {
                incidentId: 'test-incident',
                domain: 'cluster',
                timestamp: Date.now(),
                symptoms: ['Test symptom'],
                rootCause: 'Test root cause',
                resolution: 'Test resolution',
                environment: 'test',
                tags: ['test', 'incident'],
                ...overrides
            };
        }
    }
};

/**
 * Test Utilities for MCP-ocs Unit Tests
 * Provides mock responses and test helpers
 */

export const testUtils = {
  mockOcResponse: (command: string, stdout: string, stderr: string = '') => {
    return {
      stdout,
      stderr,
      duration: 100,
      cached: false
    };
  },

  mockOpenShiftClient: () => {
    return {
      executeOc: jest.fn(),
      isAuthenticated: jest.fn().mockResolvedValue(true),
      getCurrentContext: jest.fn().mockResolvedValue('test-context')
    };
  },

  mockConfigSchema: () => {
    return {
      validateConfig: jest.fn(),
      getDefaultConfig: jest.fn(),
      mergeConfig: jest.fn()
    };
  }
};

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

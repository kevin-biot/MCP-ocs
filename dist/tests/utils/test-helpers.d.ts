/**
 * Test Utilities for MCP-ocs Unit Tests
 * Provides mock responses and test helpers
 */
export declare const testUtils: {
    mockOcResponse: (command: string, stdout: string, stderr?: string) => {
        stdout: string;
        stderr: string;
        duration: number;
        cached: boolean;
    };
    mockOpenShiftClient: () => {
        executeOc: jest.Mock<any, any, any>;
        isAuthenticated: jest.Mock<any, any, any>;
        getCurrentContext: jest.Mock<any, any, any>;
    };
    mockConfigSchema: () => {
        validateConfig: jest.Mock<any, any, any>;
        getDefaultConfig: jest.Mock<any, any, any>;
        mergeConfig: jest.Mock<any, any, any>;
    };
};

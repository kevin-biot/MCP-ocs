export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true
    }],
  },
  moduleNameMapper: {
    // Map alias to TS sources, prefer .ts when .js is imported in source
    '^@/(.*)\\.js$': '<rootDir>/src/$1.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^../../../MCP-files/src/memory-extension\\.ts$': '<rootDir>/tests/mocks/memory-extension.ts',
    // Map ESM-style .js internal imports in TS to .ts for tests
    '^\\.\\./\\.\\./types/(.*)\\.js$': '<rootDir>/src/types/$1.ts',
    '^\\.\\./\\.\\./registry/(.*)\\.js$': '<rootDir>/src/registry/$1.ts',
    '^\\.\\./types/(.*)\\.js$': '<rootDir>/src/types/$1.ts',
    
    '^\\.\\./\\.\\./v2/(.*)\\.js$': '<rootDir>/src/v2/$1.ts',
    '^\\.\\./\\.\\./lib/tools/(.*)\\.js$': '<rootDir>/src/lib/tools/$1.ts',
    '^\\.\\./\\.\\./tools/(.*)\\.js$': '<rootDir>/src/tools/$1.ts',
    '^\\.\\./check-namespace-health/(.*)\\.js$': '<rootDir>/src/v2/tools/check-namespace-health/$1.ts',
    '^\\.\\./\\.\\./\\.\\./src/tools/(.*)\\.js$': '<rootDir>/src/tools/$1.ts',
    '^\\.\\./\\.\\./\\.\\./lib/(.*)\\.js$': '<rootDir>/src/lib/$1.ts',
    '^\\.\\./\\.\\./v2-integration\\.js$': '<rootDir>/src/v2-integration.ts',
    '^\\./v2/(.*)\\.js$': '<rootDir>/src/v2/$1.ts',
    // Map local ESM-style relative .js imports in TS to .ts for tests
    '^\\./mcp-files-memory-extension\\.js$': '<rootDir>/src/lib/memory/mcp-files-memory-extension.ts'
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  testTimeout: 10000,
  verbose: true
};
    // Map additional relative ESM .js imports to TS sources for tests
    '^\\.\\./lib/errors/(.*)\\.js$': '<rootDir>/src/lib/errors/$1.ts',
    '^\\.\\./errors/(.*)\\.js$': '<rootDir>/src/lib/errors/$1.ts',

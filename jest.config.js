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
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^../../../MCP-files/src/memory-extension\\.ts$': '<rootDir>/tests/mocks/memory-extension.ts',
    // Map ESM-style .js internal imports in TS to .ts for tests
    '^\\.\\./\\.\\./types/(.*)\\.js$': '<rootDir>/src/types/$1.ts',
    '^\\.\\./\\.\\./registry/(.*)\\.js$': '<rootDir>/src/registry/$1.ts',
    '^\\.\\./types/(.*)\\.js$': '<rootDir>/src/types/$1.ts'
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

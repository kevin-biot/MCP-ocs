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
    // Prefer compiled JS from dist for core modules used in unit tests to avoid TS transform issues
    '^@/lib/errors/(.*)\.js$': '<rootDir>/src/lib/errors/$1.ts',
    '^@/utils/(.*)$': '<rootDir>/dist/src/utils/$1.js',
    '^@/lib/tools/(.*)$': '<rootDir>/dist/src/lib/tools/$1.js',
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
    '^\\.\\./\\.\\./lib/templates/(.*)\\.js$': '<rootDir>/src/lib/templates/$1.ts',
    '^\\.\\./\\.\\./tools/(.*)\\.js$': '<rootDir>/src/tools/$1.ts',
    '^\\.\\./check-namespace-health/(.*)\\.js$': '<rootDir>/src/v2/tools/check-namespace-health/$1.ts',
    '^\\.\\./\\.\\./\\.\\./src/tools/(.*)\\.js$': '<rootDir>/src/tools/$1.ts',
    '^\\.\\./\\.\\./\\.\\./lib/(.*)\\.js$': '<rootDir>/src/lib/$1.ts',
    '^\\.\\./\\.\\./v2-integration\\.js$': '<rootDir>/src/v2-integration.ts',
    '^\\./v2/(.*)\\.js$': '<rootDir>/src/v2/$1.ts',
    // Map local ESM-style relative .js imports in TS to .ts for tests
    '^\\./mcp-files-memory-extension\\.js$': '<rootDir>/src/lib/memory/mcp-files-memory-extension.ts',
    '^\\./blocks/(.*)\\.js$': '<rootDir>/src/lib/templates/blocks/$1.ts',
    '^\\./infrastructure-blocks\\.js$': '<rootDir>/src/lib/templates/blocks/infrastructure-blocks.ts',
    '^\\./workload-blocks\\.js$': '<rootDir>/src/lib/templates/blocks/workload-blocks.ts',
    // Relative imports inside library modules
    '^\.\./errors/(.*)\\.js$': '<rootDir>/src/lib/errors/$1.ts',
    '^\./errors/(.*)\\.js$': '<rootDir>/src/lib/errors/$1.ts',
    '^\./expr\\.js$': '<rootDir>/src/lib/rubrics/expr.ts',
    '^\./rubric-registry\\.js$': '<rootDir>/src/lib/rubrics/rubric-registry.ts',
    '^\./error-types\.js$': '<rootDir>/src/lib/errors/error-types.ts',
    // Generic catch-alls to map ESM-style relative .js imports in TS to TS sources
    '^.*/src/(.*)\\.js$': '<rootDir>/src/$1.ts',
    '^.*/utils/(.*)\\.js$': '<rootDir>/src/utils/$1.ts',
    '^.*/lib/errors/(.*)\\.js$': '<rootDir>/src/lib/errors/$1.ts',
    '^.*/lib/rubrics/(.*)\\.js$': '<rootDir>/src/lib/rubrics/$1.ts',
    '^.*/lib/templates/(.*)\\.js$': '<rootDir>/src/lib/templates/$1.ts'
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

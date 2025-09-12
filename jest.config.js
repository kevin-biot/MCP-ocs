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
    // Identity map for dist ESM imports referenced in selective tests
    '^\.\.\/\.\.\/\.\.\/dist\/src\/lib\/tools\/(.*)\\.js$': '<rootDir>/dist/src/lib/tools/$1.js',
    '^\.\.\/\.\.\/\.\.\/dist\/src\/lib\/memory\/(.*)\\.js$': '<rootDir>/dist/src/lib/memory/$1.js',
    // Local relative .js imports inside src/lib/tools mapped to TS for tests
    '^\./metrics-writer\\.js$': '<rootDir>/src/lib/tools/metrics-writer.ts',
    '^\./evidence-anchors\\.js$': '<rootDir>/src/lib/tools/evidence-anchors.ts',
    '^\./vector-writer\\.js$': '<rootDir>/src/lib/tools/vector-writer.ts',
    '^\./instrumentation-middleware\\.js$': '<rootDir>/src/lib/tools/instrumentation-middleware.ts',
    '^\./tool-args-validator\\.js$': '<rootDir>/src/lib/tools/tool-args-validator.ts',
    '^\./tool-memory-gateway\\.js$': '<rootDir>/src/lib/tools/tool-memory-gateway.ts',
    '^\.\./memory/shared-memory\\.js$': '<rootDir>/src/lib/memory/shared-memory.ts',
    '^\.\./memory/mcp-ocs-memory-adapter\\.js$': '<rootDir>/src/lib/memory/mcp-ocs-memory-adapter.ts',
    '^\.\./memory/unified-memory-adapter\\.js$': '<rootDir>/src/lib/memory/unified-memory-adapter.ts',
    '^\.\./memory/utils/tag-enforcer\\.js$': '<rootDir>/src/lib/memory/utils/tag-enforcer.ts',
    // Memory adapters / CLI mappings for Phase 2 tests
    '^\./chroma-memory-manager\\.js$': '<rootDir>/src/lib/memory/chroma-memory-manager.ts',
    '^\.\./lib/memory/chroma-memory-manager\\.js$': '<rootDir>/src/lib/memory/chroma-memory-manager.ts',
    '^\.\./lib/type-guards/(.*)\\.js$': '<rootDir>/src/lib/type-guards/$1.ts',
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
    '^\\.\\./\\.\\./lib/type-guards/(.*)\\.js$': '<rootDir>/src/lib/type-guards/$1.ts',
    '^\\.\\./\\.\\./lib/templates/(.*)\\.js$': '<rootDir>/src/lib/templates/$1.ts',
    '^\\.\\./\\.\\./tools/(.*)\\.js$': '<rootDir>/src/tools/$1.ts',
    '^\\.\\./check-namespace-health/(.*)\\.js$': '<rootDir>/src/v2/tools/check-namespace-health/$1.ts',
    '^\\.\\./\\.\\./\\.\\./src/tools/(.*)\\.js$': '<rootDir>/src/tools/$1.ts',
    '^\\.\\./\\.\\./\\.\\./lib/(.*)\\.js$': '<rootDir>/src/lib/$1.ts',
    '^\\.\\./\\.\\./v2-integration\\.js$': '<rootDir>/src/v2-integration.ts',
    '^\\./v2/(.*)\\.js$': '<rootDir>/src/v2/$1.ts',
    // Map local ESM-style relative .js imports in TS to .ts for tests
    '^\\./mcp-files-memory-extension\\.js$': '<rootDir>/src/lib/memory/mcp-files-memory-extension.ts',
    '^\\./chroma-adapter\\.js$': '<rootDir>/src/lib/memory/chroma-adapter.ts',
    '^\\./unified-memory-adapter\\.js$': '<rootDir>/src/lib/memory/unified-memory-adapter.ts',
    '^\\.\\./config/feature-flags\\.js$': '<rootDir>/src/lib/config/feature-flags.ts',
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
    '^.*/lib/templates/(.*)\\.js$': '<rootDir>/src/lib/templates/$1.ts',
    '^\./time\\.js$': '<rootDir>/src/utils/time.ts'
  },
  // Resolve local ESM-style relative imports inside src/utils
  resolver: undefined,
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

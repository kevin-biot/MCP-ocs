import base from './jest.config.js';

export default {
  ...base,
  // Keep unit tests; exclude integration/e2e/real
  testPathIgnorePatterns: [
    '<rootDir>/tests/integration',
    '<rootDir>/tests/e2e',
    '<rootDir>/tests/real'
  ],
  moduleNameMapper: {
    ...(base.moduleNameMapper || {}),
    // Mock BlockRegistry to avoid infra dependencies in offline unit tests
    '^\\./blocks/block-registry\\.js$': '<rootDir>/tests/mocks/templates/block-registry.ts'
  }
};


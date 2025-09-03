module.exports = {
  testEnvironment: 'node',
  // Only run unit tests written in plain JS
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/*.spec.js'],
  // No TS transforms — execute compiled JS directly
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  verbose: true,
};


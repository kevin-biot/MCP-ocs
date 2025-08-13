#!/bin/bash

# Quick fix for the broken import statements
echo "🔧 Quick Fix: Repairing Broken Import Statements"
echo "==============================================="

# 1. Fix OpenShift test import
echo "1. Fixing openshift-client.test.ts import..."
sed -i '' "s|import { OpenShiftClient } from '../../../src/lib/openshift-client-enhanced.*|import { OpenShiftClient } from '../../../src/lib/openshift-client-enhanced';|" tests/unit/openshift/openshift-client.test.ts

# 2. Fix logging test import
echo "2. Fixing structured-logger.test.ts import..."
sed -i '' "s|import { StructuredLogger, withTiming, LogMethod } from '../../../src/lib/logging/structured-logger.*|import { StructuredLogger, withTiming, LogMethod } from '../../../src/lib/logging/structured-logger';|" tests/unit/logging/structured-logger.test.ts

# Also fix any broken jest.doMock lines
sed -i '' "s|jest.doMock('../../../src/lib/logging/structured-logger.*|jest.doMock('../../../src/lib/logging/structured-logger', () => ({|" tests/unit/logging/structured-logger.test.ts

# 3. Fix config test import
echo "3. Fixing schema.test.ts import..."
sed -i '' "s|} from '../../../src/lib/config/schema.*|} from '../../../src/lib/config/schema';|" tests/unit/config/schema.test.ts

# 4. Fix Jest config - use correct option name
echo "4. Fixing Jest configuration (moduleNameMapping → moduleNameMapper)..."
cat > jest.config.js << 'EOF'
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
    '^@tests/(.*)$': '<rootDir>/tests/$1'
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
EOF

# 5. Test the fix
echo ""
echo "5. Testing the repairs..."
npm run test:unit

echo ""
echo "✅ Import statement repairs complete!"
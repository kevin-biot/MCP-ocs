#!/bin/bash

# Fix TypeScript/Jest Import Configuration Issues
echo "🔧 Fixing TypeScript/Jest Import Configuration"
echo "=============================================="

# 1. Fix tsconfig.json - remove tests exclusion conflict
echo "1. Fixing tsconfig.json configuration..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": ".",
    "resolveJsonModule": true,
    "types": ["node", "jest"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@tests/*": ["tests/*"]
    }
  },
  "include": [
    "src/**/*", 
    "tests/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
EOF

# 2. Fix jest.config.js to handle module resolution properly
echo "2. Updating Jest configuration..."
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
  moduleNameMapping: {
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

# 3. Fix test imports to use relative paths without extensions
echo "3. Fixing test file imports..."

# Fix OpenShift test
sed -i '' 's|../../../src/lib/openshift-client-enhanced.*|../../../src/lib/openshift-client-enhanced|' tests/unit/openshift/openshift-client.test.ts

# Fix logging test  
sed -i '' 's|../../../src/lib/logging/structured-logger.*|../../../src/lib/logging/structured-logger|' tests/unit/logging/structured-logger.test.ts

# Fix config test
sed -i '' 's|../../../src/lib/config/schema.*|../../../src/lib/config/schema|' tests/unit/config/schema.test.ts

# 4. Test the fix
echo ""
echo "4. Testing the configuration fix..."
npm run test:unit

echo ""
echo "✅ TypeScript/Jest configuration fix applied!"
echo "🎯 Expected result: 3 failing test suites should now pass"
# MCP-OCS Testing Standards & Conventions

## 🎯 Overview

This document establishes testing standards, conventions, and best practices for the MCP-OCS project to ensure consistent, maintainable, and effective testing across all components.

## 📁 File Organization Standards

### Directory Structure
```
tests/
├── unit/                    # Unit tests for individual components
│   ├── openshift/          # OpenShift client tests
│   ├── memory/             # Memory management tests
│   ├── logging/            # Logging system tests
│   ├── config/             # Configuration tests
│   └── tools/              # Tool execution tests
├── integration/            # Component interaction tests
├── e2e/                    # End-to-end workflow tests
├── performance/            # Performance and load tests
├── fixtures/               # Test data and mock responses
└── utils/                  # Shared test utilities
```

### Naming Conventions

#### Test Files
- **Pattern**: `[component-name].test.ts`
- **Examples**: 
  - `openshift-client.test.ts`
  - `vector-memory.test.ts`
  - `structured-logger.test.ts`

#### Test Suites
- **Pattern**: Component or feature name
- **Examples**: `OpenShiftClient`, `VectorMemoryManager`, `StructuredLogger`

#### Test Cases
- **Pattern**: `should [expected behavior] when [condition]`
- **Examples**:
  - `should initialize with valid configuration`
  - `should handle timeout errors gracefully`
  - `should sanitize sensitive information in logs`

#### Mock Variables
- **Pattern**: `mock[ComponentName]` or `mock[FunctionName]`
- **Examples**: `mockExecAsync`, `mockOpenShiftClient`, `mockLogger`

## 🏗️ Test File Structure

### Standard Template
```typescript
/**
 * Unit tests for [Component Name]
 * Tests [specific functionality description]
 */

import { ComponentClass } from '../../../src/lib/component.js';
import { dependency1, dependency2 } from 'external-library';

// Mock external dependencies
jest.mock('external-library');
jest.mock('child_process');

// Type-safe mock declarations
const mockDependency = dependency1 as jest.MockedFunction<typeof dependency1>;

describe('[Component Name]', () => {
  let component: ComponentClass;
  let testConfig: ConfigType;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup test configuration
    testConfig = {
      // ... test configuration
    };
    
    // Initialize component
    component = new ComponentClass(testConfig);
  });

  afterEach(() => {
    // Cleanup if needed
    jest.restoreAllMocks();
  });

  describe('[Feature Group]', () => {
    it('should [expected behavior]', async () => {
      // Arrange
      const inputData = { /* test data */ };
      mockDependency.mockResolvedValue(expectedResult);
      
      // Act
      const result = await component.methodUnderTest(inputData);
      
      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockDependency).toHaveBeenCalledWith(expectedArgs);
    });

    it('should handle error conditions', async () => {
      // Arrange
      const errorMessage = 'Test error';
      mockDependency.mockRejectedValue(new Error(errorMessage));
      
      // Act & Assert
      await expect(component.methodUnderTest({}))
        .rejects.toThrow(errorMessage);
    });
  });
});
```

## 🎭 Mocking Standards

### External Dependencies
```typescript
// Always mock external dependencies
jest.mock('child_process');
jest.mock('fs/promises');
jest.mock('util');

// Create typed mocks
const mockExec = exec as jest.MockedFunction<typeof exec>;
const mockPromisify = promisify as jest.MockedFunction<typeof promisify>;
```

### Internal Dependencies
```typescript
// Mock internal modules when testing in isolation
jest.mock('../../../src/lib/logging/structured-logger.js');

// Provide mock implementations
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
};
```

### Mock Data Patterns
```typescript
// Create reusable mock data generators
const createMockPodInfo = (overrides: Partial<PodInfo> = {}): PodInfo => ({
  name: 'test-pod',
  namespace: 'default',
  status: 'Running',
  ready: '1/1',
  restarts: 0,
  age: '5m',
  node: 'worker-1',
  ...overrides
});

// Use factories for consistent test data
const mockOpenShiftResponse = (pods: PodInfo[]) => ({
  items: pods,
  metadata: { resourceVersion: '12345' }
});
```

## 🧪 Testing Categories & Approaches

### Unit Tests
**Focus**: Individual component functionality in isolation

```typescript
describe('Component Unit Tests', () => {
  // Test public API methods
  // Test error handling
  // Test edge cases
  // Test configuration validation
});
```

### Integration Tests
**Focus**: Component interactions and data flow

```typescript
describe('Component Integration', () => {
  // Test component-to-component communication
  // Test data persistence workflows
  // Test error propagation
  // Test configuration inheritance
});
```

### Performance Tests
**Focus**: Performance characteristics and limits

```typescript
describe('Performance Tests', () => {
  it('should handle concurrent operations within time limit', async () => {
    const startTime = performance.now();
    
    const promises = Array(100).fill(null).map(() => 
      component.performOperation()
    );
    
    await Promise.all(promises);
    
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(1000); // 1 second limit
  });
});
```

### Security Tests
**Focus**: Security vulnerabilities and data protection

```typescript
describe('Security Tests', () => {
  it('should prevent command injection', () => {
    const maliciousInput = 'valid-input; rm -rf /';
    
    expect(() => component.processInput(maliciousInput))
      .toThrow('Invalid input format');
  });
  
  it('should sanitize sensitive data in logs', () => {
    const sensitiveData = 'secret-token-123';
    
    const logOutput = captureLogOutput(() => 
      component.authenticate(sensitiveData)
    );
    
    expect(logOutput).not.toContain(sensitiveData);
  });
});
```

## 📊 Test Quality Standards

### Coverage Requirements
- **Unit Tests**: 80% line coverage minimum
- **Integration Tests**: 70% interaction coverage
- **Critical Paths**: 100% coverage required

### Performance Standards
- **Test Execution**: Individual tests <1 second
- **Suite Execution**: Test suites <30 seconds
- **Memory Usage**: No memory leaks in test runs

### Error Testing
- **Error Conditions**: All error paths tested
- **Edge Cases**: Boundary conditions validated
- **Recovery**: Error recovery mechanisms tested

## 🔧 Test Utilities & Helpers

### Common Test Utilities
```typescript
// File: tests/utils/test-helpers.ts

export const createTestConfig = (overrides = {}) => ({
  timeout: 5000,
  retries: 3,
  debug: false,
  ...overrides
});

export const waitFor = (condition: () => boolean, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (condition()) {
        resolve(true);
      } else if (Date.now() - start > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
};

export const captureLogOutput = (fn: () => void): string[] => {
  const logs: string[] = [];
  const originalLog = console.log;
  
  console.log = (...args) => {
    logs.push(args.join(' '));
  };
  
  try {
    fn();
    return logs;
  } finally {
    console.log = originalLog;
  }
};
```

### Mock Response Generators
```typescript
// File: tests/utils/mock-generators.ts

export const mockOcResponse = (command: string, data: any) => ({
  stdout: JSON.stringify(data),
  stderr: '',
  command,
  duration: Math.random() * 100,
  cached: false
});

export const mockErrorResponse = (message: string, code?: string) => {
  const error = new Error(message) as any;
  if (code) error.code = code;
  return error;
};
```

## 📋 Test Execution Guidelines

### Running Tests
```bash
# Run all tests
npm run test:unit

# Run specific test file
npm run test:unit -- tests/unit/openshift/openshift-client.test.ts

# Run with coverage
npm run test:coverage

# Run with verbose output
npm run test:unit -- --verbose

# Run in watch mode during development
npm run test:watch
```

### Test Environment
```bash
# Environment variables for testing
NODE_ENV=test
LOG_LEVEL=error
DISABLE_EXTERNAL_CALLS=true
```

### Debugging Tests
```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest tests/unit/specific.test.ts

# Run single test with detailed output
npm run test:unit -- --testNamePattern="specific test name" --verbose
```

## 🚫 Testing Anti-Patterns

### Avoid These Practices

#### Testing Implementation Details
```typescript
// ❌ Bad: Testing private methods
expect(component['privateMethod']).toHaveBeenCalled();

// ✅ Good: Testing public behavior
expect(component.publicMethod()).toReturn(expectedResult);
```

#### Brittle Tests
```typescript
// ❌ Bad: Testing exact error messages
expect(error.message).toBe('Exact error message');

// ✅ Good: Testing error types or patterns
expect(error).toBeInstanceOf(ValidationError);
expect(error.message).toMatch(/validation failed/i);
```

#### Test Interdependence
```typescript
// ❌ Bad: Tests depending on other tests
describe('Dependent Tests', () => {
  let sharedState;
  
  it('sets up state', () => {
    sharedState = setupData();
  });
  
  it('uses shared state', () => {
    expect(sharedState).toBeDefined(); // Fragile!
  });
});

// ✅ Good: Independent tests
describe('Independent Tests', () => {
  beforeEach(() => {
    // Each test gets fresh state
  });
});
```

## 📚 References & Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs)
- [TypeScript Testing Guide](https://typescript-lang.org/docs)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

### Internal Resources
- Test configuration: `jest.config.js`
- Test utilities: `tests/utils/`
- Mock generators: `tests/fixtures/`
- Analysis scripts: `scripts/testing/analysis/`

---

**Last Updated**: August 13, 2025  
**Owner**: Development Team  
**Review**: Before major testing changes
/**
 * Simple unit test - Basic functionality check
 */

import { describe, it, expect } from '@jest/globals';

describe('Basic Test Setup', () => {
  it('should have working Jest environment', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have test utilities available', () => {
    expect((globalThis as any).testUtils).toBeDefined();
    expect((globalThis as any).testUtils.createTestConfig).toBeDefined();
  });

  it('should create test configuration', () => {
    const config = (globalThis as any).testUtils.createTestConfig();
    expect(config.environment).toBe('test');
    expect(config.memory.namespace).toBe('test-mcp-ocs');
  });

  it('should mock OpenShift responses', () => {
    const response = (globalThis as any).testUtils.mockOcResponse('get pods', '{"items":[]}');
    expect(response.stdout).toBe('{"items":[]}');
    expect(response.code).toBe(0);
  });
});

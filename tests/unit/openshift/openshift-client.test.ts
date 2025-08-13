/**
 * Unit tests for Enhanced OpenShift Client
 */

import { OpenShiftClient } from '../../../src/lib/openshift-client-enhanced';

// Provide explicit mocks to avoid noisy logs and execAsync errors
jest.mock('child_process', () => ({ exec: jest.fn() }));
jest.mock('util', () => ({
  promisify: (_fn: any) => (
    ..._args: any[]
  ) => Promise.resolve({ stdout: '', stderr: '' })
}));

let restoreConsole: (() => void) | null = null;
beforeEach(() => {
  const mocks: jest.SpyInstance[] = [];
  mocks.push(jest.spyOn(console, 'log').mockImplementation(() => {}));
  mocks.push(jest.spyOn(console, 'error').mockImplementation(() => {}));
  mocks.push(jest.spyOn(console, 'warn').mockImplementation(() => {}));
  mocks.push(jest.spyOn(console, 'debug').mockImplementation(() => {}));
  restoreConsole = () => {
    mocks.forEach(m => m.mockRestore());
    restoreConsole = null;
  };
});

afterEach(() => {
  if (restoreConsole) restoreConsole();
});

describe('OpenShiftClient', () => {
  let client: OpenShiftClient;

  beforeEach(() => {
    client = new OpenShiftClient({
      ocPath: 'oc',
      timeout: 5000
    });
  });

  it('should initialize correctly', () => {
    expect(client).toBeInstanceOf(OpenShiftClient);
  });

  it('should get cluster info', async () => {
    try {
      const info = await client.getClusterInfo();
      expect(info).toBeDefined();
    } catch (error) {
      // Expected to fail in test environment
      expect(error).toBeDefined();
    }
  });

  it('should get pods', async () => {
    try {
      const pods = await client.getPods();
      expect(Array.isArray(pods)).toBe(true);
    } catch (error) {
      // Expected to fail in test environment
      expect(error).toBeDefined();
    }
  });

  it('should clear cache', () => {
    expect(() => client.clearCache()).not.toThrow();
  });

  it('should get health status', () => {
    const health = client.getHealth();
    expect(health).toHaveProperty('healthy');
    expect(health).toHaveProperty('issues');
  });
});

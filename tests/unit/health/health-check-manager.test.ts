/**
 * Unit tests for HealthCheckManager
 */

// Mock fs/promises used via dynamic import in checkFileSystemAccess
jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue('health-check'),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

import { HealthCheckManager } from '../../../src/lib/health/health-check';

describe('HealthCheckManager', () => {
  let openshift: any;
  let memory: any;
  let workflow: any;
  let configValidator: any;
  let restoreConsole: (() => void) | null = null;

  beforeEach(() => {
    // Silence logs during tests
    const mocks: jest.SpyInstance[] = [];
    mocks.push(jest.spyOn(console, 'error').mockImplementation(() => {}));
    mocks.push(jest.spyOn(console, 'warn').mockImplementation(() => {}));
    mocks.push(jest.spyOn(console, 'log').mockImplementation(() => {}));
    mocks.push(jest.spyOn(console, 'debug').mockImplementation(() => {}));
    restoreConsole = () => { mocks.forEach(m => m.mockRestore()); restoreConsole = null; };

    openshift = {
      getClusterInfo: jest.fn().mockResolvedValue({ status: 'connected', serverUrl: 'u', currentUser: 'me', version: 'v' }),
    };
    memory = {
      getStats: jest.fn().mockResolvedValue({
        chromaAvailable: true,
        totalConversations: 1,
        totalOperational: 1,
        storageUsed: '1 MB',
        namespace: 'test'
      }),
    };
    workflow = {
      getActiveStates: jest.fn().mockResolvedValue({ activeSessions: 0 }),
      getEnforcementLevel: jest.fn().mockReturnValue('guidance'),
    };
    configValidator = {};
  });

  afterEach(() => { if (restoreConsole) restoreConsole(); });

  function makeManager() {
    return new HealthCheckManager(openshift, memory, workflow, configValidator);
  }

  it('performs health check with all healthy checks', async () => {
    const mgr = makeManager();
    const res = await mgr.performHealthCheck();
    expect(res.status).toBe('healthy');
    expect(res.summary.total).toBeGreaterThan(0);
    expect(res.summary.unhealthy).toBe(0);
  });

  it('reports degraded when memory chroma is unavailable', async () => {
    memory.getStats.mockResolvedValueOnce({
      chromaAvailable: false,
      totalConversations: 0,
      totalOperational: 0,
      storageUsed: '0 MB',
      namespace: 'test'
    });
    const mgr = makeManager();
    const res = await mgr.performHealthCheck();
    expect(res.status).toBe('degraded');
    const memCheck = res.checks.find(c => c.name === 'memory_system');
    expect(memCheck?.status).toBe('degraded');
  });

  it('readinessProbe true when critical checks ok; false when memory check rejects', async () => {
    const mgr = makeManager();
    const ready = await mgr.readinessProbe();
    expect(ready.ready).toBe(true);

    // Cause memory check to reject -> readiness false
    memory.getStats.mockRejectedValueOnce(new Error('no stats'));
    const mgr2 = makeManager();
    const ready2 = await mgr2.readinessProbe();
    expect(ready2.ready).toBe(false);
  });

  it('livenessProbe returns alive true', async () => {
    const mgr = makeManager();
    const live = await mgr.livenessProbe();
    expect(live.alive).toBe(true);
  });
});


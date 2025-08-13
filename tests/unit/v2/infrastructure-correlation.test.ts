/**
 * Unit tests for v2 Infrastructure Correlation
 */

import { InfrastructureCorrelationChecker } from '../../../src/v2/tools/infrastructure-correlation';
import { createInfrastructureCorrelationTools } from '../../../src/v2/tools/infrastructure-correlation/tools';

describe('InfrastructureCorrelationChecker helpers', () => {
  let checker: any;
  let oc: any;
  let memory: any;
  let restoreConsole: (() => void) | null = null;

  beforeEach(() => {
    oc = { executeOc: jest.fn() };
    memory = {
      searchConversations: jest.fn().mockResolvedValue([]),
      storeConversation: jest.fn().mockResolvedValue('mem-ic-1'),
    };
    checker = new (InfrastructureCorrelationChecker as any)(oc, memory);
    const mocks: jest.SpyInstance[] = [];
    mocks.push(jest.spyOn(console, 'error').mockImplementation(() => {}));
    mocks.push(jest.spyOn(console, 'warn').mockImplementation(() => {}));
    restoreConsole = () => mocks.forEach((m) => m.mockRestore());
  });

  afterEach(() => { if (restoreConsole) restoreConsole(); });

  it('extracts zones from MachineSet and Node correctly', () => {
    const ms1 = { metadata: { labels: { 'machine.openshift.io/zone': 'us-a' } } };
    const ms2 = { spec: { template: { metadata: { labels: { 'machine.openshift.io/zone': 'us-b' } } } } };
    const ms3 = { metadata: {} };
    expect(checker.extractZoneFromMachineSet(ms1)).toBe('us-a');
    expect(checker.extractZoneFromMachineSet(ms2)).toBe('us-b');
    expect(checker.extractZoneFromMachineSet(ms3)).toBe('unknown-zone');

    const n1 = { metadata: { labels: { 'topology.kubernetes.io/zone': 'eu-1' } } };
    const n2 = { metadata: { labels: { 'failure-domain.beta.kubernetes.io/zone': 'eu-2' } } };
    const n3 = { metadata: {} };
    expect(checker.extractZoneFromNode(n1)).toBe('eu-1');
    expect(checker.extractZoneFromNode(n2)).toBe('eu-2');
    expect(checker.extractZoneFromNode(n3)).toBe('unknown-zone');
  });

  it('extracts required zone from PV nodeAffinity', () => {
    const pv = {
      spec: {
        nodeAffinity: {
          required: {
            nodeSelectorTerms: [
              { matchExpressions: [ { key: 'topology.kubernetes.io/zone', values: ['z-1'] } ] }
            ]
          }
        }
      }
    };
    expect(checker.extractRequiredZoneFromPV(pv)).toBe('z-1');
    expect(checker.extractRequiredZoneFromPV({})).toBeNull();
  });

  it('detects storage-zone conflicts when PV requires an unavailable zone', async () => {
    const infra = { persistentVolumes: [
      { metadata: { name: 'pv-a' }, spec: { nodeAffinity: { required: { nodeSelectorTerms: [ { matchExpressions: [ { key: 'topology.kubernetes.io/zone', values: ['z-2'] } ] } ] } } } },
      { metadata: { name: 'pv-b' }, spec: { } },
    ]};
    const zones = [
      { zone: 'z-1', status: 'healthy' },
      { zone: 'z-2', status: 'unavailable' },
    ] as any;

    // Stub private method findPodsUsingPV
    checker.findPodsUsingPV = jest.fn().mockResolvedValue(['ns1/podX']);

    const conflicts = await checker.detectStorageZoneConflicts({ sessionId: 's1' }, infra, zones);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toMatchObject({ pvName: 'pv-a', requiredZone: 'z-2', zoneAvailable: false, conflictSeverity: 'critical' });
    expect(conflicts[0].affectedPods).toEqual(['ns1/podX']);
    expect(conflicts[0].recommendedActions.join(' ')).toMatch(/Scale up MachineSet/);
  });
});

describe('createInfrastructureCorrelationTools wrappers', () => {
  let oc: any;
  let memory: any;
  let restoreConsole: (() => void) | null = null;

  beforeEach(() => {
    oc = {};
    memory = {};
    const mocks: jest.SpyInstance[] = [];
    mocks.push(jest.spyOn(console, 'error').mockImplementation(() => {}));
    mocks.push(jest.spyOn(console, 'warn').mockImplementation(() => {}));
    restoreConsole = () => mocks.forEach((m) => m.mockRestore());
  });
  afterEach(() => { if (restoreConsole) restoreConsole(); jest.restoreAllMocks(); });

  it('returns success envelope on happy path', async () => {
    const spy = jest.spyOn((InfrastructureCorrelationChecker as any).prototype, 'checkInfrastructureCorrelation').mockResolvedValue({
      summary: { analysisTimeMs: 123, confidenceScore: 0.9 },
      zoneAnalysis: { availableZones: [{ status: 'healthy' }], zoneConflicts: [] },
      memoryInsights: { similarPatterns: [{ id: 'm1' }], historicalResolutions: [], patternConfidence: 0.5 },
      humanSummary: 'ok',
      technicalDetails: { machineSetStatus: [], persistentVolumeAnalysis: [], nodeDistribution: [] }
    });

    const tools = createInfrastructureCorrelationTools(oc as any, memory as any);
    const out = await tools.oc_diagnostic_infrastructure_correlation({ sessionId: 's1', namespace: 'ns1' });
    expect(out.success).toBe(true);
    expect(out.executionTimeMs).toBe(123);
    expect(out.memoryEnhanced).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it('returns error envelope on failure', async () => {
    jest.spyOn((InfrastructureCorrelationChecker as any).prototype, 'checkInfrastructureCorrelation').mockRejectedValue(new Error('nope'));
    const tools = createInfrastructureCorrelationTools(oc as any, memory as any);
    const out = await tools.oc_diagnostic_zone_analysis({ sessionId: 's2' });
    expect(out.success).toBe(false);
    expect(String(out.error)).toContain('nope');
  });
});


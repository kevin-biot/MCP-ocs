import Ajv from 'ajv';
import fs from 'fs';
import path from 'path';

import { DiagnosticToolsV2 } from '@/tools/diagnostics/index.js';
import { ReadOpsTools } from '@/tools/read-ops/index.js';
import { StateMgmtTools } from '@/tools/state-mgmt/index.js';
import { SharedMemoryManager } from '@/lib/memory/shared-memory.js';
import { MockOcWrapperV2 } from '../../mocks/mock-oc-wrapper-v2';
import { MockOpenShiftClient } from '../../mocks/mock-openshift-client';
import { NamespaceHealthChecker } from '@/v2/tools/check-namespace-health/index.js';
import fs from 'fs';
import path from 'path';

const ajv = new Ajv({ allErrors: true });
const loadSchema = (name: string) => JSON.parse(fs.readFileSync(path.join(__dirname, '../../schemas', name), 'utf8'));

const schemas = {
  ns: ajv.compile(loadSchema('oc_diagnostic_namespace_health.schema.json')),
  pod: ajv.compile(loadSchema('oc_diagnostic_pod_health.schema.json')),
  getPods: ajv.compile(loadSchema('oc_read_get_pods.schema.json')),
  describe: ajv.compile(loadSchema('oc_read_describe.schema.json')),
  logs: ajv.compile(loadSchema('oc_read_logs.schema.json')),
  store: ajv.compile(loadSchema('memory_store_operational.schema.json')),
  searchOps: ajv.compile(loadSchema('memory_search_operational.schema.json')),
  wf: ajv.compile(loadSchema('core_workflow_state.schema.json')),
  memStats: ajv.compile(loadSchema('memory_get_stats.schema.json')),
  searchConv: ajv.compile(loadSchema('memory_search_conversations.schema.json')),
};

const fixturesDir = path.join(__dirname, '../../fixtures');

describe('Tool output schemas (AJV validation with mocks)', () => {
  const memory = new SharedMemoryManager({
    domain: 'mcp-ocs', namespace: 'test', memoryDir: './memory',
    enableCompression: false, retentionDays: 1, chromaHost: '127.0.0.1', chromaPort: 8000
  });

  test('namespace health (diagnostic) matches schema', async () => {
    const diag = new DiagnosticToolsV2(new MockOpenShiftClient() as any, memory);
    const mock = new MockOcWrapperV2(fixturesDir);
    (diag as any).ocWrapperV2 = mock as any;
    (diag as any).namespaceHealthChecker = new NamespaceHealthChecker(mock as any);
    const json = await (diag as any).enhancedNamespaceHealth({ sessionId: 't1', namespace: 'demo-ns', includeIngressTest: false, deepAnalysis: false });
    const obj = JSON.parse(json);
    expect(schemas.ns(obj)).toBe(true);
  });

  test('pod health (diagnostic) matches schema', async () => {
    const diag = new DiagnosticToolsV2(new MockOpenShiftClient() as any, memory);
    (diag as any).ocWrapperV2 = new MockOcWrapperV2(fixturesDir);
    const json = await (diag as any).enhancedPodHealth({ sessionId: 't2', namespace: 'demo-ns', podName: 'app-1' });
    const obj = JSON.parse(json);
    expect(schemas.pod(obj)).toBe(true);
  });

  test('read ops: get_pods/describe/logs match schemas', async () => {
    const read = new ReadOpsTools(new MockOpenShiftClient() as any, memory);
    const pods = JSON.parse(await read.executeTool('oc_read_get_pods', { namespace: 'demo-ns' }));
    expect(schemas.getPods(pods)).toBe(true);

    const desc = JSON.parse(await read.executeTool('oc_read_describe', { resourceType: 'pod', name: 'app-1', namespace: 'demo-ns' }));
    expect(schemas.describe(desc)).toBe(true);

    const logs = JSON.parse(await read.executeTool('oc_read_logs', { podName: 'app-1', namespace: 'demo-ns', lines: 10 }));
    expect(schemas.logs(logs)).toBe(true);
  });

  test('state/memory operations match schemas', async () => {
    const state = new StateMgmtTools(memory, {} as any);
    fs.mkdirSync(path.join('memory','test','operational'), { recursive: true });
    const stored = JSON.parse(await state.executeTool('memory_store_operational', {
      incidentId: 'u1', symptoms: ['demo'], environment: 'prod', rootCause: 'resource_pressure', resolution: 'scaled', affectedResources: []
    }));
    expect(schemas.store(stored)).toBe(true);

    const searchOps = JSON.parse(await state.executeTool('memory_search_operational', { query: 'demo', limit: 5, sessionId: 's1' }));
    expect(schemas.searchOps(searchOps)).toBe(true);

    const wf = JSON.parse(await state.executeTool('core_workflow_state', { sessionId: 's1' }));
    expect(schemas.wf(wf)).toBe(true);

    const stats = JSON.parse(await state.executeTool('memory_get_stats', { detailed: false }));
    expect(schemas.memStats(stats)).toBe(true);

    const searchConv = JSON.parse(await state.executeTool('memory_search_conversations', { query: 'demo', limit: 5, sessionId: 's1' }));
    expect(schemas.searchConv(searchConv)).toBe(true);
  });
});

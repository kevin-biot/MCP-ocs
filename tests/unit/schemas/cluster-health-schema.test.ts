import Ajv from 'ajv';
import fs from 'fs';
import path from 'path';

import { DiagnosticToolsV2 } from '@/tools/diagnostics/index.js';
import { SharedMemoryManager } from '@/lib/memory/shared-memory.js';
import { MockOcWrapperV2 } from '../../mocks/mock-oc-wrapper-v2';
import { NamespaceHealthChecker } from '@/v2/tools/check-namespace-health/index.js';

const ajv = new Ajv({ allErrors: true });
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../../schemas/oc_diagnostic_cluster_health.schema.json'), 'utf8'));
const validate = ajv.compile(schema);

describe('Cluster health schema (AJV)', () => {
  const memory = new SharedMemoryManager({
    domain: 'mcp-ocs', namespace: 'test', memoryDir: './memory',
    enableCompression: false, retentionDays: 1, chromaHost: '127.0.0.1', chromaPort: 8000
  });

  it('matches schema with mock oc + fixtures', async () => {
    const mockOc = new MockOcWrapperV2(path.join(__dirname, '../../fixtures'));
    const mockClient = {
      async getClusterInfo() {
        return { version: '4.14.0', serverUrl: 'https://api.example', currentUser: 'tester', currentProject: 'default', status: 'connected' };
      }
    } as any;

    const tools = new DiagnosticToolsV2(mockClient, memory) as any;
    tools.ocWrapperV2 = mockOc;
    tools.namespaceHealthChecker = new NamespaceHealthChecker(mockOc as any);

    const json = await tools.enhancedClusterHealth({
      sessionId: 's-1',
      includeNamespaceAnalysis: true,
      maxNamespacesToAnalyze: 3,
      namespaceScope: 'all',
      focusStrategy: 'auto',
      depth: 'summary'
    });
    const obj = JSON.parse(json);
    const ok = validate(obj);
    if (!ok) {
      console.error('AJV errors:', validate.errors);
    }
    expect(ok).toBe(true);
  });
});

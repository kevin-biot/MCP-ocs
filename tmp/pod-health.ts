#!/usr/bin/env tsx
import { DiagnosticToolsV2 } from '../src/tools/diagnostics/index.js';
import { OpenShiftClient } from '../src/lib/openshift-client.js';
import { SharedMemoryManager } from '../src/lib/memory/shared-memory.js';
import { MockOcWrapperV2 } from '../tests/mocks/mock-oc-wrapper-v2';

async function main() {
  const ns = process.argv[2];
  const pod = process.argv[3];
  if (!ns || !pod) {
    console.error('Usage: tsx tmp/pod-health.ts <namespace> <podName>');
    process.exit(2);
  }
  const oc = new OpenShiftClient({ ocPath: process.env.OC_PATH || 'oc', timeout: 30000 });
  const memory = new SharedMemoryManager({
    domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory',
    enableCompression: true, retentionDays: 7, chromaHost: '127.0.0.1', chromaPort: 8000
  });
  const tools = new DiagnosticToolsV2(oc, memory);
  if (process.env.USE_MOCK_OC) {
    (tools as any).ocWrapperV2 = new MockOcWrapperV2(require('path').join(__dirname, '../tests/fixtures'));
  }
  const out = await (tools as any).enhancedPodHealth({
    sessionId: `pod-${Date.now()}`,
    namespace: ns,
    podName: pod,
    includeDependencies: true,
    includeResourceAnalysis: true
  });
  console.log(out);
}

main().catch(err => { console.error(err?.message || err); process.exit(1); });

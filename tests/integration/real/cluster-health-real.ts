#!/usr/bin/env tsx
/**
 * Real integration harness for oc_diagnostic_cluster_health using your local `oc`.
 * Read-only: uses get/describe/logs under the hood via DiagnosticToolsV2.
 *
 * Usage examples:
 *   tsx tests/integration/real/cluster-health-real.ts --session s1 --scope all --strategy auto --depth summary --max 5
 *   npm run itest:real:cluster-health -- --focus my-ns --depth detailed
 */

import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index.js';
import { OpenShiftClient } from '../../../src/lib/openshift-client.js';
import { SharedMemoryManager } from '../../../src/lib/memory/shared-memory.js';

function arg(flag: string, def?: string) {
  const idx = process.argv.indexOf(`--${flag}`);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return def;
}

async function main() {
  const sessionId = arg('session', `real-${Date.now()}`)!;
  let scope = (arg('scope', 'all') as 'all'|'system'|'user');
  const allowedScopes = new Set(['all','system','user']);
  if (!allowedScopes.has(scope)) {
    console.error(`[warn] Invalid scope '${scope}', defaulting to 'all'`);
    scope = 'all';
  }
  const focus = arg('focus');
  const strategy = (arg('strategy', 'auto') as 'auto'|'events'|'resourcePressure'|'none');
  const depth = (arg('depth', 'summary') as 'summary'|'detailed');
  const max = Number(arg('max', '5'));

  const ocPath = process.env.OC_PATH || 'oc';

  const oc = new OpenShiftClient({ ocPath, timeout: 30000 });
  const memory = new SharedMemoryManager({
    domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory',
    enableCompression: true, retentionDays: 7, chromaHost: '127.0.0.1', chromaPort: 8000
  });

  const tools = new DiagnosticToolsV2(oc, memory);

  const json = await (tools as any).enhancedClusterHealth({
    sessionId,
    includeNamespaceAnalysis: true,
    namespaceScope: scope,
    focusNamespace: focus,
    focusStrategy: strategy,
    depth,
    maxNamespacesToAnalyze: max
  });

  const res = JSON.parse(json);
  // Print concise summary for ops
  const top = (res.namespacePrioritization || []).slice(0, 5);
  console.log(JSON.stringify({
    scope,
    focus: focus || null,
    strategy,
    depth,
    analyzedDetailedCount: res.userNamespaces?.analyzedDetailedCount,
    totalNamespaces: res.userNamespaces?.totalNamespaces,
    topNamespaces: top
  }, null, 2));
}

main().catch(err => {
  console.error('Real integration run failed:', err?.message || err);
  process.exit(1);
});

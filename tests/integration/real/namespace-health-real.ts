#!/usr/bin/env tsx
/**
 * Real integration harness for oc_diagnostic_namespace_health on a single namespace.
 * Read-only oc calls via DiagnosticToolsV2 and the v2 namespace checker.
 *
 * Usage:
 *   npm run itest:real:ns -- --ns <namespace> [--session s1] [--ingress true] [--deep true] [--maxLogs 50]
 */

import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index.js';
import { OpenShiftClient } from '../../../src/lib/openshift-client.js';
import { SharedMemoryManager } from '../../../src/lib/memory/shared-memory.js';

function arg(flag: string, def?: string) {
  const idx = process.argv.indexOf(`--${flag}`);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return def;
}

function argBool(flag: string, def = false) {
  const idx = process.argv.indexOf(`--${flag}`);
  if (idx < 0) return def;
  const val = process.argv[idx + 1];
  if (val === undefined) return true;
  return ['1','true','yes','on'].includes(String(val).toLowerCase());
}

async function main() {
  const ns = arg('ns');
  if (!ns) {
    console.error('Missing required --ns <namespace>');
    process.exit(2);
  }

  const sessionId = arg('session', `ns-${Date.now()}`)!;
  const includeIngressTest = argBool('ingress', false);
  const deep = argBool('deep', false);
  const maxLogs = Number(arg('maxLogs', '0')) || 0;

  const ocPath = process.env.OC_PATH || 'oc';

  const oc = new OpenShiftClient({ ocPath, timeout: 30000 });
  const memory = new SharedMemoryManager({
    domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory',
    enableCompression: true, retentionDays: 7, chromaHost: '127.0.0.1', chromaPort: 8000
  });

  const tools = new DiagnosticToolsV2(oc, memory);

  // Use enhanced v2 path for namespace health
  const json = await (tools as any).enhancedNamespaceHealth({
    sessionId,
    namespace: ns,
    includeIngressTest,
    deepAnalysis: deep
  });

  const res = JSON.parse(json);
  const out = {
    namespace: ns,
    status: res.status,
    duration: res.duration,
    pods: res.summary?.pods || undefined,
    pvcs: res.summary?.pvcs || undefined,
    routes: res.summary?.routes || undefined,
    criticalEvents: res.summary?.criticalEvents || 0,
    suspicionsCount: Array.isArray(res.suspicions) ? res.suspicions.length : 0
  };
  console.log(JSON.stringify(out, null, 2));
}

main().catch(err => {
  console.error('Namespace health run failed:', err?.message || err);
  process.exit(1);
});


#!/usr/bin/env tsx
/**
 * Real integration harness for RCA checklist using local oc.
 * JSON-only output; prints rootCause and key summary fields.
 *
 * Usage:
 *   npm run itest:real:rca -- --ns <namespace> [--deep true]
 */
import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index.js';
import { OcWrapperV2 } from '../../../src/v2/lib/oc-wrapper-v2.js';

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
  const deep = argBool('deep', false);
  const oc = new OcWrapperV2('oc', 15000);
  const engine = new RCAChecklistEngine(oc as any);

  const res = await engine.executeRCAChecklist({ namespace: ns, includeDeepAnalysis: deep, outputFormat: 'json' });
  const out = {
    namespace: ns || null,
    overallStatus: res.overallStatus,
    rootCause: res.rootCause || null,
    summary: res.summary,
    nextActions: res.nextActions.slice(0, 3)
  };
  console.log(JSON.stringify(out, null, 2));
}

main().catch(err => { console.error(err?.message || err); process.exit(1); });


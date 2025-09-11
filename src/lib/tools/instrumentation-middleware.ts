import { appendMetricsV2, metricsVectorIdentifiers, MetricsRecordV2 } from './metrics-writer.js';
import { collectAnchors } from './evidence-anchors.js';
import { writeVectorToolExec } from './vector-writer.js';
import { nowEpoch, nowIso } from '../../utils/time.js';

export interface PreContext {
  toolId: string; // full name
  opType: string; // read|diagnostic|memory|workflow|other
  category: string;
  sessionId: string;
  startMs: number;
  startIso: string;
  flags: Record<string, string | number | boolean>;
  allowlisted: boolean;
  redactedArgs: Record<string, unknown>;
}

export function inferOpType(category: string): string {
  if (category === 'read-ops') return 'read';
  if (category === 'diagnostic') return 'diagnostic';
  if (category === 'memory') return 'memory';
  if (category === 'workflow') return 'workflow';
  return 'other';
}

export function isAllowlisted(toolId: string): boolean {
  const csv = String(process.env.INSTRUMENT_ALLOWLIST || '');
  if (!csv) return true; // instrument all by default
  const set = new Set(csv.split(',').map((s: string) => s.trim()).filter(Boolean));
  return set.has(toolId);
}

export function redactArgs(input: unknown): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  if (!input || typeof input !== 'object') return safe;
  const obj = input as Record<string, unknown>;
  const hidden = new Set(['token','password','secret','auth','authorization','cookie']);
  for (const [k, v] of Object.entries(obj)) {
    if (hidden.has(k.toLowerCase())) {
      safe[k] = '[redacted]';
    } else if (typeof v === 'string') {
      safe[k] = v.length > 128 ? v.slice(0, 128) + '…' : v;
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      safe[k] = v;
    } else if (Array.isArray(v)) {
      safe[k] = `[array:${v.length}]`;
    } else if (v && typeof v === 'object') {
      safe[k] = '[object]';
    } else {
      safe[k] = v as any;
    }
  }
  return safe;
}

export function preInstrument(toolId: string, category: string, args: unknown): PreContext | null {
  if (!envEnable('ENABLE_INSTRUMENTATION', true)) return null;
  const allowed = isAllowlisted(toolId);
  const startMs = nowEpoch();
  const pre: PreContext = {
    toolId,
    opType: inferOpType(category),
    category,
    sessionId: extractSessionId(args),
    startMs,
    startIso: nowIso(),
    flags: snapshotFlags(),
    allowlisted: allowed,
    redactedArgs: redactArgs(args)
  };
  return pre;
}

export async function postInstrument(pre: PreContext | null, resultJson: string): Promise<void> {
  if (!pre) return;
  try {
    const endMs = nowEpoch();
    const elapsedMs = Math.max(0, endMs - pre.startMs);
    const anchors = await collectAnchors({ startIso: pre.startIso, endIso: nowIso(), toolId: pre.toolId });
    const mode: 'json' | 'vector' = modeVectorActive() ? 'vector' : 'json';

    // Vector write (best effort)
    if (pre.allowlisted && envEnable('ENABLE_VECTOR_WRITES', true) && mode === 'vector') {
      await writeVectorToolExec({
        toolId: pre.toolId,
        argsSummary: pre.redactedArgs,
        resultSummary: resultJson,
        sessionId: pre.sessionId || 'unknown',
        domain: inferDomain(pre.category),
        environment: inferEnvironment(),
        severity: 'medium',
        extraTags: [`kind:tool_exec`, `opType:${pre.opType}`]
      });
    }

    // Metrics write (authoritative)
    const rec: MetricsRecordV2 = {
      toolId: pre.toolId,
      opType: pre.opType,
      mode,
      elapsedMs,
      outcome: 'ok',
      errorSummary: null,
      cleanupCheck: true,
      anchors,
      timestamp: nowIso(),
      sessionId: pre.sessionId || 'unknown',
      flags: pre.flags,
      vector: metricsVectorIdentifiers()
    };
    await appendMetricsV2(rec);
  } catch (err) {
    try { console.error('[instrumentation] post failed:', (err as Error)?.message || String(err)); } catch {}
  }
}

export async function postInstrumentError(pre: PreContext | null, error: unknown): Promise<void> {
  if (!pre) return;
  try {
    const endMs = nowEpoch();
    const elapsedMs = Math.max(0, endMs - pre.startMs);
    const anchors = await collectAnchors({ startIso: pre.startIso, endIso: nowIso(), toolId: pre.toolId });
    const mode: 'json' | 'vector' = modeVectorActive() ? 'vector' : 'json';
    const errMsg = summarizeError(error);

    // Metrics write only (vector optional skip on error)
    const rec: MetricsRecordV2 = {
      toolId: pre.toolId,
      opType: pre.opType,
      mode,
      elapsedMs,
      outcome: 'error',
      errorSummary: errMsg,
      cleanupCheck: true,
      anchors,
      timestamp: nowIso(),
      sessionId: pre.sessionId || 'unknown',
      flags: pre.flags,
      vector: metricsVectorIdentifiers()
    };
    await appendMetricsV2(rec);
  } catch (err2) {
    try { console.error('[instrumentation] postError failed:', (err2 as Error)?.message || String(err2)); } catch {}
  }
}

function snapshotFlags(): Record<string, string | number | boolean> {
  return {
    UNIFIED_MEMORY: envEnable('UNIFIED_MEMORY', false),
    MCP_LOG_VERBOSE: envEnable('MCP_LOG_VERBOSE', false),
    ENABLE_INSTRUMENTATION: envEnable('ENABLE_INSTRUMENTATION', true),
    ENABLE_VECTOR_WRITES: envEnable('ENABLE_VECTOR_WRITES', true),
    ENABLE_PRESEARCH: envEnable('ENABLE_PRESEARCH', false)
  };
}

function extractSessionId(args: unknown): string {
  try {
    if (args && typeof args === 'object' && 'sessionId' in (args as any)) {
      const v = (args as any).sessionId;
      if (typeof v === 'string' && v.trim()) return v;
    }
  } catch {}
  return '';
}

function modeVectorActive(): boolean {
  try {
    const forceJson = String(process.env.MCP_OCS_FORCE_JSON || '').toLowerCase();
    if (['1','true','yes','on'].includes(forceJson)) return false;
  } catch {}
  return envEnable('ENABLE_VECTOR_WRITES', true);
}

function inferDomain(category: string): string {
  if (category === 'read-ops' || category === 'diagnostic') return 'openshift';
  return 'mcp-ocs';
}

function inferEnvironment(): 'dev' | 'test' | 'staging' | 'prod' {
  const env = (process.env.MCP_ENV || process.env.NODE_ENV || 'prod').toLowerCase();
  return (['dev','test','staging','prod'] as const).includes(env as any) ? (env as any) : 'prod';
}

function summarizeError(err: unknown): string {
  try {
    if (err instanceof Error) return err.message.slice(0, 240);
    const s = typeof err === 'string' ? err : JSON.stringify(err);
    return (s || 'error').slice(0, 240);
  } catch { return 'error'; }
}

function envEnable(name: string, defaultOn = true): boolean {
  const v = String(process.env[name] || '').toLowerCase();
  if (v === 'false' || v === '0' || v === 'off' || v === 'no') return false;
  if (v === 'true' || v === '1' || v === 'on' || v === 'yes') return true;
  return defaultOn;
}

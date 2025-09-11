import { appendMetricsV2, metricsVectorIdentifiers } from './metrics-writer.js';
import { collectAnchors } from './evidence-anchors.js';
import { writeVectorToolExec } from './vector-writer.js';
import { nowEpoch, nowIso } from '../../utils/time.js';
import { SharedMemoryManager } from '../memory/shared-memory.js';
export function inferOpType(category) {
    if (category === 'read-ops')
        return 'read';
    if (category === 'diagnostic')
        return 'diagnostic';
    if (category === 'memory')
        return 'memory';
    if (category === 'workflow')
        return 'workflow';
    return 'other';
}
export function isAllowlisted(toolId) {
    const csv = String(process.env.INSTRUMENT_ALLOWLIST || '');
    if (!csv)
        return true; // instrument all by default
    const set = new Set(csv.split(',').map((s) => s.trim()).filter(Boolean));
    return set.has(toolId);
}
export function redactArgs(input) {
    const safe = {};
    if (!input || typeof input !== 'object')
        return safe;
    const obj = input;
    const hidden = new Set(['token', 'password', 'secret', 'auth', 'authorization', 'cookie']);
    for (const [k, v] of Object.entries(obj)) {
        if (hidden.has(k.toLowerCase())) {
            safe[k] = '[redacted]';
        }
        else if (typeof v === 'string') {
            safe[k] = v.length > 128 ? v.slice(0, 128) + '…' : v;
        }
        else if (typeof v === 'number' || typeof v === 'boolean') {
            safe[k] = v;
        }
        else if (Array.isArray(v)) {
            safe[k] = `[array:${v.length}]`;
        }
        else if (v && typeof v === 'object') {
            safe[k] = '[object]';
        }
        else {
            safe[k] = v;
        }
    }
    return safe;
}
export function preInstrument(toolId, category, args) {
    if (!envEnable('ENABLE_INSTRUMENTATION', true))
        return null;
    const allowed = isAllowlisted(toolId);
    const startMs = nowEpoch();
    const pre = {
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
    // Optional Phase 3 pre-search enrichment (bounded)
    if (allowed && envEnable('ENABLE_PRESEARCH', false)) {
        // fire-and-forget; result captured later via closure update
        doPresearchSafe(pre, toolId, args).catch(() => { });
    }
    return pre;
}
export async function postInstrument(pre, resultJson) {
    if (!pre)
        return;
    try {
        const endMs = nowEpoch();
        const elapsedMs = Math.max(0, endMs - pre.startMs);
        const anchors = await collectAnchors({ startIso: pre.startIso, endIso: nowIso(), toolId: pre.toolId });
        if (pre.presearch)
            anchors.unshift(`presearch:hits=${pre.presearch.hits};ms=${pre.presearch.elapsedMs}`);
        const mode = modeVectorActive() ? 'vector' : 'json';
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
        const rec = {
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
    }
    catch (err) {
        try {
            console.error('[instrumentation] post failed:', err?.message || String(err));
        }
        catch { }
    }
}
export async function postInstrumentError(pre, error) {
    if (!pre)
        return;
    try {
        const endMs = nowEpoch();
        const elapsedMs = Math.max(0, endMs - pre.startMs);
        const anchors = await collectAnchors({ startIso: pre.startIso, endIso: nowIso(), toolId: pre.toolId });
        if (pre.presearch)
            anchors.unshift(`presearch:hits=${pre.presearch.hits};ms=${pre.presearch.elapsedMs}`);
        const mode = modeVectorActive() ? 'vector' : 'json';
        const errMsg = summarizeError(error);
        // Metrics write only (vector optional skip on error)
        const rec = {
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
    }
    catch (err2) {
        try {
            console.error('[instrumentation] postError failed:', err2?.message || String(err2));
        }
        catch { }
    }
}
function snapshotFlags() {
    return {
        UNIFIED_MEMORY: envEnable('UNIFIED_MEMORY', false),
        MCP_LOG_VERBOSE: envEnable('MCP_LOG_VERBOSE', false),
        ENABLE_INSTRUMENTATION: envEnable('ENABLE_INSTRUMENTATION', true),
        ENABLE_VECTOR_WRITES: envEnable('ENABLE_VECTOR_WRITES', true),
        ENABLE_PRESEARCH: envEnable('ENABLE_PRESEARCH', false)
    };
}
function extractSessionId(args) {
    try {
        if (args && typeof args === 'object' && 'sessionId' in args) {
            const v = args.sessionId;
            if (typeof v === 'string' && v.trim())
                return v;
        }
    }
    catch { }
    return '';
}
function modeVectorActive() {
    try {
        const forceJson = String(process.env.MCP_OCS_FORCE_JSON || '').toLowerCase();
        if (['1', 'true', 'yes', 'on'].includes(forceJson))
            return false;
    }
    catch { }
    return envEnable('ENABLE_VECTOR_WRITES', true);
}
function inferDomain(category) {
    if (category === 'read-ops' || category === 'diagnostic')
        return 'openshift';
    return 'mcp-ocs';
}
function inferEnvironment() {
    const env = (process.env.MCP_ENV || process.env.NODE_ENV || 'prod').toLowerCase();
    return ['dev', 'test', 'staging', 'prod'].includes(env) ? env : 'prod';
}
function summarizeError(err) {
    try {
        if (err instanceof Error)
            return err.message.slice(0, 240);
        const s = typeof err === 'string' ? err : JSON.stringify(err);
        return (s || 'error').slice(0, 240);
    }
    catch {
        return 'error';
    }
}
function envEnable(name, defaultOn = true) {
    const v = String(process.env[name] || '').toLowerCase();
    if (v === 'false' || v === '0' || v === 'off' || v === 'no')
        return false;
    if (v === 'true' || v === '1' || v === 'on' || v === 'yes')
        return true;
    return defaultOn;
}
async function doPresearchSafe(pre, toolId, args) {
    // Build a lightweight query from tool + args
    const q = buildQuery(toolId, args);
    const t0 = nowEpoch();
    try {
        const hits = await presearchOperational(q, 3, 400);
        pre.presearch = { hits, elapsedMs: Math.max(0, nowEpoch() - t0) };
    }
    catch {
        pre.presearch = { hits: 0, elapsedMs: Math.max(0, nowEpoch() - t0) };
    }
}
function buildQuery(toolId, args) {
    const base = toolId.replace(/^.*:/, '').replace(/^oc_/, '').replace(/_/g, ' ');
    let extras = '';
    try {
        const a = (args && typeof args === 'object') ? args : {};
        const ns = typeof a.namespace === 'string' ? a.namespace : '';
        const selector = typeof a.selector === 'string' ? a.selector : '';
        extras = [ns, selector].filter(Boolean).join(' ');
    }
    catch { }
    return [base, extras].filter(Boolean).join(' ').trim() || base;
}
async function presearchOperational(query, topK, timeoutMs) {
    // Use shared memory with JSON-friendly fallback and bounded time
    const memory = new SharedMemoryManager({
        domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory',
        enableCompression: true, retentionDays: 7,
        chromaHost: process.env.CHROMA_HOST || '127.0.0.1',
        chromaPort: process.env.CHROMA_PORT ? Number(process.env.CHROMA_PORT) : 8000
    });
    const p = (async () => {
        try {
            await memory.initialize();
        }
        catch { }
        try {
            const results = await memory.searchOperational(query, topK);
            return Array.isArray(results) ? results.length : (Array.isArray(results?.results) ? results.results.length : 0);
        }
        catch {
            return 0;
        }
    })();
    const timeout = new Promise((resolve) => setTimeout(() => resolve(0), Math.max(50, timeoutMs)));
    return await Promise.race([p, timeout]);
}

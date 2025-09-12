import { nowIso } from './time.js';
function findKeysWithSessionLike(obj, path = [], out = []) {
    if (!obj || typeof obj !== 'object')
        return out;
    for (const [k, v] of Object.entries(obj)) {
        const p = [...path, k].join('.');
        if (/session/i.test(k))
            out.push(p);
        if (v && typeof v === 'object')
            findKeysWithSessionLike(v, [...path, k], out);
    }
    return out;
}
function collectSessionLikeValues(obj, out = []) {
    if (!obj)
        return out;
    if (typeof obj === 'string') {
        if (/^session[-_].+/i.test(obj))
            out.push(obj);
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(obj))
            out.push(obj);
        if (/^[0-9A-HJKMNP-TV-Z]{26}$/.test(obj))
            out.push(obj);
        return out;
    }
    if (typeof obj === 'object') {
        for (const v of Object.values(obj))
            collectSessionLikeValues(v, out);
    }
    return out;
}
export function emitNdjsonProbe(event, step, reqPayload, respBody, status, observations = []) {
    if (String(process.env.PROBE_NDJSON).toLowerCase() !== 'true')
        return;
    const keys = findKeysWithSessionLike(reqPayload);
    const vals = collectSessionLikeValues({ request: reqPayload, response: respBody });
    const uuidLike = vals.filter(v => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v) || /^[0-9A-HJKMNP-TV-Z]{26}$/.test(v));
    const body = typeof respBody === 'string' ? (respBody.length > 5000 ? respBody.slice(0, 5000) + '\n... [truncated]' : respBody) : '';
    const line = {
        event,
        step,
        request: { payload: reqPayload || {}, headers: {}, args: {} },
        response: { status, body },
        extracted: { keysWithSessionLike: keys, uuidLike, sessionLikeValues: vals },
        observations,
        ts: nowIso(),
    };
    try {
        // stderr to avoid MCP stdout interference
        console.error(JSON.stringify(line));
    }
    catch { }
}

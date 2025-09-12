const PLACEHOLDER_RE = /^<[^>]+>$/;
export function findUnresolvedPlaceholdersShallow(args) {
    const hits = [];
    if (!args || typeof args !== 'object')
        return hits;
    const obj = args;
    for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string' && PLACEHOLDER_RE.test(v)) {
            hits.push({ field: k, value: v });
        }
    }
    return hits;
}

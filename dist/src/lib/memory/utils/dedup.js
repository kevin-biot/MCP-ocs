import crypto from 'crypto';
export function stableStringify(input) {
    try {
        return JSON.stringify(input, Object.keys(input).sort());
    }
    catch {
        try {
            return JSON.stringify(input);
        }
        catch {
            return String(input);
        }
    }
}
export function dedupHash(input) {
    const s = stableStringify(input);
    return crypto.createHash('sha256').update(s).digest('hex');
}

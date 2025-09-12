import { nowEpoch } from './time.js';
function randomSuffix(len = 5) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < len; i++) {
        out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return out;
}
export function createSessionId(seed) {
    const epoch = nowEpoch();
    const base = seed && typeof seed === 'string' ? seed.replace(/\s+/g, '-').toLowerCase() : 'sess';
    return `${base}-${epoch}-${randomSuffix(6)}`;
}

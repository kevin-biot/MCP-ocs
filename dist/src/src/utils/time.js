export function nowIso() {
    return new Date().toISOString();
}
export function isValidDateInput(input) {
    const d = new Date(input);
    return !isNaN(d.getTime());
}
// Numeric epoch time (ms). Use only for calculations (cutoffs/durations).
// eslint-disable-next-line no-restricted-properties -- Centralized helper for legitimate numeric time computations
export function nowEpoch() {
    return Date.now();
}

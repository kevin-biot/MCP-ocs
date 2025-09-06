export function nowIso(): string {
  return new Date().toISOString();
}

export function isValidDateInput(input: unknown): boolean {
  const d = new Date(input as any);
  return !isNaN(d.getTime());
}

// Numeric epoch time (ms). Use only for calculations (cutoffs/durations).
// eslint-disable-next-line no-restricted-properties -- Centralized helper for legitimate numeric time computations
export function nowEpoch(): number {
  return Date.now();
}

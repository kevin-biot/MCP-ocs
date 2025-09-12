import crypto from 'crypto';

export function stableStringify(input: unknown): string {
  try {
    return JSON.stringify(input, Object.keys(input as any).sort());
  } catch {
    try { return JSON.stringify(input); } catch { return String(input); }
  }
}

export function dedupHash(input: unknown): string {
  const s = stableStringify(input);
  return crypto.createHash('sha256').update(s).digest('hex');
}


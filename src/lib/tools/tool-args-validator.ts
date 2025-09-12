export interface PlaceholderHit {
  field: string;
  value: string;
}

const PLACEHOLDER_RE = /^<[^>]+>$/;

export function findUnresolvedPlaceholdersShallow(args: unknown): PlaceholderHit[] {
  const hits: PlaceholderHit[] = [];
  if (!args || typeof args !== 'object') return hits;
  const obj = args as Record<string, unknown>;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && PLACEHOLDER_RE.test(v)) {
      hits.push({ field: k, value: v });
    }
  }
  return hits;
}


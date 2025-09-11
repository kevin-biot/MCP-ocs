import { promises as fs } from 'fs';
import path from 'path';

// v2 JSON analytics record shape
export interface MetricsRecordV2 {
  toolId: string;
  opType: string; // read|diagnostic|memory|workflow|other
  mode: 'json' | 'vector';
  elapsedMs: number;
  outcome: 'ok' | 'error';
  errorSummary: string | null;
  cleanupCheck: boolean;
  anchors: string[];
  timestamp: string; // ISO8601
  sessionId: string;
  flags?: Record<string, string | number | boolean>;
  vector?: { tenant?: string; database?: string; collection?: string };
}

const METRICS_PATH = path.resolve('analytical-artifacts/08-technical-metrics-data.json');

export async function appendMetricsV2(record: MetricsRecordV2): Promise<void> {
  try {
    await fs.mkdir(path.dirname(METRICS_PATH), { recursive: true });
    let current: unknown = [];
    try {
      const raw = await fs.readFile(METRICS_PATH, 'utf8');
      current = JSON.parse(raw);
      if (!Array.isArray(current)) current = [];
    } catch {
      current = [];
    }
    (current as MetricsRecordV2[]).push(record);
    const tmp = METRICS_PATH + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(current, null, 2));
    await fs.rename(tmp, METRICS_PATH);
  } catch (err) {
    // Do not throw to caller; instrumentation must never break tool flow
    try { console.error('[metrics-writer] append failed:', (err as Error)?.message || String(err)); } catch {}
  }
}

export function metricsVectorIdentifiers(): { tenant?: string; database?: string; collection?: string } {
  const tenant = process.env.CHROMA_TENANT || 'mcp-ocs';
  const database = process.env.CHROMA_DATABASE || 'prod';
  const collection = process.env.CHROMA_COLLECTION || process.env.CHROMA_COLLECTION_PREFIX || 'mcp-ocs-';
  return { tenant, database, collection };
}


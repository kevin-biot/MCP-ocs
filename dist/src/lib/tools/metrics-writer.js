import { promises as fs } from 'fs';
import path from 'path';
const METRICS_PATH = path.resolve('analytical-artifacts/08-technical-metrics-data.json');
export async function appendMetricsV2(record) {
    try {
        await fs.mkdir(path.dirname(METRICS_PATH), { recursive: true });
        let current = [];
        try {
            const raw = await fs.readFile(METRICS_PATH, 'utf8');
            current = JSON.parse(raw);
            if (!Array.isArray(current))
                current = [];
        }
        catch {
            current = [];
        }
        current.push(record);
        const tmp = METRICS_PATH + '.tmp';
        await fs.writeFile(tmp, JSON.stringify(current, null, 2));
        await fs.rename(tmp, METRICS_PATH);
    }
    catch (err) {
        // Do not throw to caller; instrumentation must never break tool flow
        try {
            console.error('[metrics-writer] append failed:', err?.message || String(err));
        }
        catch { }
    }
}
export function metricsVectorIdentifiers() {
    const tenant = process.env.CHROMA_TENANT || 'mcp-ocs';
    const database = process.env.CHROMA_DATABASE || 'prod';
    const collection = process.env.CHROMA_COLLECTION || process.env.CHROMA_COLLECTION_PREFIX || 'mcp-ocs-';
    return { tenant, database, collection };
}

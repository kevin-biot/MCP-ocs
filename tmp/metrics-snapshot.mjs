import fs from 'fs';
import path from 'path';

const METRICS_PATH = 'analytical-artifacts/08-technical-metrics-data.json';
const OUT_DIR = 'sprint-management/process';
const N = Number(process.env.SNAPSHOT_LAST || 60);

function nowIso() { return new Date().toISOString(); }

function main() {
  const raw = fs.readFileSync(METRICS_PATH, 'utf8');
  const arr = JSON.parse(raw);
  const slice = Array.isArray(arr) ? arr.slice(-N) : [];
  const outName = `metrics-snapshot-${nowIso().replace(/[:]/g,'').slice(0,19)}.json`;
  const outPath = path.join(OUT_DIR, outName);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({
    generatedAt: nowIso(),
    total: arr.length,
    lastN: N,
    entries: slice
  }, null, 2));
  console.log(outPath);
}

main();


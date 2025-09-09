import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index.js';
import { OcWrapperV2 } from '../../../src/v2/lib/oc-wrapper-v2.js';

async function main() {
  const namespace = process.env.NAMESPACE; // optional focus ns
  const oc = new OcWrapperV2();
  const engine = new RCAChecklistEngine(oc);

  const original = process.env.OC_RCA_CONCURRENCY;

  process.env.OC_RCA_CONCURRENCY = '1';
  const seq = await engine.executeRCAChecklist({ namespace, includeDeepAnalysis: false, maxCheckTime: 60000, outputFormat: 'json' });

  process.env.OC_RCA_CONCURRENCY = String(process.env.OC_DIAG_CONCURRENCY || 8);
  const bat = await engine.executeRCAChecklist({ namespace, includeDeepAnalysis: false, maxCheckTime: 60000, outputFormat: 'json' });

  if (original === undefined) delete process.env.OC_RCA_CONCURRENCY; else process.env.OC_RCA_CONCURRENCY = original;

  const sequentialTime = seq.duration;
  const batchedTime = bat.duration;
  const perCheckSeq = Math.round(sequentialTime / Math.max(1, seq.checksPerformed.length));
  const perCheckBat = Math.round(batchedTime / Math.max(1, bat.checksPerformed.length));
  const imp = Math.round(((sequentialTime - batchedTime) / Math.max(1, sequentialTime)) * 100);

  console.log('=== RCA CHECKLIST FAIR COMPARISON ===');
  console.log(`Checks: ${seq.checksPerformed.length}`);
  console.log(`Sequential: ${sequentialTime}ms (${perCheckSeq}ms/check)`);
  console.log(`Batched: ${batchedTime}ms (${perCheckBat}ms/check)`);
  console.log(`Improvement: ${imp}%`);

  console.log(JSON.stringify({
    namespace: namespace || null,
    checks: seq.checksPerformed.length,
    sequentialTime,
    batchedTime,
    perCheckSeq,
    perCheckBat,
    wallClockImprovement: imp,
    timestamp: new Date().toISOString()
  }, null, 2));
}

main().catch(e => { console.error('RCA fair comparison failed:', e); process.exit(1); });


#!/usr/bin/env node
import fs from 'node:fs';

const FORMATTER_VERSION = '1.0.0';

function pct(x){ try { return `${Math.round(Number(x||0)*100)}%`; } catch { return '0%'; } }

const ANSI = {
  reset: '\u001b[0m',
  bold: '\u001b[1m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  red: '\u001b[31m',
  dim: '\u001b[2m'
};

function colorize(s, color, enabled){ return enabled ? `${ANSI[color] || ''}${s}${ANSI.reset}` : s; }

function render(summary, opts={}){
  const lines = [];
  const hdr = `${String(summary?.templateId||'').toUpperCase()} v${summary?.templateVersion || ''} | engine ${summary?.schemaVersion || ''}/${summary?.engineVersion || ''} | formatter v${FORMATTER_VERSION}`;
  lines.push(opts.color ? colorize(hdr, 'dim', true) : hdr);
  const p = summary?.priority?.label || 'N/A';
  const ps = Number(summary?.priority?.score ?? 0).toFixed(2);
  const c = summary?.confidence?.label || 'N/A';
  const a = String(summary?.safety?.allowAuto) || 'false';
  const ev = pct(summary?.evidence?.completeness);
  const m = `${summary?.determinism?.modelName||'model'} @ ${summary?.determinism?.system_fingerprint||'sha'} seed ${summary?.determinism?.seed}`;
  const slo = summary?.slo?.label || 'N/A';
  const passEvidence = Number(summary?.evidence?.completeness ?? 0) >= Number(summary?.evidence?.minThreshold ?? 0);
  const isHigh = c === 'High';
  const auto = a === 'true';
  const statusLine = `${p}(${ps}) | Confidence: ${c} | Auto: ${a} | Evidence: ${ev} | SLO: ${slo} | ${m}`;
  const color = passEvidence && isHigh && auto ? 'green' : (passEvidence ? 'yellow' : 'red');
  lines.push(opts.color ? colorize(statusLine, color, true) : statusLine);
  if (summary?.priority?.why) lines.push(`Priority rule: ${summary.priority.why}`);
  if (summary?.confidence?.why) lines.push(`Confidence rule: ${summary.confidence.why}`);
  if (Array.isArray(summary?.safety?.guards)) {
    const bad = summary.safety.guards.filter(g=>g.pass===false);
    const good = summary.safety.guards.filter(g=>g.pass!==false);
    if (bad.length) lines.push(`Failing guards: ${bad.map(g=>`${g.guard} (obs:${g.observed} thr:${g.threshold})`).join('; ')}`);
    else lines.push(`All guards passed (${good.length})`);
  }
  if (Array.isArray(summary?.evidence?.missing) && summary.evidence.missing.length) {
    lines.push(`Missing evidence: ${summary.evidence.missing.join(', ')}`);
  }
  if (summary?.slo) {
    if (summary?.sloHint) lines.push(`SLO hint: ${summary.sloHint}`);
  }
  // Infra rubric badges (visual only)
  const infra = summary?.infra;
  if (infra && (infra.zoneConflict || infra.schedulingConfidence || infra.storageAffinity || (infra.infrastructureSafety && typeof infra.infrastructureSafety.allowAuto !== 'undefined'))) {
    const bits = [];
    if (infra.zoneConflict) bits.push(`ZoneConflict: ${infra.zoneConflict}`);
    if (infra.schedulingConfidence) bits.push(`SchedulingConfidence: ${infra.schedulingConfidence}`);
    if (infra.storageAffinity) bits.push(`StorageAffinity: ${infra.storageAffinity}`);
    if (infra.infrastructureSafety && typeof infra.infrastructureSafety.allowAuto !== 'undefined') bits.push(`InfraAuto: ${infra.infrastructureSafety.allowAuto}`);
    if (infra.capacity) bits.push(`Capacity: ${infra.capacity}`);
    if (infra.scale) bits.push(`Scale: ${infra.scale}`);
    const badge = `Infra: ${bits.join(' | ')}`;
    lines.push(opts.color ? colorize(badge, 'dim', true) : badge);
  }
  // Recall badge
  if (summary?.recall) {
    const sim = Number(summary?.recall?.top1Similarity ?? 0).toFixed(2);
    const fresh = typeof summary?.recall?.freshnessMin === 'number' ? `${summary.recall.freshnessMin}m` : 'n/a';
    const conf = summary?.recall?.confidence || 'n/a';
    const badge = `Recall: sim ${sim} | fresh ${fresh} | conf ${conf}`;
    lines.push(opts.color ? colorize(badge, 'dim', true) : badge);
  }
  return lines.join('\n');
}

function csvEscape(v){
  const s = String(v ?? '');
  if (s.includes('"') || s.includes(',') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function renderCsv(summary, withHeader=true){
  const row = {
    templateId: summary?.templateId,
    templateVersion: summary?.templateVersion,
    priority: summary?.priority?.label,
    priorityScore: Number(summary?.priority?.score ?? 0).toFixed(2),
    confidence: summary?.confidence?.label,
    allowAuto: Boolean(summary?.safety?.allowAuto),
    completeness: Number(summary?.evidence?.completeness ?? 0).toFixed(2),
    minThreshold: Number(summary?.evidence?.minThreshold ?? 0).toFixed(2),
    missingCount: Array.isArray(summary?.evidence?.missing) ? summary.evidence.missing.length : 0,
    missingKeys: Array.isArray(summary?.evidence?.missing) ? summary.evidence.missing.join(';') : '',
    slo: summary?.slo?.label || '',
    model: summary?.determinism?.modelName,
    modelSha: summary?.determinism?.system_fingerprint,
    seed: summary?.determinism?.seed,
    formatterVersion: FORMATTER_VERSION
  };
  const headers = Object.keys(row);
  const values = headers.map(k=>csvEscape(row[k]));
  return (withHeader ? headers.join(',') + '\n' : '') + values.join(',');
}

function main(){
  const file = process.argv[2];
  if (!file) { console.error('Usage: npm run format:summary <path> [--json] [--csv] [--no-header] [--color] [--gate] [--require-high-confidence]'); process.exit(1); }
  const raw = fs.readFileSync(file,'utf8');
  const payload = JSON.parse(raw);
  const summary = payload?.summary || payload; // accept both envelope or bare summary

  // Future-proof runtime lock: if summary indicates a mutation attempt, abort loudly
  try {
    const allowMut = String(process.env.OC_ALLOW_MUTATIONS || '0') !== '0';
    const actions = Array.isArray(summary?.actions) ? summary.actions : [];
    const mutationFlag = Boolean(summary?.attemptedMutations) || actions.some(a => /apply|delete|scale|patch|edit|replace|cordon|drain|uncordon|annotate|label|taint|rollout\s+(restart|pause|resume|undo)/i.test(String(a?.command || '')));
    if (mutationFlag && !allowMut) {
      console.error('\u001b[31m[LOCK] Mutation-like action detected in summary. OC_ALLOW_MUTATIONS=0 — aborting.\u001b[0m');
      process.exit(2);
    }
  } catch {}
  const jsonOut = process.argv.includes('--json');
  const csvOut = process.argv.includes('--csv');
  const csvNoHeader = process.argv.includes('--no-header') || process.env.CSV_NO_HEADER === 'true';
  const gate = process.argv.includes('--gate');
  const needHigh = process.argv.includes('--require-high-confidence') || process.env.REQUIRE_HIGH_CONFIDENCE === 'true';
  if (jsonOut) {
    const out = {
      templateId: summary?.templateId,
      templateVersion: summary?.templateVersion,
      priority: summary?.priority?.label,
      priorityScore: Number(summary?.priority?.score ?? 0),
      confidence: summary?.confidence?.label,
      allowAuto: Boolean(summary?.safety?.allowAuto),
      completeness: Number(summary?.evidence?.completeness ?? 0),
      minThreshold: Number(summary?.evidence?.minThreshold ?? 0),
      missing: Array.isArray(summary?.evidence?.missing) ? summary.evidence.missing : [],
      slo: summary?.slo?.label || null,
      model: summary?.determinism?.modelName,
      modelSha: summary?.determinism?.system_fingerprint,
      seed: summary?.determinism?.seed,
      formatterVersion: FORMATTER_VERSION
    };
    console.log(JSON.stringify(out, null, 2));
    if (gate) {
      const fail = (out.completeness < out.minThreshold) || (needHigh && out.confidence !== 'High');
      process.exit(fail ? 1 : 0);
    }
    return;
  }
  if (csvOut) {
    console.log(renderCsv(summary, !csvNoHeader));
    if (gate) {
      const completeness = Number(summary?.evidence?.completeness ?? 0);
      const min = Number(summary?.evidence?.minThreshold ?? 0);
      const conf = summary?.confidence?.label;
      const fail = (completeness < min) || (needHigh && conf !== 'High');
      process.exit(fail ? 1 : 0);
    }
    return;
  }
  const color = process.argv.includes('--color') || process.env.COLOR === 'true';
// Belt & suspenders: default to read-only
process.env.OC_ALLOW_MUTATIONS = process.env.OC_ALLOW_MUTATIONS ?? '0';
  console.log(render(summary, { color }));
  if (gate) {
    const completeness = Number(summary?.evidence?.completeness ?? 0);
    const min = Number(summary?.evidence?.minThreshold ?? 0);
    const conf = summary?.confidence?.label;
    const fail = (completeness < min) || (needHigh && conf !== 'High');
    process.exit(fail ? 1 : 0);
  }
}

main();

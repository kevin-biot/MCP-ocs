#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { EVIDENCE_VOCAB, getScenarioId } from './schema/vocab.mjs';
import child_process from 'node:child_process';

function ensure(p){ fs.mkdirSync(path.dirname(p), {recursive:true}); }
function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function writeJson(p,obj){ ensure(p); fs.writeFileSync(p, JSON.stringify(obj, null, 2)); }
function bool(v){ return !!v; }

const MODELS = (process.env.LMS_MODELS||'ministral-8b-instruct-2410,mistralai/devstral-small-2507,qwen/qwen3-coder-30b').split(',').map(s=>s.trim());
const SCENARIOS = [
  'ingress-pending-demo',
  'route-5xx-demo',
  'pvc-binding-demo',
  'scheduling-failures-demo',
  'cluster-health-demo'
];

function fsSafe(s){ return String(s).replace(/[^A-Za-z0-9._-]/g,'_'); }
function scoreFile(scenario, model){
  const p = path.join('logs','robustness', `${scenario}__${fsSafe(model)}__score.json`);
  if (!fs.existsSync(p)) return null;
  const o = readJson(p);
  // Compute gates
  const st = !!o?.score?.structuralStable;
  const ts = Number(o?.score?.toolSuccessRate || 0);
  const jr = Number(o?.schema?.jsonValidRate || 0);
  const as = Number(o?.score?.answerStability || 0);
  const rs = o?.score?.rubricStability;
  const je = o?.score?.jsonEqual;
  const re = o?.score?.rubricEqual;
  const gates = {
    structuralStable: st,
    toolSuccessRate: ts,
    jsonValidRate: jr,
    answerStability: as,
    rubricStability: rs,
    jsonEqual: je,
    rubricEqual: re,
    PASS: (st && ts===1 && jr>=0.95 && je===true && re===true)
  };
  o.gates = gates;
  writeJson(p, o);
  return { file:p, gates, raw:o };
}

function summarize(){
  const rows = [];
  const failures = [];
  const oovCsv = [['scenario','model','oov_keys'].join(',')];
  for (const sc of SCENARIOS){
    for (const m of MODELS){
      const s = scoreFile(sc, m);
      if (!s) continue;
      const g = s.gates;
      rows.push({ scenario: sc, model: m, structuralStable: g.structuralStable, toolSuccessRate: g.toolSuccessRate, jsonValidRate: g.jsonValidRate, answerStability: g.answerStability, rubricStability: g.rubricStability, jsonEqual: g.jsonEqual, rubricEqual: g.rubricEqual, PASS: g.PASS });
      // Compute OOV keys summary per scenario/model
      const vocab = EVIDENCE_VOCAB[getScenarioId(sc) || ''] || [];
      const vocabSet = new Set(vocab);
      const ekSets = (s.raw?.extracted||[]).map(e => Array.isArray(e.evidence_keys)?e.evidence_keys:[]);
      const allKeys = [...new Set(ekSets.flat())];
      const oov = allKeys.filter(k => k && !vocabSet.has(k));
      if (oov.length) oovCsv.push([sc, m, JSON.stringify(oov)].join(','));
      if (!g.PASS) {
        // Diagnose
        // JSON field diff (LLM representative vs Engine)
        let jsonDiff = '';
        try {
          const engPath = path.join('logs','robustness', `${sc}__${m.replace(/[^A-Za-z0-9._-]/g,'_')}__engine.json`);
          const engRes = readJson(engPath)?.result || {};
          const tf = (s.raw?.files||[])[0];
          const t = readJson(tf);
          let parsed = null; try { parsed = JSON.parse(t?.summary?.final_text||''); } catch {}
          if (parsed) {
            const diffs = [];
            const fields = ['priority','confidence','slo'];
            for (const f of fields){ if ((parsed?.[f]||'') !== (engRes?.[f]||'')) diffs.push(`${f}: LLM=${parsed?.[f]||''} vs ENG=${engRes?.[f]||''}`); }
            const ekL = JSON.stringify((parsed?.evidence_keys||[]).slice().sort());
            const ekE = JSON.stringify((engRes?.evidence_keys||[]).slice().sort());
            if (ekL !== ekE) diffs.push(`evidence_keys: LLM=${ekL} vs ENG=${ekE}`);
            jsonDiff = diffs.join('; ');
          }
        } catch {}
        // Try to diff two seed transcripts if present
        let diffOutput = '';
        try {
          const files = s.raw?.files || [];
          if (files.length>=2) {
            const out = child_process.execSync(`node scripts/e2e/diff-transcripts.mjs ${files[0]} ${files[1]}`, { encoding:'utf8', stdio:['pipe','pipe','pipe'] });
            diffOutput = out.slice(0, 2000);
          }
        } catch {}
        failures.push({ scenario: sc, model: m, reasons: { oov, ekVariety: allKeys, jsonDiff, diff: diffOutput } });
      }
    }
  }
  // Render markdown
  const md = [];
  md.push('# Dual-mode Robustness Report');
  md.push('');
  md.push('| Scenario | Model | structuralStable | toolSuccessRate | jsonValidRate | answerStability | rubricStability | jsonEqual | rubricEqual | PASS |');
  md.push('|---|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|');
  for (const r of rows){
    md.push(`| ${r.scenario} | ${r.model} | ${r.structuralStable ? '✔' : '✖'} | ${r.toolSuccessRate.toFixed(2)} | ${r.jsonValidRate.toFixed(2)} | ${r.answerStability.toFixed(2)} | ${r.rubricStability==null?'-':r.rubricStability.toFixed(2)} | ${r.jsonEqual===true?'✔':'✖'} | ${r.rubricEqual===true?'✔':'✖'} | ${r.PASS?'✔':'✖'} |`);
  }
  if (failures.length){
    md.push('');
    md.push('## Failures and Diagnoses');
    for (const f of failures){
      md.push(`- ${f.scenario} × ${f.model}`);
      if (f.reasons.oov?.length) md.push(`  - OOV evidence_keys: ${f.reasons.oov.join(', ')}`);
      if (f.reasons.ekVariety?.length) md.push(`  - Observed evidence_keys: ${f.reasons.ekVariety.join(', ')}`);
      if (f.reasons.jsonDiff) md.push(`  - JSON diff: ${f.reasons.jsonDiff}`);
      if (f.reasons.diff) md.push('  - Transcript diff (first pair):');
      if (f.reasons.diff) md.push('    ' + f.reasons.diff.replace(/\n/g,'\n    '));
    }
  }
  const outfile = path.join('artifacts','dual-mode-robustness.md');
  ensure(outfile); fs.writeFileSync(outfile, md.join('\n'));
  const oovfile = path.join('artifacts','oov-summary.csv');
  ensure(oovfile); fs.writeFileSync(oovfile, oovCsv.join('\n'));
  console.log(`Wrote ${oovfile}`);
  console.log(`Wrote ${outfile}`);
}

summarize();

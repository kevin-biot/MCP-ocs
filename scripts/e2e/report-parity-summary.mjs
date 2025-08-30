#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseTable(md) {
  const lines = md.split(/\r?\n/);
  const table = [];
  let inTable = false;
  for (const ln of lines) {
    if (ln.startsWith('| Scenario ')) { inTable = true; continue; }
    if (!inTable) continue;
    if (!ln.startsWith('|')) break;
    const cells = ln.split('|').map(s => s.trim());
    // ["", "ingress...", "model", "✔", "1.00", ...]
    if (cells.length < 10) continue;
    table.push({
      scenario: cells[1],
      model: cells[2],
      structuralStable: cells[3],
      toolSuccessRate: cells[4],
      jsonValidRate: cells[5],
      answerStability: cells[6],
      rubricStability: cells[7],
      jsonEqual: cells[8],
      rubricEqual: cells[9],
      pass: cells[10]
    });
  }
  return table;
}

function summarize(table){
  const total = table.length;
  const byScenario = {};
  let passCount = 0, jsonEq=0, rubEq=0;
  let jsonValidGood=0;
  for (const r of table){
    passCount += r.pass?.includes('✔') ? 1 : 0;
    jsonEq += r.jsonEqual?.includes('✔') ? 1 : 0;
    rubEq += r.rubricEqual?.includes('✔') ? 1 : 0;
    const jv = Number(r.jsonValidRate || 0);
    jsonValidGood += (jv >= 1 ? 1 : 0);
    const key = r.scenario;
    (byScenario[key] = byScenario[key] || []).push(r);
  }
  return { total, passCount, jsonEq, rubEq, jsonValidAll: jsonValidGood, byScenario };
}

function printSummary(sum){
  console.log('Parity Summary');
  console.log(`- Rows: ${sum.total}`);
  console.log(`- PASS rows: ${sum.passCount}`);
  console.log(`- jsonEqual ✔: ${sum.jsonEq}`);
  console.log(`- rubricEqual ✔: ${sum.rubEq}`);
  console.log('By scenario (jsonValidRate<1 flagged):');
  for (const [sc, rows] of Object.entries(sum.byScenario)){
    const invalid = rows.filter(r => Number(r.jsonValidRate||0) < 1).length;
    console.log(`  - ${sc}: ${rows.length} rows (invalid json ${invalid})`);
  }
}

function printHints(md){
  const section = md.split('## Failures and Diagnoses')[1];
  if (!section){ return; }
  const first = section.split('\n- ').slice(1,6).map(s=>s.split('\n')[0]);
  if (first.length){
    console.log('Sample failures:');
    for (const f of first) console.log(`- ${f.trim()}`);
  }
}

function main(){
  const file = path.join('artifacts','dual-mode-robustness.md');
  if (!fs.existsSync(file)){
    console.error('No artifacts/dual-mode-robustness.md found. Run consolidate-report first.');
    process.exit(1);
  }
  const md = fs.readFileSync(file,'utf8');
  const table = parseTable(md);
  const sum = summarize(table);
  printSummary(sum);
  printHints(md);

  const oov = path.join('artifacts','oov-summary.csv');
  if (fs.existsSync(oov)){
    const csv = fs.readFileSync(oov,'utf8').trim();
    const lines = csv.split(/\r?\n/).slice(1).filter(Boolean);
    console.log(`OOV keys rows: ${lines.length}`);
  }
}

main();


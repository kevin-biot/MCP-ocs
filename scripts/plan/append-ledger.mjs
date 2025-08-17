#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

// Append a checkpoint entry to docs/IMPLEMENTATION_PROGRESS_LEDGER.md
// Usage:
//   node scripts/plan/append-ledger.mjs \
//     --datetime "2025-08-17 16:10 UTC" \
//     --phase "Phase 1 / Diagnostic Rubrics" \
//     --gate "Rubrics" \
//     --result "PASS" \
//     --artifacts "logs/runs/xyz.summary.json" \
//     --notes "cluster & pod safety wired"

function parseArgs(){
  const a = process.argv.slice(2);
  const out = {};
  for (let i=0;i<a.length;i++){
    if (a[i].startsWith('--')){
      const key = a[i].replace(/^--/,'');
      const val = a[i+1] && !a[i+1].startsWith('--') ? a[++i] : 'true';
      out[key] = val;
    }
  }
  return out;
}

function main(){
  const args = parseArgs();
  const dt = args.datetime || new Date().toISOString().replace('T',' ').replace(/\..+/, ' UTC');
  const phase = args.phase || 'Unknown Phase';
  const gate = args.gate || 'Other';
  const result = (args.result || 'PASS').toUpperCase() === 'PASS' ? '✅ PASS' : '❌ FAIL';
  const artifacts = args.artifacts || '';
  const notes = args.notes || '';

  const file = path.join('docs','IMPLEMENTATION_PROGRESS_LEDGER.md');
  let md = fs.readFileSync(file, 'utf8');

  const entry = `\n### ${dt}\n- **Phase/Task**: ${phase}\n- **Gate Type**: ${gate}\n- **Result**: ${result}\n- **Artifacts**: ${artifacts}\n- **Notes**: ${notes}\n`;

  const anchor = '\n## Next Scheduled Tasks';
  if (md.includes(anchor)) {
    const idx = md.indexOf(anchor);
    md = md.slice(0, idx) + entry + '\n' + md.slice(idx);
  } else {
    md += entry;
  }
  fs.writeFileSync(file, md);
  console.log('Ledger updated.');
}

main();


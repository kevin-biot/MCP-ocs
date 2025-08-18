#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

function hash(s){ return crypto.createHash('sha256').update(String(s||'')).digest('hex').slice(0,8); }

function load(file){ return JSON.parse(fs.readFileSync(file,'utf8')); }

function list(dir){ return fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>dir+'/'+f); }

function summarizeToolTurn(t){
  const name = t?.tool_call?.name || 'unknown';
  const args = t?.tool_call?.arguments || {};
  const data = t?.tool_result?.data || '';
  return { name, args, dataHash: hash(typeof data==='string'?data:JSON.stringify(data)) };
}

function diff(a,b){
  const diffs=[];
  const len = Math.max(a.length, b.length);
  for (let i=0;i<len;i++){
    const ta = a[i]; const tb = b[i];
    if (!ta || !tb){ diffs.push({ idx:i, a:ta||null, b:tb||null }); continue; }
    if (ta.name!==tb.name || JSON.stringify(ta.args)!==JSON.stringify(tb.args) || ta.dataHash!==tb.dataHash){
      diffs.push({ idx:i, a:ta, b:tb });
    }
  }
  return diffs;
}

function main(){
  const a = process.argv[2];
  const b = process.argv[3];
  if (!a || !b) {
    console.error('usage: diff-transcripts.mjs <file|dir A> <file|dir B>');
    process.exit(2);
  }
  const A = fs.statSync(a).isDirectory() ? list(a) : [a];
  const B = fs.statSync(b).isDirectory() ? list(b) : [b];
  const min = Math.min(A.length, B.length);
  for (let i=0;i<min;i++){
    const fa = A[i]; const fb = B[i];
    const Ta = load(fa); const Tb = load(fb);
    const toolTurnsA = (Ta?.turns||[]).filter(t=>t.tool_result).map(summarizeToolTurn);
    const toolTurnsB = (Tb?.turns||[]).filter(t=>t.tool_result).map(summarizeToolTurn);
    const diffs = diff(toolTurnsA, toolTurnsB);
    console.log(`# ${fa} <> ${fb}`);
    if (diffs.length===0) console.log('  (no diffs)');
    else diffs.forEach(d=>console.log(`  idx=${d.idx} A=${JSON.stringify(d.a)} B=${JSON.stringify(d.b)}`));
  }
}

main();


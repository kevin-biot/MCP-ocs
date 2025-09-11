#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DEFAULT_CODEX = '/Users/kevinbrown/.codex/log/codex-tui.log';
const DEFAULT_CLAUDE = process.env.HOME + '/Library/Logs/Claude/mcp-server-files-advanced.log';

// ---------- args ----------
const args = process.argv.slice(2);
let codexLog = DEFAULT_CODEX;
let claudeLog = DEFAULT_CLAUDE;
let fromISO = null, toISO = null;
let outPath = null;
let toStdout = false;
let windowMs = 3 * 60 * 1000; // default 3m
let emitJson = false;

function toISODate(x) { if (!x) return null; const d = new Date(x); return isNaN(d) ? null : d.toISOString(); }
function parseDur(s) { const m = String(s||'').trim().match(/^(\d+(?:\.\d*)?)([smhd])$/i); if (!m) return null; const n=+m[1]; const u=m[2].toLowerCase(); const mul=u==='s'?1:u==='m'?60:u==='h'?3600:86400; return n*mul*1000; }
function parseLast(s) { return parseDur(s); }

for (let i=0;i<args.length;i++){
  const a=args[i];
  if (a==='--codex-log') codexLog = args[++i];
  else if (a==='--claude-log') claudeLog = args[++i];
  else if (a==='--from') fromISO = toISODate(args[++i]);
  else if (a==='--to') toISO = toISODate(args[++i]);
  else if (a==='--on') { const d=new Date(args[++i]); if(!isNaN(d)){ const s=new Date(d.getFullYear(),d.getMonth(),d.getDate()); const e=new Date(s.getTime()+86400000-1); fromISO=s.toISOString(); toISO=e.toISOString(); } }
  else if (a==='--last') { const ms=parseLast(args[++i]); if(ms!=null){ const now=new Date(); fromISO=new Date(now.getTime()-ms).toISOString(); toISO=now.toISOString(); } }
  else if (a==='--window') { const ms=parseDur(args[++i]); if (ms!=null) windowMs=ms; }
  else if (a==='--out') outPath = args[++i];
  else if (a==='--stdout') toStdout = true;
  else if (a==='--emit-json') emitJson = true;
}

function stripAnsi(s){ return s.replace(/\x1B\[[0-9;]*[A-Za-z]/g,''); }
function parseIsoTs(line){ const m=line.match(/^(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d+Z)/); return m?m[1]:null; }
function inWindow(ts){ if(!ts) return false; if(fromISO&&ts<fromISO) return false; if(toISO&&ts>toISO) return false; return true; }

async function parseCodex(file){
  const events=[]; if(!fs.existsSync(file)) return events;
  const rl = readline.createInterface({ input: fs.createReadStream(file,{encoding:'utf8'}), crlfDelay: Infinity });
  for await (const raw of rl){
    const line = stripAnsi(raw);
    const ts = parseIsoTs(line); if(!ts) continue; if(fromISO||toISO){ if(!inWindow(ts)) continue; }
    const re = /\*\*\* (Add|Update|Delete) File: ([^\n\r]+)/g; let m;
    while ((m = re.exec(line)) !== null) { events.push({ ts, file: m[2].trim(), action: m[1], source:'codex' }); }
  }
  return events;
}

async function parseClaude(file){
  const events=[]; if(!fs.existsSync(file)) return events;
  const rl = readline.createInterface({ input: fs.createReadStream(file,{encoding:'utf8'}), crlfDelay: Infinity });
  let inPatch=false; let patchBuf=[];
  for await (const raw of rl){
    const line = raw;
    const ts = parseIsoTs(line) || null; if(fromISO||toISO){ if(!ts || !inWindow(ts)) continue; }
    if (line.includes('*** Begin Patch')){ inPatch=true; patchBuf=[line]; continue; }
    if (inPatch){
      patchBuf.push(line);
      if (line.includes('*** End Patch')){
        inPatch=false; const text=patchBuf.join('\n');
        const re = /\*\*\* (Add|Update|Delete) File: ([^\n\r]+)/g; let m;
        while ((m = re.exec(text)) !== null) { events.push({ ts: ts||parseIsoTs(patchBuf[0])||new Date().toISOString(), file: m[2].trim(), action: m[1], source:'claude' }); }
        patchBuf=[]; continue;
      }
    }
    if (line.includes('tools/call') && /"name"\s*:\s*"write_file"/.test(line)){
      const m = line.match(/"path"\s*:\s*"([^"]+)"/); if (m) events.push({ ts: ts||new Date().toISOString(), file: m[1], action:'write', source:'claude' });
    }
  }
  return events;
}

function correlate(claudeEvents, codexEvents, windowMs){
  const pairs=[]; const unmatchedClaude=[]; const unmatchedCodex=new Set(codexEvents.map((_,i)=>i));
  const byFile = codexEvents.reduce((acc,e,i)=>{ (acc[e.file]=acc[e.file]||[]).push({...e, _i:i}); return acc; },{});
  for (const ce of claudeEvents){
    const list = byFile[ce.file]||[];
    let best=null; let bestIdx=-1; let bestLag=Infinity;
    for (const e of list){ const dt = new Date(e.ts) - new Date(ce.ts); if (dt>=0 && dt<=windowMs){ if (dt<bestLag){ best={codex:e, claude:ce, lagMs:dt}; bestIdx=e._i; bestLag=dt; } } }
    if (best){ pairs.push(best); unmatchedCodex.delete(bestIdx); } else { unmatchedClaude.push(ce); }
  }
  const unmatchedCodexEvents = Array.from(unmatchedCodex).map(i=>codexEvents[i]);
  return {pairs, unmatchedClaude, unmatchedCodex: unmatchedCodexEvents};
}

function stats(lags){ if(!lags.length) return {count:0, median:null, p95:null}; const sorted=[...lags].sort((a,b)=>a-b); const mid=Math.floor(sorted.length/2); const median= sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2; const p95=sorted[Math.min(sorted.length-1, Math.ceil(sorted.length*0.95)-1)]; return {count:lags.length, median, p95}; }

(async () => {
  try {
    if (!outPath && !toStdout) {
      const outDir = path.join(__dirname, 'codex-logs');
      const now = new Date();
      const ts = now.toISOString().replace(/[-:]/g,'').replace(/\..+/,'').replace('T','-');
      outPath = path.join(outDir, `sprint-correlation-${ts}.md`);
    }
    const claudeEvents = await parseClaude(claudeLog);
    const codexEvents = await parseCodex(codexLog);

    const {pairs, unmatchedClaude, unmatchedCodex} = correlate(claudeEvents, codexEvents, windowMs);
    const lags = pairs.map(p=>p.lagMs);
    const s = stats(lags);

    function topByFile(list){ const m=list.reduce((a,e)=>{a[e.file]=(a[e.file]||0)+1; return a;},{}); return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,10); }
    const topPairs = topByFile(pairs.map(p=>p.claude));
    const topUnpairedClaude = topByFile(unmatchedClaude);
    const topUnpairedCodex = topByFile(unmatchedCodex);

    const lines=[];
    lines.push(`# Sprint Correlation Report`);
    const windowLine = (fromISO||toISO) ? `- Window: ${fromISO||'start'} → ${toISO||'end'}` : null; if (windowLine) lines.push(windowLine);
    lines.push(`- Correlation window: ${Math.round(windowMs/1000)}s`);
    lines.push(`- Claude events: ${claudeEvents.length} • Codex events: ${codexEvents.length}`);
    lines.push(`- Correlated pairs: ${pairs.length}`);
    lines.push(`- Lag (ms): median=${s.median??'n/a'} p95=${s.p95??'n/a'}`);

    if (topPairs.length){ lines.push('', '## Top Files (Correlated Pairs)'); topPairs.forEach(([f,c])=>lines.push(`- ${f} (${c})`)); }
    if (topUnpairedClaude.length){ lines.push('', '## Unpaired Claude Writes/Patches (top)'); topUnpairedClaude.forEach(([f,c])=>lines.push(`- ${f} (${c})`)); }
    if (topUnpairedCodex.length){ lines.push('', '## Unpaired Codex Patches (top)'); topUnpairedCodex.forEach(([f,c])=>lines.push(`- ${f} (${c})`)); }

    if (pairs.length){ lines.push('', '## Sample Pairs (first 10)'); pairs.slice(0,10).forEach(p=>{ lines.push(`- ${p.claude.file} — lag=${p.lagMs}ms`); }); }

    const md = lines.join('\n');
    if (toStdout){ process.stdout.write(md+'\n'); }
    else {
      const dir = path.dirname(outPath); fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(outPath, md,'utf8');
      console.error(`Wrote correlation → ${outPath}`);
      if (emitJson){ const jsonPath = outPath.replace(/\.md$/i,'')+'.json'; fs.writeFileSync(jsonPath, JSON.stringify({window:{from:fromISO,to:toISO}, windowSec:windowMs/1000, pairs, unmatchedClaude, unmatchedCodex}, null, 2),'utf8'); }
    }
  } catch (err){ console.error('Error:', err && err.stack || err); process.exit(1); }
})();


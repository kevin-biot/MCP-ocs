#!/usr/bin/env node
import { spawn } from 'node:child_process';

function send(proc, obj){ proc.stdin.write(JSON.stringify(obj) + "\n"); }
function waitFor(proc, id, timeoutMs=8000){
  return new Promise((resolve,reject)=>{
    let buf=''; const timer=setTimeout(()=>reject(new Error('timeout')), timeoutMs);
    const onData=(chunk)=>{
      buf += chunk.toString();
      let idx; while((idx = buf.indexOf('\n')) !== -1){
        const line = buf.slice(0, idx); buf = buf.slice(idx+1);
        if(!line.trim()) continue; try{ const msg=JSON.parse(line); if(msg.id===id){ clearTimeout(timer); proc.stdout.off('data',onData); resolve(msg); return; } }catch{}
      }
    };
    proc.stdout.on('data', onData);
  });
}

async function runOnce(env, label, calls){
  return new Promise(async (resolve)=>{
    const proc = spawn('node', ['dist/src/index-sequential.js'], { stdio:['pipe','pipe','pipe'], env:{...process.env, ...env} });
    const lines=[];
    proc.stderr.on('data', (d)=>{
      const s=d.toString().split(/\n+/).filter(Boolean);
      for (const line of s) {
        try { const obj = JSON.parse(line); if (obj && typeof obj==='object' && typeof obj.event==='string' && obj.event.startsWith('tools/call:')) { console.log(JSON.stringify({ probe: label, ...obj })); } } catch {}
      }
    });
    send(proc, { jsonrpc:'2.0', id:1, method:'initialize', params:{ protocolVersion:'2024-11-05', capabilities:{}, clientInfo:{ name:'probe', version:'0.1' }}});
    await waitFor(proc, 1);
    send(proc, { jsonrpc:'2.0', id:2, method:'tools/list' });
    await waitFor(proc, 2);
    let id=10;
    for (const args of calls) {
      send(proc, { jsonrpc:'2.0', id: ++id, method:'tools/call', params:{ name:'oc_read_get_pods', arguments: args }});
      await waitFor(proc, id, 12000);
    }
    try { proc.kill(); } catch {}
    resolve();
  });
}

async function main(){
  // A: default policy (no FORCE), first no session, then explicit constant
  await runOnce({ PROBE_NDJSON:'true' }, 'A-default', [ {}, { sessionId:'session-12345' } ]);
  // B: FORCE new session IDs, override client-provided; seed tagging
  await runOnce({ PROBE_NDJSON:'true', FORCE_NEW_SESSION_ID:'true', SESSION_ID_SEED:'probe' }, 'B-force', [ { sessionId:'session-12345' }, {} ]);
}

main().catch(e=>{ console.error(e?.message||e); process.exit(1); });


import { spawn } from 'node:child_process';
function send(proc, obj){ proc.stdin.write(JSON.stringify(obj)+"\n"); }
function waitFor(proc, id, timeoutMs=20000){
  return new Promise((resolve, reject)=>{
    const t=setTimeout(()=>reject(new Error('timeout')), timeoutMs);
    let buf='';
    const onData=(chunk)=>{
      buf += chunk.toString();
      let idx; while((idx=buf.indexOf('\n'))!==-1){ const line=buf.slice(0,idx); buf=buf.slice(idx+1); if(!line.trim()) continue; try{ const msg=JSON.parse(line); if(msg.id===id){ clearTimeout(t); proc.stdout.off('data',onData); resolve(msg); return; } }catch{} }
    };
    proc.stdout.on('data', onData);
  });
}

async function run(){
  const env={...process.env, ENABLE_TEMPLATE_ENGINE:'true', ENABLE_SEQUENTIAL_THINKING:'true'};
  const SERVER_CMD = process.env.SERVER_CMD || 'npx';
  const SERVER_ARGS = process.env.SERVER_ARGS ? process.env.SERVER_ARGS.split(' ') : ['tsx','src/index-sequential.ts'];
  const proc=spawn(SERVER_CMD, SERVER_ARGS,{stdio:['pipe','pipe','pipe'], env});
  proc.stderr.on('data',d=>process.stderr.write(d));
  send(proc,{jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'e2e',version:'0.1'}}});
  await waitFor(proc,1);
  send(proc,{jsonrpc:'2.0',id:2,method:'tools/list'});
  await waitFor(proc,2);
  const args={ sessionId:`e2e-error-${Date.now()}`, triageTarget:'test-error', bounded:true, stepBudget:1 };
  send(proc,{jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'oc_diagnostic_cluster_health',arguments:args}});
  const resp=await waitFor(proc,3,30000);
  try{proc.kill();}catch{}
  const text=resp?.result?.content?.[0]?.text||'';
  console.log(text);
  const obj=(()=>{ try{return JSON.parse(text);}catch{return null;} })();
  let res = obj?.steps?.[0]?.result;
  try { if (typeof res === 'string') res = JSON.parse(res); } catch {}
  let cat = typeof res==='object' && res ? res.category : undefined;
  if (!cat && res && res.recoverable && /not\s*found|404/i.test(String(res.error||''))) cat = 'notfound';
  console.error(`Categorization: ${cat||'unknown'}`);
}

run().catch(e=>{ console.error('Error categorization failed:', e?.message||e); process.exit(1); });

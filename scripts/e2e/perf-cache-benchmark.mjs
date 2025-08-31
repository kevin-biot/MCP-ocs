import { spawn } from 'node:child_process';
function send(proc, obj){ proc.stdin.write(JSON.stringify(obj)+"\n"); }
function waitFor(proc, id, timeoutMs=30000){
  return new Promise((resolve, reject)=>{
    const t=setTimeout(()=>reject(new Error('timeout')), timeoutMs);
    let buf='';
    const onData=(chunk)=>{ buf+=chunk.toString(); let idx; while((idx=buf.indexOf('\n'))!==-1){ const line=buf.slice(0,idx); buf=buf.slice(idx+1); if(!line.trim()) continue; try{const msg=JSON.parse(line); if(msg.id===id){clearTimeout(t); proc.stdout.off('data',onData); resolve(msg); return;}}catch{} } };
    proc.stdout.on('data', onData);
  });
}

async function run(){
  const env = { ...process.env, ENABLE_TEMPLATE_ENGINE:'true', ENABLE_SEQUENTIAL_THINKING:'true', OC_TIMEOUT_MS: process.env.OC_TIMEOUT_MS || '120000' };
  const SERVER_CMD = process.env.SERVER_CMD || 'npx';
  const SERVER_ARGS = process.env.SERVER_ARGS ? process.env.SERVER_ARGS.split(' ') : ['tsx','src/index-sequential.ts'];
  const proc = spawn(SERVER_CMD, SERVER_ARGS, { stdio:['pipe','pipe','pipe'], env });
  let stderr=''; proc.stderr.on('data', d=>{ const s=d.toString(); stderr+=s; process.stderr.write(d); });
  send(proc, { jsonrpc:'2.0', id: 1, method:'initialize', params:{ protocolVersion:'2024-11-05', capabilities:{}, clientInfo:{ name:'e2e', version:'0.1' }}});
  await waitFor(proc, 1);
  send(proc, { jsonrpc:'2.0', id: 2, method:'tools/list' });
  await waitFor(proc, 2);

  const session = `bench-${Date.now()}`;
  const args = { sessionId: session, triageTarget: 'cluster-health', bounded: true, stepBudget: 4 };
  const before = Date.now();
  send(proc, { jsonrpc:'2.0', id: 3, method:'tools/call', params:{ name:'oc_diagnostic_cluster_health', arguments: args }});
  const r1 = await waitFor(proc, 3, 60000);
  const mid = Date.now();
  send(proc, { jsonrpc:'2.0', id: 4, method:'tools/call', params:{ name:'oc_diagnostic_cluster_health', arguments: args }});
  const r2 = await waitFor(proc, 4, 60000);
  const after = Date.now();
  try { proc.kill(); } catch {}
  const dur1 = mid - before, dur2 = after - mid;
  const countPods = (s)=> (s.match(/oc get pods -n openshift-ingress -o json/g) || []).length;
  const podsCalls = countPods(stderr);
  console.log(JSON.stringify({ dur1, dur2, podsCalls }));
}

run().catch(e=>{ console.error('Perf benchmark failed:', e?.message||e); process.exit(1); });

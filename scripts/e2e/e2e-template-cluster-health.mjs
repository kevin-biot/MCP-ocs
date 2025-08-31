import { spawn } from 'node:child_process';

const SERVER_CMD = process.env.SERVER_CMD || 'npx';
const SERVER_ARGS = process.env.SERVER_ARGS ? process.env.SERVER_ARGS.split(' ') : ['tsx','src/index-sequential.ts'];

function send(proc, obj){
  proc.stdin.write(JSON.stringify(obj) + "\n");
}

function waitFor(proc, id, timeoutMs=12000){
  return new Promise((resolve, reject)=>{
    const t=setTimeout(()=>{reject(new Error('timeout'));}, timeoutMs);
    let buf='';
    const onData=(chunk)=>{
      buf += chunk.toString();
      let idx;
      while((idx = buf.indexOf('\n')) !== -1){
        const line = buf.slice(0, idx); buf = buf.slice(idx+1);
        if(!line.trim()) continue;
        try{ const msg = JSON.parse(line); if(msg.id === id){ clearTimeout(t); proc.stdout.off('data', onData); resolve(msg); return; } }catch{}
      }
    };
    proc.stdout.on('data', onData);
  });
}

async function run(){
  const env = { ...process.env, ENABLE_TEMPLATE_ENGINE:'true', ENABLE_SEQUENTIAL_THINKING:'true', OC_TIMEOUT_MS: process.env.OC_TIMEOUT_MS || '120000' };
  const proc = spawn(SERVER_CMD, SERVER_ARGS, { stdio: ['pipe','pipe','pipe'], env });
  proc.stderr.on('data', d=>process.stderr.write(d));
  send(proc, { jsonrpc:'2.0', id: 1, method:'initialize', params:{ protocolVersion:'2024-11-05', capabilities:{}, clientInfo:{ name:'e2e', version:'0.1' }}});
  await waitFor(proc, 1);
  send(proc, { jsonrpc:'2.0', id: 2, method:'tools/list' });
  await waitFor(proc, 2);

  const args = {
    sessionId: `e2e-te-cluster-health-${Date.now()}`,
    triageTarget: 'cluster-health',
    bounded: true,
    stepBudget: Number(process.env.STEP_BUDGET || 4)
  };
  if (process.env.ALLOW_NS === 'true') {
    args.allowedNamespaces = ['openshift-ingress','openshift-ingress-operator'];
  }
  send(proc, { jsonrpc:'2.0', id: 3, method:'tools/call', params:{ name:'oc_diagnostic_cluster_health', arguments: args }});
  const resp = await waitFor(proc, 3, 60000);
  try { proc.kill(); } catch {}
  const text = resp?.result?.content?.[0]?.text || '';
  console.log(text);

  try {
    const result = JSON.parse(text);
    if (!result?.evidence?.pass) {
      console.error(`❌ Evidence below threshold: ${result?.evidence?.completeness} < ${result?.evidence?.threshold}`);
      process.exit(1);
    }
    console.error(`✅ Cluster-health template executed: ${result.executed} steps; evidence PASS (${Math.round((result?.evidence?.completeness||0)*100)}%)`);
  } catch (e) {
    console.error('❌ Failed to parse template result JSON', e?.message || e);
    process.exit(1);
  }
}

run().catch(e=>{ console.error('E2E cluster-health failed:', e?.message || e); process.exit(1); });

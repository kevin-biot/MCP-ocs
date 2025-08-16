import { spawn } from 'node:child_process';

const SERVER_CMD = process.env.SERVER_CMD || 'npx';
const SERVER_ARGS = process.env.SERVER_ARGS ? process.env.SERVER_ARGS.split(' ') : ['tsx','src/index.ts'];

function send(proc, obj){
  const line = JSON.stringify(obj) + "
";
  proc.stdin.write(line);
}

function waitFor(proc, id, timeoutMs=8000){
  return new Promise((resolve, reject)=>{
    const timer=setTimeout(()=>reject(new Error('timeout')), timeoutMs);
    const onData=(chunk)=>{
      const lines=chunk.toString().split('
').filter(Boolean);
      for(const line of lines){
        try{
          const msg=JSON.parse(line);
          if(msg.id===id){
            clearTimeout(timer);
            proc.stdout.off('data',onData);
            resolve(msg);
          }
        }catch{}
      }
    };
    proc.stdout.on('data',onData);
  });
}

async function run(){
  const env = { ...process.env, ENABLE_TEMPLATE_ENGINE:'true', OC_TIMEOUT_MS: process.env.OC_TIMEOUT_MS || '120000' };
  const proc = spawn(SERVER_CMD, SERVER_ARGS, { stdio: ['pipe','pipe','pipe'], env });
  proc.stderr.on('data', d=>process.stderr.write(d));

  // initialize
  send(proc, { jsonrpc:'2.0', id: 1, method:'initialize', params:{ protocolVersion:'2024-11-05', capabilities:{}, clientInfo:{ name:'e2e', version:'0.1' }}});
  await waitFor(proc, 1);

  // list
  send(proc, { jsonrpc:'2.0', id: 2, method:'tools/list' });
  await waitFor(proc, 2);

  // call deterministic triage
  const args = {
    sessionId: 'e2e-te-ingress',
    triageTarget: 'ingress-pending',
    bounded: true,
    stepBudget: 3,
    allowedNamespaces: ['openshift-ingress','openshift-ingress-operator'],
    vars: { ns: 'openshift-ingress', pendingRouterPod: 'router-default-xxxx' }
  };
  send(proc, { jsonrpc:'2.0', id: 3, method:'tools/call', params:{ name:'oc_diagnostic_namespace_health', arguments: args }});
  const resp = await waitFor(proc, 3, 12000);
  try { proc.kill(); } catch {}
  const text = resp?.result?.content?.[0]?.text || '';
  console.log(text);
}

run().catch(e=>{ console.error('E2E failed:', e); process.exit(1); });

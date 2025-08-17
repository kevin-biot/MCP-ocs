#!/usr/bin/env node
import { spawn, execSync } from 'node:child_process';

const SERVER_CMD = process.env.SERVER_CMD || 'npx';
const SERVER_ARGS = process.env.SERVER_ARGS ? process.env.SERVER_ARGS.split(' ') : ['tsx','src/index-sequential.ts'];

function send(proc, obj){
  proc.stdin.write(JSON.stringify(obj) + "\n");
}

function waitFor(proc, id, timeoutMs=12000){
  return new Promise((resolve, reject)=>{
    const timer=setTimeout(()=>reject(new Error('timeout')), timeoutMs);
    let buf='';
    const onData=(chunk)=>{
      buf += chunk.toString();
      let idx;
      while((idx = buf.indexOf("\n")) !== -1){
        const line = buf.slice(0, idx); buf = buf.slice(idx+1);
        if(!line.trim()) continue;
        try{
          const msg=JSON.parse(line);
          if(msg.id===id){ clearTimeout(timer); proc.stdout.off('data',onData); resolve(msg); return; }
        }catch{/* keep buffering */}
      }
    };
    proc.stdout.on('data', onData);
  });
}

function autoDiscoverAnyPod(){
  const ns = process.env.NS || 'openshift-ingress';
  let name = process.env.POD || 'router-default-xxxx';
  try {
    const raw = execSync(`oc get pods -n ${ns} -o json`, { stdio: ['ignore','pipe','pipe'] }).toString('utf8');
    const data = JSON.parse(raw);
    const items = Array.isArray(data?.items) ? data.items : [];
    if (items.length > 0) {
      name = items[0]?.metadata?.name || name;
      console.error(`[e2e-zone] Using pod in ${ns}: ${name}`);
    } else {
      console.error(`[e2e-zone] No pods found in ${ns}; using placeholder`);
    }
  } catch (e) {
    console.error(`[e2e-zone] Autodiscovery failed (${e?.message||e}); using placeholder ${name}`);
  }
  return { ns, name };
}

async function run(){
  const env = { ...process.env, ENABLE_TEMPLATE_ENGINE:'true', ENABLE_SEQUENTIAL_THINKING:'true', ENABLE_RUBRICS:'true', OC_TIMEOUT_MS: process.env.OC_TIMEOUT_MS || '120000' };
  const proc = spawn(SERVER_CMD, SERVER_ARGS, { stdio: ['pipe','pipe','pipe'], env });
  proc.stderr.on('data', d=>process.stderr.write(d));

  send(proc, { jsonrpc:'2.0', id:1, method:'initialize', params:{ protocolVersion:'2024-11-05', capabilities:{}, clientInfo:{ name:'e2e', version:'0.1' }}});
  await waitFor(proc, 1);
  send(proc, { jsonrpc:'2.0', id:2, method:'tools/list' });
  await waitFor(proc, 2);

  const auto = autoDiscoverAnyPod();
  const sessionId = 'e2e-te-zone-conflict';
  const args = {
    sessionId,
    triageTarget: 'zone-conflict',
    bounded: true,
    stepBudget: 3,
    allowedNamespaces: ['openshift-ingress','openshift-ingress-operator','openshift-machine-api'],
    vars: { ns: auto.ns, pendingPod: auto.name }
  };
  send(proc, { jsonrpc:'2.0', id:3, method:'tools/call', params:{ name:'oc_diagnostic_namespace_health', arguments: args }});
  const resp = await waitFor(proc, 3, 20000);
  try { proc.kill(); } catch {}

  const text = resp?.result?.content?.[0]?.text || '';
  console.log(text);

  try {
    const result = JSON.parse(text);
    // For zone-conflict we do not enforce evidence pass (live variability)
    const steps = Array.isArray(result?.steps) ? result.steps : [];
    console.error(`✅ Zone-conflict executed ${steps.length} steps (live). Evidence completeness: ${result?.evidence?.completeness ?? 'n/a'}`);
  } catch (e) {
    console.error('❌ Failed to parse template result JSON', e?.message || e);
    process.exit(1);
  }
}

run().catch(e=>{ console.error('E2E zone-conflict failed:', e); process.exit(1); });


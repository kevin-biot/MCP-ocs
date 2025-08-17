#!/usr/bin/env node
import { spawn, execSync } from 'node:child_process';

// Server bootstrap (same pattern as ingress e2e)
const SERVER_CMD = process.env.SERVER_CMD || 'npx';
const SERVER_ARGS = process.env.SERVER_ARGS ? process.env.SERVER_ARGS.split(' ') : ['tsx','src/index-sequential.ts'];

function send(proc, obj){
  const line = JSON.stringify(obj) + "\n";
  proc.stdin.write(line);
}

function waitFor(proc, id, timeoutMs=12000){
  return new Promise((resolve, reject)=>{
    const timer=setTimeout(()=>reject(new Error('timeout')), timeoutMs);
    let buf = '';
    const onData=(chunk)=>{
      buf += chunk.toString();
      let idx;
      while((idx = buf.indexOf("\n")) !== -1){
        const line = buf.slice(0, idx);
        buf = buf.slice(idx+1);
        if(!line.trim()) continue;
        try{
          const msg=JSON.parse(line);
          if(msg.id===id){
            clearTimeout(timer);
            proc.stdout.off('data',onData);
            resolve(msg);
            return;
          }
        }catch{
          // keep buffering
        }
      }
    };
    proc.stdout.on('data',onData);
  });
}

function autoDiscoverPendingPod(){
  // Prefer NS override
  const ns = process.env.NS || 'openshift-ingress';
  let name = process.env.PENDING_POD || 'router-default-xxxx';
  try {
    const raw = execSync(`oc get pods -n ${ns} -o json`, { stdio: ['ignore','pipe','pipe'] }).toString('utf8');
    const data = JSON.parse(raw);
    const items = Array.isArray(data?.items) ? data.items : [];
    const pending = items.find(it => (it?.status?.phase === 'Pending') || (Array.isArray(it?.status?.conditions) && it.status.conditions.some(c=>c.type==='PodScheduled' && c.status==='False')));
    if (pending) {
      name = pending.metadata?.name || name;
      console.error(`[e2e-sched] Using Pending pod in ${ns}: ${name}`);
    } else if (items.length > 0) {
      name = items[0].metadata?.name || name;
      console.error(`[e2e-sched] No Pending pod found; using first pod: ${name}`);
    } else {
      console.error(`[e2e-sched] No pods found in ${ns}; using placeholder`);
    }
  } catch (e) {
    console.error(`[e2e-sched] Autodiscovery failed (${e?.message||e}); using placeholder ${name}`);
  }
  return { ns, name };
}

async function run(){
  const env = {
    ...process.env,
    ENABLE_TEMPLATE_ENGINE: 'true',
    ENABLE_SEQUENTIAL_THINKING: 'true',
    ENABLE_RUBRICS: 'true',
    OC_TIMEOUT_MS: process.env.OC_TIMEOUT_MS || '120000',
  };
  const proc = spawn(SERVER_CMD, SERVER_ARGS, { stdio: ['pipe','pipe','pipe'], env });
  proc.stderr.on('data', d=>process.stderr.write(d));

  // JSON-RPC handshake
  send(proc, { jsonrpc:'2.0', id: 1, method:'initialize', params:{ protocolVersion:'2024-11-05', capabilities:{}, clientInfo:{ name:'e2e', version:'0.1' }}});
  await waitFor(proc, 1);
  send(proc, { jsonrpc:'2.0', id: 2, method:'tools/list' });
  await waitFor(proc, 2);

  // Vars
  const auto = autoDiscoverPendingPod();
  const sessionId = 'e2e-te-scheduling';
  const args = {
    sessionId,
    triageTarget: 'scheduling-failures',
    bounded: true,
    stepBudget: 4,
    allowedNamespaces: ['openshift-ingress','openshift-ingress-operator','openshift-machine-api'],
    vars: { ns: auto.ns, pendingPod: auto.name }
  };
  // Trigger template engine path via tools/call, same as ingress harness
  send(proc, { jsonrpc:'2.0', id: 3, method:'tools/call', params:{ name:'oc_diagnostic_namespace_health', arguments: args }});
  const resp = await waitFor(proc, 3, 20000);
  try { proc.kill(); } catch {}

  const text = resp?.result?.content?.[0]?.text || '';
  console.log(text);

  // Simple validations
  try {
    const result = JSON.parse(text);
    if (!result?.evidence?.pass) {
      console.error('❌ Evidence gate failed for scheduling-failures');
      process.exit(1);
    }
    const steps = Array.isArray(result?.steps) ? result.steps : [];
    const tools = steps.map(s=>s?.step?.tool);
    const expected = ['oc_read_describe','oc_read_describe','oc_read_describe'];
    const ok = expected.every(x=>tools.includes(x));
    if (!ok) console.error('⚠️ Step tool sequence differs (ok if live env varies)');
    console.error(`✅ Scheduling-failures execution: ${result.executed} steps, evidence PASS`);
  } catch (e) {
    console.error('❌ Failed to parse template result JSON', e?.message || e);
    process.exit(1);
  }
}

run().catch(e=>{ console.error('E2E scheduling failed:', e); process.exit(1); });


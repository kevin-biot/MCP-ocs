import { spawn, execSync } from 'node:child_process';

const SERVER_CMD = process.env.SERVER_CMD || 'npx';
// Default to sequential entry to match deterministic runs
const SERVER_ARGS = process.env.SERVER_ARGS ? process.env.SERVER_ARGS.split(' ') : ['tsx','src/index-sequential.ts'];

function send(proc, obj){
  const line = JSON.stringify(obj) + "\n";
  proc.stdin.write(line);
}

function waitFor(proc, id, timeoutMs=8000){
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

async function run(){
  const env = { ...process.env, ENABLE_TEMPLATE_ENGINE:'true', ENABLE_SEQUENTIAL_THINKING:'true', OC_TIMEOUT_MS: process.env.OC_TIMEOUT_MS || '120000' };
  const proc = spawn(SERVER_CMD, SERVER_ARGS, { stdio: ['pipe','pipe','pipe'], env });
  proc.stderr.on('data', d=>process.stderr.write(d));

  // initialize
  send(proc, { jsonrpc:'2.0', id: 1, method:'initialize', params:{ protocolVersion:'2024-11-05', capabilities:{}, clientInfo:{ name:'e2e', version:'0.1' }}});
  await waitFor(proc, 1);

  // list
  send(proc, { jsonrpc:'2.0', id: 2, method:'tools/list' });
  await waitFor(proc, 2);

  // autodiscover a real pending router pod (fallback to any router-default-* if none pending)
  let routerPod = process.env.ROUTER_POD || 'router-default-xxxx';
  try {
    if (!process.env.ROUTER_POD) {
      const raw = execSync('oc get pods -n openshift-ingress -o json', { stdio: ['ignore','pipe','pipe'] }).toString('utf8');
      const data = JSON.parse(raw);
      const items = Array.isArray(data?.items) ? data.items : [];
      const routers = items.filter(it => String(it?.metadata?.name || '').startsWith('router-default-'));
      const pending = routers.find(it => (it?.status?.phase === 'Pending') || (Array.isArray(it?.status?.conditions) && it.status.conditions.some(c=>c.type==='PodScheduled' && c.status==='False')));
      if (pending) {
        routerPod = pending.metadata.name;
        console.error(`[e2e] Using pending router pod: ${routerPod}`);
      } else if (routers.length > 0) {
        routerPod = routers[0].metadata.name;
        console.error(`[e2e] No pending router found; using: ${routerPod}`);
      } else {
        console.error('[e2e] No router-default-* pods found; using placeholder');
      }
    } else {
      console.error(`[e2e] Using ROUTER_POD from env: ${routerPod}`);
    }
  } catch (e) {
    console.error(`[e2e] Autodiscovery failed (${e?.message || e}); using placeholder pod name`);
  }

  // call deterministic triage
  const args = {
    sessionId: 'e2e-te-ingress',
    triageTarget: 'ingress-pending',
    bounded: true,
    stepBudget: 3,
    allowedNamespaces: ['openshift-ingress','openshift-ingress-operator'],
    vars: { ns: 'openshift-ingress', pendingRouterPod: routerPod }
  };
  send(proc, { jsonrpc:'2.0', id: 3, method:'tools/call', params:{ name:'oc_diagnostic_namespace_health', arguments: args }});
  const resp = await waitFor(proc, 3, 12000);
  try { proc.kill(); } catch {}
  const text = resp?.result?.content?.[0]?.text || '';
  console.log(text);

  const COMPREHENSIVE = process.env.COMPREHENSIVE === 'true';
  const PERF = process.env.PERF === 'true';

  // Helper parsing
  const safeParse = (s) => { try { return JSON.parse(s); } catch { return null; } };
  const getStepResultText = (res) => typeof res === 'string' ? res : JSON.stringify(res);

  function validateBasic(result){
    if (result.executed !== 3) {
      console.error(`❌ Expected 3 steps, got ${result.executed}`);
      process.exit(1);
    }
    if (!result.evidence || result.evidence.pass !== true) {
      console.error(`❌ Evidence validation failed`);
      process.exit(1);
    }
    const step2 = result.steps?.[1]?.result;
    if (typeof step2 === 'string' && step2.includes('NotFound')) {
      console.error('❌ Pod describe should not 404');
      process.exit(1);
    }
  }

  function validatePodDiscoveryAccuracy(step0){
    const r = step0?.result;
    const obj = typeof r === 'string' ? safeParse(r) : r;
    let ok = false;
    if (obj && Array.isArray(obj.pods)) {
      ok = obj.pods.some(p=>String(p?.name||'').startsWith('router-default-'));
    } else if (typeof r === 'string') {
      ok = /router-default-/.test(r);
    }
    if (!ok) {
      console.error('❌ Pod discovery did not return any router-default-*');
      process.exit(1);
    }
  }

  function validateEvidenceCompleteness(ev){
    const keys = ['completeness','missing','present','threshold','pass'];
    const missing = keys.filter(k=> typeof ev?.[k] === 'undefined');
    if (missing.length) {
      console.error(`❌ Evidence fields missing: ${missing.join(', ')}`);
      process.exit(1);
    }
    if (!(ev.completeness >= ev.threshold)) {
      console.error(`❌ Evidence completeness below threshold (${ev.completeness} < ${ev.threshold})`);
      process.exit(1);
    }
  }

  function validateIngressControllerAnalysis(step2){
    const text = getStepResultText(step2?.result);
    if (!/IngressController/i.test(text)) {
      console.error('❌ IngressController analysis output not detected');
      process.exit(1);
    }
  }

  function validateNamespaceCompliance(steps){
    const allowed = new Set(['openshift-ingress','openshift-ingress-operator']);
    for (const s of steps) {
      const ns = s?.step?.params?.namespace;
      if (ns && !allowed.has(ns)) {
        console.error(`❌ Step namespace not allowed by boundary: ${ns}`);
        process.exit(1);
      }
    }
  }

  function validatePerformanceBounds(ms){
    const bound = Number(process.env.OC_TIMEOUT_MS || '120000');
    if (typeof ms === 'number' && ms > bound) {
      console.error(`❌ Execution time ${ms}ms exceeded bound ${bound}ms`);
      process.exit(1);
    }
  }
  function reportPerStepPerformance(steps){
    const soft = Number(process.env.PERF_STEP_MS || Math.floor((Number(process.env.OC_TIMEOUT_MS||'120000')/Math.max(1, steps.length)) * 0.9));
    for (let i=0;i<steps.length;i++){
      const s = steps[i];
      const tool = s?.step?.tool || 'unknown';
      const dur = Number(s?.durationMs || 0);
      console.error(`⏱️ Step ${i+1}: ${tool} - ${dur}ms`);
      if (dur > soft) {
        console.error(`⚠️  Step ${i+1} exceeded perf threshold (${dur}ms > ${soft}ms)`);
      }
    }
  }

  // Parse and validate
  try {
    const result = JSON.parse(text);
    validateBasic(result);
    if (COMPREHENSIVE) {
      validatePodDiscoveryAccuracy(result.steps?.[0]);
      validateEvidenceCompleteness(result.evidence);
      validateIngressControllerAnalysis(result.steps?.[2]);
      validateNamespaceCompliance(result.steps || []);
      validatePerformanceBounds(result.executionTimeMs);
    }
    if (PERF) {
      reportPerStepPerformance(result.steps || []);
    }
    console.error(`✅ Template execution: ${result.executed}/3 steps, evidence: PASS${COMPREHENSIVE ? ' (comprehensive)' : ''}`);
  } catch (e) {
    console.error('❌ Failed to parse template result JSON', e?.message || e);
    process.exit(1);
  }
}

run().catch(e=>{ console.error('E2E failed:', e); process.exit(1); });

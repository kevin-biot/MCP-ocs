#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import fetch from 'node-fetch';

import { UnifiedToolRegistry } from '../../src/lib/tools/tool-registry.ts';
import { OpenShiftClient } from '../../src/lib/openshift-client.ts';
import { SharedMemoryManager } from '../../src/lib/memory/shared-memory.ts';
import { DiagnosticToolsV2 } from '../../src/tools/diagnostics/index.js';
import { ReadOpsTools } from '../../src/tools/read-ops/index.js';
import { StateMgmtTools } from '../../src/tools/state-mgmt/index.js';
import { InfrastructureTools } from '../../src/tools/infrastructure/index.js';
import { allowedKeysText, getScenarioId } from './schema/vocab.mjs';
import { validateOutput } from './schema/validators.mjs';

const BASE = process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1';
const MODELS = (process.env.LMSTUDIO_MODELS || 'ministral-8b-instruct-2410,mistralai/devstral-small-2507,qwen/qwen3-coder-30b')
  .split(',').map(s=>s.trim()).filter(Boolean);
const PARAMS = {
  temperature: Number(process.env.LM_TEMPERATURE ?? 0.0),
  top_p: Number(process.env.LM_TOP_P ?? 1.0),
  max_tokens: Number(process.env.LM_MAX_TOKENS ?? 800),
  seed: Number(process.env.LM_SEED ?? 7)
};

const PROMPTS = [
  { id:'ingress-pending', file:'docs/e2e/prompts/ingress-pending.json' },
  { id:'route-5xx', file:'docs/e2e/prompts/route-5xx.json' },
  { id:'pvc-binding', file:'docs/e2e/prompts/pvc-binding.json' },
  { id:'pvc-storage-affinity', file:'docs/e2e/prompts/pvc-storage-affinity.json' },
  { id:'scheduling-failures', file:'docs/e2e/prompts/scheduling-failures.json' }
];

function loadSystemPrompt(){
  const p = path.join('docs','e2e','system-prompts','tool-first.md');
  try { return fs.readFileSync(p,'utf8'); } catch { return 'You must call tools before answering. Never guess. Output concise JSON.'; }
}
function loadPrompt(file){ return JSON.parse(fs.readFileSync(file,'utf8')); }
function toUserText(data){
  switch(String(data.template||'')){
    case 'ingress-pending': return `Investigate ingress router pending in ns=${data.ns}. Use get_pods + describe(pod) + describe(ingresscontroller).`;
    case 'route-5xx': return `Investigate route 5xx. ns=${data.ns}, route=${data.route}. Use describe(endpoints) + describe(route) + describe(pod).`;
    case 'pvc-binding': return `Investigate pvc binding. ns=${data.ns}, pvc=${data.pvc}. Use describe(pvc) + describe(storageclass) + describe(resourcequota).`;
    case 'pvc-storage-affinity': return `Investigate pvc storage affinity. ns=${data.ns}, pvc=${data.pvc}. Use describe(pvc/pv/sc) + machinesets.`;
    case 'scheduling-failures': return `Investigate scheduling failures. ns=${data.ns}, pod=${data.pod}. Use describe(pod/node) + machinesets.`;
    default: return data.prompt || `Investigate: ${JSON.stringify(data)}`;
  }
}

function toolDefs(){
  return [
    { type:'function', function: { name:'oc_read_get_pods', description:'List pods', parameters:{ type:'object', properties:{ sessionId:{type:'string'}, namespace:{type:'string'}, selector:{type:'string'} }, required:['namespace'] } } },
    { type:'function', function: { name:'oc_read_describe', description:'Describe resource', parameters:{ type:'object', properties:{ sessionId:{type:'string'}, resourceType:{type:'string'}, namespace:{type:'string'}, name:{type:'string'} }, required:['resourceType'] } } },
    { type:'function', function: { name:'oc_read_logs', description:'Pod logs', parameters:{ type:'object', properties:{ sessionId:{type:'string'}, namespace:{type:'string'}, podName:{type:'string'}, container:{type:'string'}, since:{type:'string'}, lines:{type:'integer'} }, required:['namespace','podName'] } } }
  ];
}

async function chat(model, messages){
  const body = { model, messages, tool_choice: 'auto', tools: toolDefs(), ...PARAMS };
  const res = await fetch(`${BASE}/chat/completions`, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': 'Bearer lm-studio' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`LM Studio HTTP ${res.status}`);
  return await res.json();
}

async function registry(){
  const oc = new OpenShiftClient({ ocPath:'oc', timeout: process.env.OC_TIMEOUT_MS ? Number(process.env.OC_TIMEOUT_MS) : 30000 });
  const mem = new SharedMemoryManager({ domain:'mcp-ocs', namespace:'default', memoryDir: process.env.SHARED_MEMORY_DIR || './memory', enableCompression:true, retentionDays:30, chromaHost: process.env.CHROMA_HOST || '127.0.0.1', chromaPort: process.env.CHROMA_PORT ? Number(process.env.CHROMA_PORT) : 8000 });
  try { await mem.initialize(); } catch {}
  const reg = new UnifiedToolRegistry();
  reg.registerSuite(new DiagnosticToolsV2(oc, mem));
  reg.registerSuite(new ReadOpsTools(oc, mem));
  reg.registerSuite(new StateMgmtTools(mem));
  reg.registerSuite(new InfrastructureTools(oc, mem));
  return reg;
}

function safeName(s){ return String(s).replace(/[^A-Za-z0-9._-]/g,'_'); }

async function runOnce(model, prompt){
  const sys = loadSystemPrompt();
  const data = loadPrompt(prompt.file);
  const user = toUserText(data);
  const scenario = getScenarioId(data.template);
  const keysText = allowedKeysText(scenario || '');
  function scenarioGuidance(s) {
    switch (s) {
      case 'pvc-binding':
        return 'Use "pvc_pending","storage_class_missing","quota_exceeded","zone_mismatch"; avoid generic nouns.';
      case 'pvc-storage-affinity':
        return 'Use "wffc","topology_mismatch","provisioner_slow","recent_scale_event"; use "no_evidence" if nothing found.';
      case 'scheduling-failures':
        return 'Use "failed_scheduling","node_taints","machineset_zone_skew"; use "no_evidence" if nothing found.';
      case 'route-5xx':
        return 'Use "endpoints_empty","backend_pods_failing","route_tls_mismatch".';
      case 'ingress-pending':
        return 'Use "router_pods_pending","scheduling_failed","ingress_controller_degraded".';
      case 'cluster-health':
        return 'Use "operators_degraded","ingress_controller_degraded","version_operator_degraded"; if none, use "no_evidence".';
      default:
        return '';
    }
  }
  const strictJson = `\n\nYou MUST return ONLY valid JSON with keys: {"priority":"P1|P2|P3","confidence":"High|Medium|Low","evidence_keys":[enum],"notes":"<=200 chars"}. Types MUST be strings (priority="P2", not 2). Allowed evidence_keys for ${scenario}: [${keysText}]. If tools fail (NotFound/Forbidden/etc.), do NOT output the error object—still return the schema with best-effort labels (use "no_evidence" if necessary). ${scenarioGuidance(scenario)} No prose, no extra fields.`;
  const sess = `matrix-${data.template}-${Date.now()}`;
  const reg = await registry();
  const messages = [ { role:'system', content: sys + strictJson }, { role:'user', content: user } ];
  let loops=0; const maxLoops=8; const transcript=[];
  while (loops++<maxLoops){
    const resp = await chat(model, messages);
    const choice = resp?.choices?.[0];
    const msg = choice?.message || {};
    const tcs = Array.isArray(msg?.tool_calls) ? msg.tool_calls : [];
    transcript.push({ role:'assistant', content: msg.content||'', tool_calls: tcs });
    if (tcs.length===0) break;
    for (const tc of tcs){
      try {
        const name = tc?.function?.name;
        const args = JSON.parse(tc?.function?.arguments || '{}');
        const result = await reg.executeTool(name, { sessionId: sess, ...args });
        messages.push({ role:'tool', tool_call_id: tc.id || `${Date.now()}`, name, content: String(result) });
        transcript.push({ role:'tool', name, content: String(result) });
      } catch (e) {
        messages.push({ role:'tool', tool_call_id: tc.id || `${Date.now()}`, name: tc?.function?.name || 'unknown', content: JSON.stringify({ error: String(e?.message||e) }) });
        transcript.push({ role:'tool', name: tc?.function?.name || 'unknown', content: JSON.stringify({ error: String(e?.message||e) }) });
      }
    }
    messages.push({ role:'assistant', content: msg?.content || '', tool_calls: tcs });
  }
  // Analyze + persist
  const toolCalls = transcript.filter(t=>t.role==='tool').length;
  const final = transcript.findLast ? transcript.findLast(t=>t.role==='assistant') : [...transcript].reverse().find(t=>t.role==='assistant');
  const ok = toolCalls>0 && !!final;
  const outDir = path.join('artifacts','llm-matrix');
  const tDir = path.join(outDir,'transcripts', safeName(model));
  const oDir = path.join(outDir,'outputs');
  fs.mkdirSync(tDir,{recursive:true}); fs.mkdirSync(oDir,{recursive:true});
  const ts = Date.now();
  const transcriptFile = path.join(tDir, `${safeName(data.template)}-${ts}.json`);
  fs.writeFileSync(transcriptFile, JSON.stringify({ model, template:data.template, session:sess, params:PARAMS, messages, transcript }, null, 2));
  // Attempt to parse + validate final assistant JSON content
  let parsed = null;
  try { if (final?.content) parsed = JSON.parse(final.content); } catch {}
  let validation = null;
  if (parsed && scenario) {
    try { validation = validateOutput(scenario, parsed); } catch { validation = { ok:false, errors:[{ message:'validator_error' }] }; }
  }
  const outputFile = path.join(oDir, `${safeName(model)}__${safeName(data.template)}__${ts}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(parsed ? { ...parsed, __validation: validation } : { text: final?.content || '' }, null, 2));
  // Extract a few fields if present
  const priority = parsed?.priority || null;
  const confidence = parsed?.confidence || null;
  const error = parsed?.error || null;
  const jsonValid = !!validation?.ok;
  return { model, template: data.template, ok, toolCalls, finalText: final?.content?.slice(0,500) || '', priority, confidence, error, jsonValid, transcriptFile, outputFile };
}

async function main(){
  const results=[];
  for (const model of MODELS){
    for (const p of PROMPTS){
      try {
        const r = await runOnce(model, p);
        results.push(r);
        console.error(`[llm-matrix] ${model} :: ${p.id} => ${r.ok?'OK':'NO_TOOL_CALL'} (calls=${r.toolCalls})`);
      } catch (e) {
        results.push({ model, template:p.id, ok:false, error:String(e?.message||e) });
      }
    }
  }
  const outDir = 'artifacts'; fs.mkdirSync(outDir,{recursive:true});
  const md = [
    '# LLM Matrix Report',
    '',
    '| Model | Template | Tool Calls | Status | JSON | Priority | Confidence | Error |',
    '|-------|----------|------------|--------|------|----------|------------|-------|',
    ...results.map(r=>`| ${r.model} | ${r.template} | ${r.toolCalls ?? 0} | ${r.ok ? 'OK' : 'FAIL'} | ${r.jsonValid ? 'valid' : 'invalid'} | ${r.priority ?? ''} | ${r.confidence ?? ''} | ${r.error ?? ''} |`)
  ].join('\n');
  fs.writeFileSync(path.join(outDir,'llm-matrix-report.md'), md);
  fs.writeFileSync(path.join(outDir,'llm-matrix-report.json'), JSON.stringify({ params: PARAMS, models: MODELS, results }, null, 2));
  console.log(md);
}

main().catch(e=>{ console.error(e?.message||e); process.exit(1); });

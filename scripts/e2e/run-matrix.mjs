#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import fetch from 'node-fetch';
import { normalize } from './normalize.mjs';
import { executeTool } from './tool-bridge.mjs';
import { scoreRunFiles } from './robustness-score.mjs';
import { allowedKeysText, getScenarioId } from './schema/vocab.mjs';
import { EVIDENCE_VOCAB } from './schema/vocab.mjs';
import { validateOutput } from './schema/validators.mjs';
import { TemplateEngine } from '../../src/lib/templates/template-engine.ts';
import { evaluateRubrics } from '../../src/lib/rubrics/rubric-evaluator.ts';
import { EVIDENCE_CONFIDENCE_V1 } from '../../src/lib/rubrics/core/evidence-confidence.v1.ts';

const BASE = process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1/chat/completions';

function hashToolDefs(tools) { return crypto.createHash('sha256').update(JSON.stringify(tools||[])).digest('hex').slice(0,12); }
function ensureDir(p){ fs.mkdirSync(p,{recursive:true}); }
function safe(s){ return String(s).replace(/[^A-Za-z0-9._-]/g,'_'); }

async function chat(body){
  const res = await fetch(BASE, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`LM Studio HTTP ${res.status}`);
  return await res.json();
}

async function runOnce({ name, model, system, user, tools, toolChoice, temperature, top_p, seed }){
  const meta = { model, temperature, top_p, seed, tool_mode: (tools?.length?'rest-tools':'ui-mcp'), tool_defs_hash: hashToolDefs(tools), timestamp: new Date().toISOString() };
  const input = { system, user };
  const messages = [{ role:'system', content: system }, { role:'user', content: user }];
  const body = { model, messages, temperature, top_p, seed, tools, tool_choice: toolChoice||'auto', max_tokens: 1200 };
  const turns = [];
  let idx = 0;
  const first = await chat(body);
  const fmsg = first?.choices?.[0]?.message || {};
  turns.push({ idx: idx++, role:'assistant', content: fmsg?.content || '', tool_call: null });
  const calls = Array.isArray(fmsg?.tool_calls) ? fmsg.tool_calls : [];
  let toolCallsOk = 0;
  for (const c of calls){
    const args = JSON.parse(c?.function?.arguments || '{}');
    const t0 = Date.now();
    const r = await executeTool(c?.function?.name, args);
    const elapsed_ms = Date.now() - t0;
    if (r?.ok) toolCallsOk++;
    turns.push({ idx: idx++, role:'tool', content: typeof r?.data==='string' ? r.data.slice(0,2000) : '', tool_call: { name:c?.function?.name, arguments: args }, tool_result: { ok: !!r?.ok, elapsed_ms, data: r?.data } });
    messages.push({ role:'tool', tool_call_id: c?.id || `${Date.now()}`, content: typeof r?.data==='string' ? r.data : JSON.stringify(r?.data) });
  }
  if (calls.length){
    const final = await chat({ model, messages, temperature, top_p, seed, max_tokens: 1500 });
    const f2 = final?.choices?.[0]?.message || {};
    turns.push({ idx: idx++, role:'assistant', content: f2?.content || '', tool_call: null });
  }
  // Determine final text and optionally coerce to strict JSON once
  const scenarioName = getScenarioId(name) || 'ingress-pending';
  function onlyAllowed(arr){
    const vocab = new Set(EVIDENCE_VOCAB[scenarioName] || []);
    return (Array.isArray(arr)?arr:[]).every(k=>vocab.has(k));
  }
  let final_text = (turns.at(-1)?.role==='assistant' ? turns.at(-1)?.content : turns[0]?.content) || '';
  let parsed = null; try { parsed = JSON.parse(final_text); } catch {}
  let valid = parsed ? validateOutput(scenarioName, parsed).ok : false;
  if (parsed && !onlyAllowed(parsed.evidence_keys)) valid = false;
  if (!valid) {
    const allowed = (EVIDENCE_VOCAB[scenarioName]||[]).join(', ');
    const coerceMsg = { role:'user', content: `Return ONLY this JSON: {"priority":"P1|P2|P3","confidence":"High|Medium|Low","slo":"CRITICAL|HIGH|MEDIUM|LOW","evidence_keys":[enum],"notes":"<=200"}. Allowed evidence_keys for ${scenarioName}: [${allowed}]. Replace unknown with [] or ["no_evidence"]. If no evidence, set confidence="Low".` };
    messages.push(coerceMsg);
    const coerced = await chat({ model, messages, temperature, top_p, seed, max_tokens: 600 });
    const m = coerced?.choices?.[0]?.message || {};
    turns.push({ idx: idx++, role:'assistant', content: m?.content || '', tool_call: null });
    final_text = m?.content || final_text;
  }
  const final_text_norm = normalize(final_text);
  // Engine cross-check: evidence completeness + confidence label (optional)
  let evidenceCompleteness = null;
  let engineConfidence = null;
  try {
    const scenario = getScenarioId(name);
    const tmplPath = scenario ? path.join('src','lib','templates','templates', `${scenario}.json`) : null;
    if (tmplPath && fs.existsSync(tmplPath)) {
      const template = JSON.parse(fs.readFileSync(tmplPath,'utf8'));
      const engine = new TemplateEngine();
      const executed = (turns||[])
        .filter(t => t?.tool_result)
        .map(t => ({ step: { tool: t?.tool_call?.name || 'unknown', params: t?.tool_call?.arguments || {} }, result: t?.tool_result?.data }));
      const ev = engine.evaluateEvidence(template, executed);
      evidenceCompleteness = Number((ev?.completeness ?? 0).toFixed(3));
      const rub = evaluateRubrics({ confidence: EVIDENCE_CONFIDENCE_V1 }, { evidenceCompleteness, toolAgreement: (calls.length? (toolCallsOk/calls.length) : 0), freshnessMin: 5 });
      engineConfidence = rub?.confidence?.label || null;
    }
  } catch {/* non-fatal */}
  const transcript = { meta, input, turns, summary: { final_text, final_text_norm, templates: [], rubrics: { engineConfidence }, metrics: { tool_calls_total: calls.length, tool_calls_ok: toolCallsOk, evidence_completeness: evidenceCompleteness, priority_label: null, slo_label: null } } };
  const dir = path.join('logs','transcripts', safe(name)); ensureDir(dir);
  const file = path.join(dir, `${safe(name)}__${safe(model)}__t${temperature}_p${top_p}_s${seed}__${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(transcript, null, 2));
  return file;
}

async function main(){
  const name = process.argv[2] || 'ingress-pending-demo';
  const model = process.env.LMS_MODEL || 'qwen/qwen3-coder-30b';
  // Strict JSON-only gating + scenario vocab
  const scenario = getScenarioId(name) || 'ingress-pending';
  const keysText = allowedKeysText(scenario);
  function scenarioGuidance(s) {
    switch (s) {
      case 'pvc-binding':
        return 'Use evidence_keys like "pvc_pending","storage_class_missing","quota_exceeded","zone_mismatch" (not generic nouns).';
      case 'pvc-storage-affinity':
        return 'Use keys like "wffc","topology_mismatch","provisioner_slow","recent_scale_event"; if none, use "no_evidence".';
      case 'scheduling-failures':
        return 'Use keys like "failed_scheduling","node_taints","machineset_zone_skew"; if none, use "no_evidence".';
      case 'route-5xx':
        return 'Use keys like "endpoints_empty","backend_pods_failing","route_tls_mismatch".';
      case 'ingress-pending':
        return 'Use keys like "router_pods_pending","scheduling_failed","ingress_controller_degraded".';
      case 'cluster-health':
        return 'Use keys like "operators_degraded","ingress_controller_degraded","version_operator_degraded"; if none, use "no_evidence".';
      default:
        return '';
    }
  }
  const system = `You are an SRE using MCP tools. You MUST gather evidence via tool calls before answering. Output ONLY valid JSON with exact keys: {"priority":"P1|P2|P3","confidence":"High|Medium|Low","evidence_keys":[enum],"notes":string(<=200 chars)}. Types MUST be strings (e.g., priority="P2", not 2). Use only allowed evidence_keys for ${scenario}: [${keysText}]. If tools fail (NotFound/Forbidden/etc.), do NOT output the error object—still return the schema with best-effort labels (use "no_evidence" if necessary). ${scenarioGuidance(scenario)} No prose or extra fields.`;
  // Scenario-mapped user prompts
  let user = '';
  const NS = process.env.E2E_NS || null;
  const PVC = process.env.E2E_PVC || null;
  const SC = process.env.E2E_SC || 'gp3-csi';
  const POD = process.env.E2E_POD || null;
  const ROUTE = process.env.E2E_ROUTE || 'checkout';
  const SERVICE = process.env.E2E_SERVICE || 'backend';
  if (/route-5xx/i.test(name)) {
    const ns = NS || 'default';
    const route = ROUTE;
    user = `Investigate route 5xx in ns=${ns}, route=${route}. Use describe(endpoints), describe(route), and describe(pod) to collect evidence. Return only JSON (priority, confidence, evidence_keys, notes).`;
  } else if (/pvc-binding/i.test(name)) {
    const ns = NS || 'default';
    const pvc = PVC || 'shared-pvc';
    user = `Investigate PVC binding in ns=${ns}, pvc=${pvc}. Use describe(pvc), describe(storageclass name=${SC}), describe(resourcequota). Return only JSON (priority, confidence, evidence_keys, notes).`;
  } else if (/pvc-storage-affinity/i.test(name)) {
    const ns = NS || 'default';
    const pvc = PVC || 'shared-pvc';
    user = `Investigate PVC storage affinity in ns=${ns}, pvc=${pvc}. Use describe(pvc), describe(pv), describe(storageclass name=${SC}), and machinesets. Return only JSON (priority, confidence, evidence_keys, notes).`;
  } else if (/scheduling-failures/i.test(name)) {
    const ns = NS || 'default';
    const pod = POD || 'example-pod';
    user = `Investigate pod scheduling failures in ns=${ns}, pod=${pod}. Use describe(pod), describe(node), and machinesets. Return only JSON (priority, confidence, evidence_keys, notes).`;
  } else if (/cluster-health/i.test(name)) {
    user = 'Investigate cluster health: identify degraded operators and critical components. Use describe ClusterOperator (ingress, network, storage, etc.) and clusterversion. Return only JSON (priority, confidence, evidence_keys, notes).';
  } else { // ingress default
    user = 'Investigate ingress router pending in ns=openshift-ingress. Use get_pods, describe(pod), describe(ingresscontroller). Return only JSON (priority, confidence, evidence_keys, notes).';
  }
  const tools = [
    { type:'function', function:{ name:'oc_read_get_pods', description:'List pods', parameters:{ type:'object', properties:{ namespace:{type:'string'}, selector:{type:'string'} }, required:['namespace'] } } },
    { type:'function', function:{ name:'oc_read_describe', description:'Describe resource', parameters:{ type:'object', properties:{ resourceType:{type:'string'}, namespace:{type:'string'}, name:{type:'string'} }, required:['resourceType'] } } }
  ];
  const temps = (process.env.LM_TEMPS || '0.0').split(',').map(Number);
  const seeds = (process.env.LM_SEEDS || '7,13,23').split(',').map(Number);
  const files = [];
  for (const t of temps){
    for (const s of seeds){
      const f = await runOnce({ name, model, system, user, tools, toolChoice:'auto', temperature:t, top_p:1.0, seed:s });
      files.push(f);
    }
  }
  // Validate outputs against schema
  const schemaResults = [];
  for (const f of files) {
    try {
      const t = JSON.parse(fs.readFileSync(f,'utf8'));
      const raw = t?.summary?.final_text || '';
      let parsed = null; try { parsed = JSON.parse(raw); } catch {}
      const v = parsed ? validateOutput(scenario, parsed) : { ok: false, errors: [{ message: 'not_json' }] };
      schemaResults.push({ file: f, ok: !!v.ok, errors: v.ok ? null : v.errors });
    } catch {
      schemaResults.push({ file: f, ok: false, errors: [{ message: 'read_error' }] });
    }
  }
  const jsonValidRate = schemaResults.length ? (schemaResults.filter(r=>r.ok).length / schemaResults.length) : 0;
  const score = scoreRunFiles(files);
  const outDir = path.join('logs','robustness'); ensureDir(outDir);
  // Extract priority/confidence/evidence_keys if the final_text is JSON
  const extracted = files.map(f => {
    try {
      const t = JSON.parse(fs.readFileSync(f,'utf8'));
      const raw = t?.summary?.final_text || '';
      let parsed = null; try { parsed = JSON.parse(raw); } catch {}
      const priority = parsed?.priority ?? null;
      const confidence = parsed?.confidence ?? null;
      const slo = parsed?.slo ?? null;
      const evidence_keys = Array.isArray(parsed?.evidence?.keys) ? parsed.evidence.keys : (Array.isArray(parsed?.evidence_keys) ? parsed.evidence_keys : null);
      return { file: f, priority, confidence, slo, evidence_keys };
    } catch { return { file: f, priority: null, confidence: null, evidence_keys: null }; }
  });
  const out = path.join(outDir, `${safe(name)}__${safe(model)}__score.json`);
  fs.writeFileSync(out, JSON.stringify({ model, scenario: name, files, score, extracted, schema: { scenario, jsonValidRate, results: schemaResults } }, null, 2));
  console.log('ROBUSTNESS SUMMARY:', score);
}

main().catch(e=>{ console.error(e); process.exit(1); });

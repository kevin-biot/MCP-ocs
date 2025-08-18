#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import fetch from 'node-fetch';

// Local registry bootstrap (reuse existing tool suites)
import { UnifiedToolRegistry } from '../../src/lib/tools/tool-registry.js';
import { OpenShiftClient } from '../../src/lib/openshift-client.js';
import { SharedMemoryManager } from '../../src/lib/memory/shared-memory.js';
import { DiagnosticToolsV2 } from '../../src/tools/diagnostics/index.js';
import { ReadOpsTools } from '../../src/tools/read-ops/index.js';
import { StateMgmtTools } from '../../src/tools/state-mgmt/index.js';
import { InfrastructureTools } from '../../src/tools/infrastructure/index.js';

function arg(key, def){ const i = process.argv.indexOf(`--${key}`); if (i>=0 && i+1<process.argv.length) return process.argv[i+1]; return process.env[key.toUpperCase()] || def; }

const BASE = process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1';
const MODEL = arg('model', process.env.MODEL || 'qwen2.5-7b-instruct');
const PROMPT_FILE = arg('prompt', null);
const INLINE_PROMPT = arg('prompt-text', null);
const SESSION_ID = arg('session', `lmstudio-${Date.now()}`);
const OUT_DIR = 'tests/tmp/lmstudio-transcript';
fs.mkdirSync(OUT_DIR, { recursive: true });
const OUT_FILE = arg('out', path.join(OUT_DIR, `${Date.now()}-${SESSION_ID}.json`));

function loadSystemPrompt(){
  const p = path.join('docs','e2e','system-prompts','tool-first.md');
  try { return fs.readFileSync(p,'utf8'); } catch { return 'You must call tools before answering. Never guess. Output concise JSON.'; }
}

function loadUserPrompt(){
  if (INLINE_PROMPT) return INLINE_PROMPT;
  if (!PROMPT_FILE) { console.error('Provide --prompt <file.json> or --prompt-text'); process.exit(1); }
  const raw = fs.readFileSync(PROMPT_FILE, 'utf8');
  const data = JSON.parse(raw);
  // Simple template mapping
  if (data.template === 'route-5xx') return `Investigate route 5xx. ns=${data.ns}, route=${data.route}. Use endpoints/route/pod describe.`;
  if (data.template === 'pvc-binding') return `Investigate pvc binding. ns=${data.ns}, pvc=${data.pvc}. Use pvc/sc/quota describe.`;
  if (data.template === 'scheduling-failures') return `Investigate scheduling failures. ns=${data.ns}, pod=${data.pod}. Use pod/node/machinesets.`;
  return data.prompt || `Investigate: ${JSON.stringify(data)}`;
}

function toolDefs(){
  return [
    { type:'function', function: { name:'oc_read_get_pods', description:'List pods', parameters:{ type:'object', properties:{ sessionId:{type:'string'}, namespace:{type:'string'}, selector:{type:'string'} }, required:['namespace'] } } },
    { type:'function', function: { name:'oc_read_describe', description:'Describe resource', parameters:{ type:'object', properties:{ sessionId:{type:'string'}, resourceType:{type:'string'}, namespace:{type:'string'}, name:{type:'string'} }, required:['resourceType'] } } },
    { type:'function', function: { name:'oc_read_logs', description:'Pod logs', parameters:{ type:'object', properties:{ sessionId:{type:'string'}, namespace:{type:'string'}, podName:{type:'string'}, container:{type:'string'}, since:{type:'string'}, lines:{type:'integer'} }, required:['namespace','podName'] } } },
  ];
}

async function chat(messages){
  const body = { model: MODEL, messages, tool_choice: 'auto', tools: toolDefs(), temperature: 0 };
  const res = await fetch(`${BASE}/chat/completions`, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': 'Bearer lm-studio' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`LM Studio HTTP ${res.status}`);
  return await res.json();
}

async function ensureRegistry(){
  const openshiftClient = new OpenShiftClient({ ocPath:'oc', timeout: process.env.OC_TIMEOUT_MS ? Number(process.env.OC_TIMEOUT_MS) : 30000 });
  const sharedMemory = new SharedMemoryManager({ domain:'mcp-ocs', namespace:'default', memoryDir: process.env.SHARED_MEMORY_DIR || './memory', enableCompression:true, retentionDays:30, chromaHost: process.env.CHROMA_HOST || '127.0.0.1', chromaPort: process.env.CHROMA_PORT ? Number(process.env.CHROMA_PORT) : 8000 });
  try { await sharedMemory.initialize(); } catch {}
  const reg = new UnifiedToolRegistry();
  reg.registerSuite(new DiagnosticToolsV2(openshiftClient, sharedMemory));
  reg.registerSuite(new ReadOpsTools(openshiftClient, sharedMemory));
  reg.registerSuite(new StateMgmtTools(sharedMemory));
  reg.registerSuite(new InfrastructureTools(openshiftClient, sharedMemory));
  return reg;
}

async function run(){
  const system = loadSystemPrompt();
  const user = loadUserPrompt();
  const transcript = [];
  const messages = [ { role:'system', content: system }, { role:'user', content: user } ];
  const reg = await ensureRegistry();
  let loops = 0; const maxLoops = 8;
  while (loops++ < maxLoops) {
    const start = Date.now();
    const resp = await chat(messages);
    const choice = resp?.choices?.[0];
    const msg = choice?.message || {};
    transcript.push({ ts: Date.now(), role:'assistant', content: msg?.content || '', tool_calls: msg?.tool_calls || [] });
    if (!Array.isArray(msg?.tool_calls) || msg.tool_calls.length === 0) break;
    for (const tc of msg.tool_calls) {
      try {
        const name = tc?.function?.name;
        const args = JSON.parse(tc?.function?.arguments || '{}');
        if (!name) continue;
        const argObj = { sessionId: SESSION_ID, ...args };
        const result = await reg.executeTool(name, argObj);
        messages.push({ role:'tool', tool_call_id: tc.id || `${Date.now()}`, name, content: String(result) });
        transcript.push({ ts: Date.now(), role:'tool', name, content: String(result) });
      } catch (e) {
        messages.push({ role:'tool', tool_call_id: tc.id || `${Date.now()}`, name: tc?.function?.name || 'unknown', content: JSON.stringify({ error: String(e?.message||e) }) });
      }
    }
    // push assistant turn to messages for next loop
    messages.push({ role:'assistant', content: msg?.content || '', tool_calls: msg?.tool_calls || [] });
    if (Date.now() - start > 30000) break;
  }
  fs.writeFileSync(OUT_FILE, JSON.stringify({ model: MODEL, base: BASE, sessionId: SESSION_ID, messages }, null, 2));
  // Quick summary
  const toolCalls = transcript.filter(t => t.role==='tool').length;
  console.error(`[lmstudio-tool-runner] Completed. Tool calls: ${toolCalls}. Transcript: ${OUT_FILE}`);
}

run().catch(e=>{ console.error(e?.message||e); process.exit(1); });


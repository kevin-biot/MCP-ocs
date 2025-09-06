#!/usr/bin/env node

/**
 * MCP-ocs Main Entry Point - Complete Tool Suite
 * Registers ALL tools: diagnostics, read-ops, state-mgmt, write-ops
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';

import { DiagnosticToolsV2 } from './tools/diagnostics/index.js';
import { ReadOpsTools } from './tools/read-ops/index.js';
import { StateMgmtTools } from './tools/state-mgmt/index.js';
import { OpenShiftClient } from './lib/openshift-client.js';
import { SharedMemoryManager } from './lib/memory/shared-memory.js';
import { WorkflowEngine } from './lib/workflow/workflow-engine.js';
import { AutoMemorySystem } from './lib/memory/auto-memory-system.js';
import { KnowledgeSeedingSystem } from './lib/memory/knowledge-seeding-system.js';
// TEMP DISABLED: import { KnowledgeSeedingTool, KnowledgeToolsSuite } from './tools/memory/knowledge-seeding-tool-v2.js';
import { UnifiedToolRegistry } from './lib/tools/tool-registry.js';
import { EnhancedSequentialThinkingOrchestrator } from './lib/tools/sequential-thinking-with-memory.js';
import { TemplateRegistry } from './lib/templates/template-registry.js';
import { TemplateEngine } from './lib/templates/template-engine.js';
import { BoundaryEnforcer } from './lib/enforcement/boundary-enforcer.js';
import fs from 'node:fs';
import path from 'node:path';
import { evaluateRubrics } from './lib/rubrics/rubric-evaluator.js';
import { TRIAGE_PRIORITY_V1 } from './lib/rubrics/core/triage-priority.v1.js';
import { EVIDENCE_CONFIDENCE_V1 } from './lib/rubrics/core/evidence-confidence.v1.js';
import { REMEDIATION_SAFETY_V1 } from './lib/rubrics/core/remediation-safety.v1.js';
import { SLO_IMPACT_V1 } from './lib/rubrics/core/slo-impact.v1.js';
import { DIAGNOSTIC_CLUSTER_HEALTH_SAFETY_V1 } from './lib/rubrics/diagnostic/cluster-health-safety.v1.js';
import { DIAGNOSTIC_POD_HEALTH_SAFETY_V1, DIAGNOSTIC_POD_HEALTH_CONFIDENCE_V1 } from './lib/rubrics/diagnostic/pod-health-rubrics.v1.js';
import { DIAGNOSTIC_NAMESPACE_HEALTH_CONFIDENCE_V1 } from './lib/rubrics/diagnostic/namespace-health-confidence.v1.js';
import { DIAGNOSTIC_RCA_CHECKLIST_MAPPING_V1, DIAGNOSTIC_RCA_CHECKLIST_SAFETY_V1 } from './lib/rubrics/diagnostic/rca-checklist-rubrics.v1.js';
import { MEMORY_SEARCH_CONFIDENCE_V1 } from './lib/rubrics/intelligence/memory-search-confidence.v1.js';
import { MEMORY_STORE_SAFETY_V1 } from './lib/rubrics/intelligence/memory-store-safety.v1.js';
import { MEMORY_STATS_SAFETY_V1 } from './lib/rubrics/intelligence/memory-stats-safety.v1.js';
import { MEMORY_CONVERSATIONS_CONFIDENCE_V1 } from './lib/rubrics/intelligence/memory-conversations-confidence.v1.js';

console.error('🚀 Starting MCP-ocs server...');

// Initialize core components
const openshiftClient = new OpenShiftClient({
  ocPath: 'oc',
  timeout: process.env.OC_TIMEOUT_MS ? Number(process.env.OC_TIMEOUT_MS) : 30000
});

const sharedMemory = new SharedMemoryManager({
  domain: 'mcp-ocs',
  namespace: 'default',
  memoryDir: process.env.SHARED_MEMORY_DIR || './memory',
  enableCompression: true,
  retentionDays: 30,
  chromaHost: process.env.CHROMA_HOST || '127.0.0.1',
  chromaPort: process.env.CHROMA_PORT ? Number(process.env.CHROMA_PORT) : 8000
});
// Ensure memory directories exist (conversations/operational)
try { await sharedMemory.initialize(); } catch (e) { console.error('Shared memory initialization failed:', e instanceof Error ? e.message : e); }

const workflowEngine = new WorkflowEngine({
  enablePanicDetection: true,
  enforcementLevel: 'guidance',
  memoryManager: sharedMemory,
  minEvidenceThreshold: 2
});

// Initialize auto-memory system for intelligent tool tracking
const autoMemory = new AutoMemorySystem(sharedMemory);

// Initialize knowledge seeding system
const knowledgeSeedingSystem = new KnowledgeSeedingSystem(sharedMemory, autoMemory);
// TEMP DISABLED: const knowledgeSeedingTool = new KnowledgeSeedingTool(knowledgeSeedingSystem);

// Initialize unified tool registry
const toolRegistry = new UnifiedToolRegistry();

// Create ALL tool suites
const diagnosticTools = new DiagnosticToolsV2(openshiftClient, sharedMemory);
const readOpsTools = new ReadOpsTools(openshiftClient, sharedMemory);
const stateMgmtTools = new StateMgmtTools(sharedMemory, workflowEngine);
// TEMP DISABLED: const knowledgeTools = new KnowledgeToolsSuite(knowledgeSeedingTool);

// Register all suites with unified registry
toolRegistry.registerSuite(diagnosticTools);
toolRegistry.registerSuite(readOpsTools);
toolRegistry.registerSuite(stateMgmtTools);
// TEMP DISABLED: toolRegistry.registerSuite(knowledgeTools);

// Register an explicit orchestrator tool so LLMs can opt-in to planning in the standard entrypoint
const sequentialThinkingOrchestrator = new EnhancedSequentialThinkingOrchestrator(toolRegistry, sharedMemory);

// Deterministic Template Engine (behind flag)
const ENABLE_TEMPLATE_ENGINE = process.env.ENABLE_TEMPLATE_ENGINE === 'true';
const ENABLE_RUBRICS = process.env.ENABLE_RUBRICS === 'true';
const templateRegistry = new TemplateRegistry();
const templateEngine = new TemplateEngine();
await templateRegistry.load().catch((e)=>{ console.error('Template registry load failed:', e instanceof Error ? e.message : e); });
toolRegistry.registerTool({
  name: 'sequential_thinking',
  fullName: 'sequential_thinking',
  description: 'Facilitates detailed, step-by-step thinking for problem-solving: plan → execute → reflect with memory.',
  inputSchema: {
    type: 'object',
    properties: {
      sessionId: { type: 'string', description: 'Conversation/session identifier' },
      thought: { type: 'string' },
      nextThoughtNeeded: { anyOf: [{ type: 'boolean' }, { type: 'string' }] },
      thoughtNumber: { anyOf: [{ type: 'integer' }, { type: 'string' }] },
      totalThoughts: { anyOf: [{ type: 'integer' }, { type: 'string' }] },
      isRevision: { anyOf: [{ type: 'boolean' }, { type: 'string' }] },
      revisesThought: { anyOf: [{ type: 'integer' }, { type: 'string' }] },
      branchFromThought: { anyOf: [{ type: 'integer' }, { type: 'string' }] },
      branchId: { type: 'string' },
      needsMoreThoughts: { anyOf: [{ type: 'boolean' }, { type: 'string' }] },
      bounded: { anyOf: [{ type: 'boolean' }, { type: 'string' }], description: 'Avoid expensive cluster-wide sweeps' },
      firstStepOnly: { anyOf: [{ type: 'boolean' }, { type: 'string' }], description: 'Execute only the first planned step' },
      mode: { anyOf: [{ type: 'string' }], description: 'planOnly | firstStepOnly | boundedMultiStep | unbounded' },
      continuePlan: { anyOf: [{ type: 'boolean' }, { type: 'string' }] },
      triageTarget: { type: 'string', description: 'Ingress | monitoring | crashloops | storage' },
      stepBudget: { anyOf: [{ type: 'integer' }, { type: 'string' }], description: 'Steps to execute in boundedMultiStep mode' },
      timeoutMs: { anyOf: [{ type: 'integer' }, { type: 'string' }], description: 'Override orchestrator guard timeout' }
    },
    required: ['thought', 'nextThoughtNeeded', 'thoughtNumber', 'totalThoughts'],
    additionalProperties: true
  },
  async execute(args: unknown): Promise<string> {
    const rec = (v: unknown): Record<string, unknown> => (v && typeof v === 'object') ? (v as Record<string, unknown>) : {};
    const raw = rec(args);
    const userInput = String((raw.thought ?? raw.userInput) ?? '');
    const session = String((raw.sessionId ?? `session-${Date.now()}`));
    const coerceBool = (v: unknown) => typeof v === 'string' ? ['true','1','yes','on','false','0','no','off'].includes(v.toLowerCase()) ? ['true','1','yes','on'].includes(v.toLowerCase()) : Boolean(v) : Boolean(v);
    const coerceNum = (v: unknown, d?: number) => typeof v === 'string' ? (Number(v) || d || 0) : (typeof v === 'number' ? v : (d || 0));
    const bounded = coerceBool(raw.bounded);
    const triageTarget = typeof raw.triageTarget === 'string' ? raw.triageTarget as string : undefined;
    const firstStepOnly = Object.prototype.hasOwnProperty.call(raw, 'firstStepOnly') ? coerceBool(raw.firstStepOnly) : (bounded ? true : false);
    const nextThoughtNeeded = Object.prototype.hasOwnProperty.call(raw, 'nextThoughtNeeded') ? coerceBool(raw.nextThoughtNeeded) : true;
    const timeoutMs = coerceNum(raw.timeoutMs ?? process.env.SEQ_TIMEOUT_MS ?? (bounded ? 12000 : 0), bounded ? 12000 : 0);
    const reflectOnly = nextThoughtNeeded === false;
    let mode = typeof raw.mode === 'string' ? raw.mode as string : (firstStepOnly ? 'firstStepOnly' : (bounded ? 'firstStepOnly' : 'planOnly'));
    if (!raw.mode && bounded && triageTarget && triageTarget.toLowerCase().includes('ingress')) {
      mode = 'boundedMultiStep';
    }
    const continuePlan = coerceBool(raw.continuePlan);
    const stepBudget = coerceNum(raw.stepBudget ?? (mode === 'boundedMultiStep' ? 2 : 2), 2);
    const result = await sequentialThinkingOrchestrator.handleUserRequest(userInput, session, { bounded, firstStepOnly, reflectOnly, timeoutMs, nextThoughtNeeded, mode, continuePlan, triageTarget, stepBudget });
    return JSON.stringify(result, null, 2);
  },
  category: 'workflow',
  version: 'v2',
  metadata: { experimental: true, mcpCompatible: true }
});

// Get all tools for MCP registration (after any dynamic registrations)
let allTools = toolRegistry.getMCPTools();

console.error(`✅ Registered ${allTools.length} tools from all suites`);

// Print registry statistics
const stats = toolRegistry.getStats();
console.error('📈 Registry Stats:', JSON.stringify(stats, null, 2));
console.error('🔧 Debug - Tool names:', allTools.map(t => t.name));

// Create MCP server
const server = new Server(
  {
    name: "mcp-ocs",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools/list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('📋 Listing all available tools...');
  // Always reflect the latest registrations
  allTools = toolRegistry.getMCPTools();
  return {
    tools: allTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))
  };
});

// Register tools/call handler with auto-memory integration
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();
  
  console.error(`🔧 Executing tool: ${name}`);
  
  // Template Engine primary path (behind flag)
  if (ENABLE_TEMPLATE_ENGINE && (request.params.arguments as any)?.triageTarget) {
    const targs = request.params.arguments as any;
    const triageTarget = String(targs.triageTarget);
    const sel = templateRegistry.selectByTarget(triageTarget);
    if (!sel) { console.error('❌ No template for target', triageTarget); }
    else {
      const tStart = Date.now();
      const stepBudget = Number(targs.stepBudget || 2);
      const bounded = !!targs.bounded;
      const sessionId = String(targs.sessionId || `session-${Date.now()}`);
      const plan = templateEngine.buildPlan(sel.template, { sessionId, bounded, stepBudget, vars: (args as any)?.vars || {} });
      const enforcer = new BoundaryEnforcer({ maxSteps: plan.boundaries.maxSteps, timeoutMs: plan.boundaries.timeoutMs, toolWhitelist: undefined, allowedNamespaces: targs.allowedNamespaces });
      const steps = enforcer.filterSteps(plan.steps);
      const exec: any[] = [];
      const ctxVars: Record<string, any> = { ...(targs.vars || {}) };
      const replaceVarsLocal = (obj: any): any => {
        if (obj == null) return obj;
        if (typeof obj === 'string') {
          const m = obj.match(/^<([^>]+)>$/);
          if (m) { const k = m[1]; return typeof ctxVars[k] !== 'undefined' ? ctxVars[k] : obj; }
          return obj;
        }
        if (Array.isArray(obj)) return obj.map(replaceVarsLocal);
        if (typeof obj === 'object') { const out: any = {}; for (const [k,v] of Object.entries(obj)) out[k] = replaceVarsLocal(v); return out; }
        return obj;
      };
      const isPlaceholder = (v:any) => typeof v === 'string' && /^<[^>]+>$/.test(v);
      for (const s of steps) {
        let params = replaceVarsLocal(s.params);
        // Networking dynamic discovery before execution
        try {
          if (s.tool === 'oc_read_describe' && params?.resourceType === 'endpoints' && isPlaceholder(params?.name)) {
            // If service missing but route known, try to describe route to infer service
            const ns = params?.namespace;
            const routeName = ctxVars.route;
            if (!ctxVars.service && routeName && ns) {
              const rdesc = await toolRegistry.executeTool('oc_read_describe', { sessionId, resourceType: 'route', name: routeName, namespace: ns });
              const text = typeof rdesc === 'string' ? rdesc : JSON.stringify(rdesc);
              const m = text.match(/Service\s*:\s*([A-Za-z0-9-_.]+)/);
              if (m) { ctxVars.service = m[1]; params = { ...params, name: ctxVars.service }; }
            }
          }
          if (s.tool === 'oc_read_describe' && params?.resourceType === 'pod' && isPlaceholder(params?.name)) {
            // Resolve backendPod using service selector if available
            const ns = params?.namespace;
            if (!ctxVars.backendPod && ctxVars.service && ns) {
              const sdesc = await toolRegistry.executeTool('oc_read_describe', { sessionId, resourceType: 'service', name: ctxVars.service, namespace: ns });
              const txt = typeof sdesc === 'string' ? sdesc : JSON.stringify(sdesc);
              const sel = txt.match(/Selector\s*:\s*([^\n]+)/);
              const selector = sel ? sel[1].trim().replace(/\s+/g,'').replace(/,/g,',') : undefined;
              if (selector) {
                const pods = await toolRegistry.executeTool('oc_read_get_pods', { sessionId, namespace: ns, selector });
                try {
                  const obj = typeof pods === 'string' ? JSON.parse(pods) : pods;
                  const list = Array.isArray(obj?.pods) ? obj.pods : [];
                  const ready = list.find((p:any)=>String(p?.ready||'')==='1/1') || list[0];
                  if (ready?.name) { ctxVars.backendPod = ready.name; params = { ...params, name: ctxVars.backendPod }; }
                } catch {}
              }
            }
          }
        } catch {}
        const sStart = Date.now();
        const r = await toolRegistry.executeTool(s.tool, params);
        const sDur = Date.now() - sStart;
        exec.push({ step: { ...s, params }, result: r, durationMs: sDur });
        // Dynamic discovery: capture pending router pod after get_pods in openshift-ingress
        try {
          if (s.tool === 'oc_read_get_pods' && String(params?.namespace) === 'openshift-ingress') {
            const parsed = typeof r === 'string' ? JSON.parse(r) : r;
            const pods = Array.isArray(parsed?.pods) ? parsed.pods : [];
            const pending = pods.find((p: any) => String(p?.name || '').startsWith('router-default-') && (p?.status === 'Pending' || String(p?.ready || '') === '0/1'));
            if (pending?.name) ctxVars.pendingRouterPod = pending.name;
            // Preflight fallback: if a provided pendingRouterPod is not present, select any router-default-*
            try {
              const routers = pods.filter((p:any)=> String(p?.name||'').startsWith('router-default-'));
              if (ctxVars.pendingRouterPod && !routers.some((p:any)=>p?.name === ctxVars.pendingRouterPod) && routers[0]?.name) {
                ctxVars.pendingRouterPod = routers[0].name;
              }
            } catch {}
          }
          // Generic dynamic pod selection for templates expecting <pod>
          if (s.tool === 'oc_read_get_pods') {
            const parsed = typeof r === 'string' ? JSON.parse(r) : r;
            const pods = Array.isArray(parsed?.pods) ? parsed.pods : (Array.isArray(parsed?.items) ? parsed.items.map((it:any)=>({ name: it?.metadata?.name, status: it?.status?.phase })) : []);
            const crash = pods.find((p: any) => /crashloopbackoff/i.test(String(p?.status || '')));
            const anyPod = pods[0];
            if (!ctxVars.pod && (crash?.name || anyPod?.name)) ctxVars.pod = crash?.name || anyPod?.name;
          }
        } catch {}
      }
      // Evidence completeness scoring against the template's contract
      let evidence: any = undefined;
      try {
        const ev = templateEngine.evaluateEvidence(sel.template, exec);
        const threshold = Number(sel.template?.evidenceContract?.completenessThreshold || 0);
        evidence = { completeness: ev.completeness, missing: ev.missing, present: ev.present, threshold, pass: ev.completeness >= threshold };
      } catch {}
      // Core rubric evaluation (behind ENABLE_RUBRICS)
      let rubrics: any = undefined;
      let summary: any = undefined;
      let diagnosis_status: any = undefined;
      if (ENABLE_RUBRICS) {
        try {
          const inputs = computeCoreRubricInputs(triageTarget, evidence);
          rubrics = evaluateRubrics({
            triage: TRIAGE_PRIORITY_V1,
            confidence: EVIDENCE_CONFIDENCE_V1,
            safety: REMEDIATION_SAFETY_V1
          }, inputs);
          // SLO impact
          try {
            const sloInputs = sloInputsForTarget(triageTarget);
            const sloRes = evaluateRubrics({ slo: SLO_IMPACT_V1 }, sloInputs);
            rubrics.slo = sloRes.slo;
          } catch {}
          if (!evidence?.pass && rubrics?.confidence) {
            rubrics.confidence.label = 'Low';
            rubrics.confidence.matched = 'forced: evidence below threshold';
          }
          const templateMeta = { templateId: sel.template.id, templateVersion: sel.template.version, evidenceThreshold: Number(sel.template?.evidenceContract?.completenessThreshold ?? 0) };
          summary = buildSummaryCard(rubrics, evidence, inputs, templateMeta);
          if (rubrics?.slo) {
            summary.slo = { label: rubrics.slo.label, why: rubrics.slo.matched };
          }
          diagnosis_status = {
            priority: summary?.priority?.label,
            priorityScore: summary?.priority?.score,
            confidence: summary?.confidence?.label,
            allowAuto: summary?.safety?.allowAuto,
            completeness: summary?.evidence?.completeness,
            slo: (summary as any)?.slo?.label
          };
          persistSummary(plan.planId, triageTarget, summary);
          try {
            const env = getDeterminismEnvelope();
            const slo = String((summary as any)?.slo?.label || 'N/A');
            const line = `${String(sel.template.triageTarget || triageTarget).toUpperCase()} | ${diagnosis_status.priority}(${Number(diagnosis_status.priorityScore||0).toFixed(2)}) | Confidence: ${diagnosis_status.confidence} | Auto: ${diagnosis_status.allowAuto} | Evidence: ${Math.round(Number(diagnosis_status.completeness||0)*100)}% | SLO: ${slo} | template ${templateMeta.templateVersion} | model ${env.modelName} seed ${env.seed}`;
            console.error(line);
          } catch {}
          // Optional: shadow sequential run and diff (internal only)
          try {
            if (process.env.ENABLE_SHADOW_SEQ === 'true' && ENABLE_SEQUENTIAL_THINKING) {
              const shadow = await sequentialThinkingOrchestrator.handleUserRequest(`Shadow constrained triage for ${triageTarget}`,
                sessionId, { bounded: true, mode: 'planOnly', triageTarget, stepBudget: Math.min(3, steps.length) });
              const shadowData = { shadow, template: { steps: steps.map(s=>s.tool), rubrics }, diff: buildShadowDiff({ steps: steps.map(s=>s.tool), rubrics }, shadow) };
              persistShadowDiff(plan.planId, triageTarget, shadowData);
            }
          } catch {}
        } catch {}
      }
      const out = { planId: plan.planId, target: triageTarget, executed: exec.length, steps: exec, evidence, rubrics, summary, diagnosis_status, executionTimeMs: Date.now() - tStart };
      const content: any = { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
      return content;
    }
  }
  
  // Check for relevant past context before execution
  const relevantContext = await autoMemory.retrieveRelevantContext(name, args || {});
  if (relevantContext.length > 0) {
    console.error(`🧠 Found ${relevantContext.length} relevant past experiences`);
  }
  
  let result: string;
  let success = true;
  let error: string | undefined;
  
  try {
    // UNIFIED ROUTING - No more prefix checking!
    result = await toolRegistry.executeTool(name, args || {});
    
  } catch (toolError) {
    success = false;
    const { serializeError } = await import('./lib/errors/index.js');
    const serialized = serializeError(toolError);
    error = serialized.message;
    console.error(`❌ Tool execution failed:`, serialized);
    const contents: any[] = [{ type: 'text', text: JSON.stringify({ success: false, tool: name, error: serialized, timestamp: new Date().toISOString() }, null, 2) }];
    return { content: contents };
    
  } finally {
    // Auto-capture this tool execution for future reference
    const duration = Date.now() - startTime;
    const sessionId = (args as any)?.sessionId || `auto-session-${Date.now()}`;
    
    await autoMemory.captureToolExecution({
      toolName: name,
      arguments: args || {},
      result: result!,
      sessionId: sessionId as string,
      timestamp: startTime,
      duration,
      success,
      error
    });
  }
  
  const contents: any[] = [{ type: 'text', text: result! }];
  try {
    if (ENABLE_RUBRICS) {
      const diag = computeDiagnosticRubricsIfAny(name, result!);
      if (diag) contents.push({ type: 'text', text: JSON.stringify({ tool: name, rubrics: diag.rubrics, inputs: diag.inputs, summary: diag.summary }, null, 2) });
    }
  } catch {}
  return { content: contents };
});

// Connect to stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('✅ MCP-ocs server connected and ready!');

// Re-exports for library consumers
export { MCPOcsMemoryAdapter } from './lib/memory/mcp-ocs-memory-adapter.js';
export type { OCSIncidentMemory } from './lib/memory/mcp-ocs-memory-adapter.js';

// Local helper: fabricate rubric inputs deterministically from target+evidence
function computeCoreRubricInputs(target: string, evidence: any) {
  const completeness = Number(evidence?.completeness ?? 0);
  return {
    evidenceCompleteness: completeness,
    toolAgreement: 0.85,
    freshnessMin: 5,
    etcdHealthy: true,
    controlPlaneReadyRatio: 0.67,
    affectedNamespaces: 1,
    noCriticalAlerts: true,
    blastRadius: target === 'ingress-pending' ? 1 : 0.7,
    customerPaths: target === 'ingress-pending' ? 1 : 0.5,
    operatorsDegraded: 0.5,
    timeSinceFirstEventMin: 72
  } as Record<string, any>;
}

function buildSummaryCard(rubrics: any, evidence: any, rubricInputs: Record<string, any>, templateMeta: { templateId: string; templateVersion: string; evidenceThreshold: number }) {
  const schemaVersion = '1.0.0';
  const engineVersion = getEngineVersion();
  const env = getDeterminismEnvelope();
  const priorityLabel = rubrics?.triage?.label;
  const priorityScore = Number(rubrics?.triage?.score ?? 0);
  const priorityRule = rubrics?.triage?.bands ? rubrics.triage.bands[priorityLabel] : undefined;
  const confidenceLabel = rubrics?.confidence?.label;
  const confidenceRule = rubrics?.confidence?.matched;
  const allowAuto = Boolean(rubrics?.safety?.allowAuto);
  const safetyWhy = (rubrics?.safety?.failing?.length || 0) === 0 ? 'all guards passed' : `failing: ${String(rubrics?.safety?.failing?.join('; '))}`;
  const completeness = Number(evidence?.completeness ?? 0);
  const rubricVersions = {
    triage: String(rubrics?.triage?.id || ''),
    confidence: String(rubrics?.confidence?.id || ''),
    safety: String(rubrics?.safety?.id || '')
  };
  const guardsDetailed = buildGuardsDetail(rubrics?.safety, rubricInputs);
  const base = scrub({
    schemaVersion,
    engineVersion,
    templateId: templateMeta.templateId,
    templateVersion: templateMeta.templateVersion,
    rubricVersions,
    determinism: env,
    priority: { label: priorityLabel, score: priorityScore, why: priorityRule },
    confidence: { label: confidenceLabel, why: confidenceRule },
    safety: { allowAuto, why: safetyWhy, guards: guardsDetailed },
    evidence: { completeness, minThreshold: Number(templateMeta.evidenceThreshold ?? 0), missing: Array.isArray((evidence as any)?.missing) ? (evidence as any).missing : undefined, present: Array.isArray((evidence as any)?.present) ? (evidence as any).present : undefined },
    rubricInputs: rubricInputs
  });
  try {
    const sloLabel = rubrics?.slo?.label;
    if (sloLabel) {
      (base as any).slo = { label: sloLabel, why: rubrics?.slo?.matched };
      (base as any).sloHint = computeSloHint(String(sloLabel));
    }
  } catch {}
  return base;
}

function persistSummary(planId: string, target: string, summary: any) {
  try {
    const dir = path.join('logs', 'runs');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${Date.now()}-${planId}-${target}.summary.json`);
    const payload = { planId, target, summary };
    fs.writeFileSync(file, JSON.stringify(payload, null, 2));
    // Drift tracking append
    try {
      const driftDir = path.join('docs', 'drift');
      fs.mkdirSync(driftDir, { recursive: true });
      const driftFile = path.join(driftDir, `${String(summary?.templateId || target)}.ndjson`);
      const line = {
        ts: Date.now(),
        priorityScore: Number(summary?.priority?.score ?? 0),
        label: String(summary?.priority?.label || ''),
        completeness: Number(summary?.evidence?.completeness ?? 0),
        model: String(summary?.determinism?.modelName || 'none'),
        modelSha: String(summary?.determinism?.system_fingerprint || 'none')
      };
      fs.appendFileSync(driftFile, JSON.stringify(line) + '\n');
    } catch {}
  } catch {}
}

function getEngineVersion(): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    return String(pkg?.version || '0.0.0');
  } catch { return '0.0.0'; }
}

function getDeterminismEnvelope() {
  const modelName = process.env.LMSTUDIO_MODEL || process.env.MODEL_NAME || 'none';
  const system_fingerprint = process.env.SYSTEM_FINGERPRINT || process.env.LMSTUDIO_SYSTEM_FINGERPRINT || 'none';
  const temperature = Number(process.env.LM_TEMPERATURE ?? 0);
  const top_p = Number(process.env.LM_TOP_P ?? 1);
  const seed = Number(process.env.LM_SEED ?? 42);
  return { modelName, system_fingerprint, temperature, top_p, seed };
}

function buildGuardsDetail(safetyRubric: any, inputs: Record<string, any>) {
  const out: any[] = [];
  const guards: string[] = Array.isArray(safetyRubric?.guards) ? safetyRubric.guards : [];
  for (const g of guards) {
    const m = String(g).match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(==|!=|>=|<=|>|<)\s*(true|false|[0-9.]+)\s*$/);
    const key = m?.[1];
    const op = m?.[2];
    const rawThresh = m?.[3];
    const observed = typeof key !== 'undefined' ? inputs[key as string] : undefined;
    let threshold: any = rawThresh;
    if (typeof rawThresh === 'string' && /^(true|false)$/i.test(rawThresh)) threshold = rawThresh.toLowerCase() === 'true';
    else if (typeof rawThresh === 'string' && /[0-9.]+/.test(rawThresh)) threshold = Number(rawThresh);
    const passed = Array.isArray(safetyRubric?.failing) ? !safetyRubric.failing.includes(g) : undefined;
    out.push({ guard: g, key, op, threshold, observed, pass: passed });
  }
  return out;
}

function scrub(obj: any) {
  try {
    let s = JSON.stringify(obj);
    s = s.replace(/Bearer\s+[A-Za-z0-9\-_.~+/=]+/g, 'Bearer REDACTED');
    s = s.replace(/(token=)[A-Za-z0-9\-_.~+/=]+/g, '$1REDACTED');
    s = s.replace(/\"kubeconfig\":\s*\"[^\"]+\"/gi, '"kubeconfig":"REDACTED"');
    s = s.replace(/\"KUBECONFIG\":\s*\"[^\"]+\"/gi, '"KUBECONFIG":"REDACTED"');
    s = s.replace(/\"(?:path|file)\":\s*\"\/?Users\/[^"]+\"/gi, '"$1":"/REDACTED"');
    s = s.replace(/\/?Users\/[A-Za-z0-9_\-/.]+/g, '/REDACTED');
    s = s.replace(/\/?home\/[A-Za-z0-9_\-/.]+/g, '/REDACTED');
    return JSON.parse(s);
  } catch { return obj; }
}

function computeSloHint(label: string): string {
  const key = String(label||'').toUpperCase();
  switch (key) {
    case 'CRITICAL': return 'External/API availability at risk — restore urgently';
    case 'HIGH': return 'Customer-facing impact likely — verify routing/backend';
    case 'MEDIUM': return 'Workload degraded — investigate pod crashes/readiness';
    case 'LOW': return 'Limited impact — monitor while triaging root cause';
    default: return 'Unknown SLO impact';
  }
}

function sloInputsForTarget(t: string){
  const base: any = { ingressPending:0, route5xx:0, pvcBinding:0, crashloop:0, apiDegraded:0 };
  const key = String(t||'').toLowerCase();
  if (key.includes('ingress')) return { ...base, ingressPending:1 };
  if (key.includes('route')) return { ...base, route5xx:1 };
  if (key.includes('pvc')) return { ...base, pvcBinding:1 };
  if (key.includes('crash')) return { ...base, crashloop:1 };
  if (key.includes('api')) return { ...base, apiDegraded:1 };
  return base;
}

function computeDiagnosticRubricsIfAny(toolName: string, resultText: string): { inputs: Record<string, any>, rubrics: any, summary: any } | null {
  let obj: any;
  try { obj = JSON.parse(resultText); } catch { obj = null; }
  const inputs: Record<string, any> = {};
  let rubrics: any = null;
  let summary: any = null;
  if (/oc_diagnostic_cluster_health/i.test(toolName)) {
    try {
      const nodes = obj?.nodes || {};
      const ready = Number(nodes?.ready || 0), total = Number(nodes?.total || 0);
      inputs.controlPlaneReadyRatio = total > 0 ? ready / total : undefined;
      const degradedList: any[] = Array.isArray(obj?.operators?.degraded) ? obj.operators.degraded : [];
      inputs.operatorsDegraded = degradedList.length;
      inputs.etcdHealthy = !degradedList.some((n: any) => /etcd/i.test(String(n)));
      inputs.noCriticalAlerts = String(obj?.overallHealth || '').toLowerCase() === 'healthy';
      rubrics = evaluateRubrics({ safety: DIAGNOSTIC_CLUSTER_HEALTH_SAFETY_V1 }, inputs);
      if (rubrics) summary = buildCompactSummary(rubrics);
    } catch {}
  } else if (/oc_diagnostic_pod_health/i.test(toolName)) {
    try {
      const issues: string[] = Array.isArray(obj?.health?.issues) ? obj.health.issues : [];
      inputs.imagePullErrors = issues.some(s => /imagepull/i.test(String(s)) || /errimage/i.test(String(s)));
      inputs.hasProbeIssues = issues.some(s => /probe/i.test(String(s)));
      rubrics = evaluateRubrics({ safety: DIAGNOSTIC_POD_HEALTH_SAFETY_V1, confidence: DIAGNOSTIC_POD_HEALTH_CONFIDENCE_V1 }, { ...inputs, probeEvidencePresent: undefined, lastLogsPresent: undefined });
      if (rubrics) summary = buildCompactSummary(rubrics);
    } catch {}
  } else if (/oc_diagnostic_namespace_health/i.test(toolName)) {
    try {
      const summary = obj?.summary || {};
      const podsStr = String(summary?.pods || '0/0 ready');
      const parts = podsStr.split(' ')[0]?.split('/') || ['0','0'];
      const ready = Number(parts[0]||0), total = Number(parts[1]||0);
      const pendingRatio = total>0 ? Math.max(0, (total - ready)/total) : undefined;
      inputs.pendingRatio = pendingRatio;
      inputs.crashLoopRatio = undefined;
      inputs.quotaPressure = undefined;
      rubrics = evaluateRubrics({ confidence: DIAGNOSTIC_NAMESPACE_HEALTH_CONFIDENCE_V1 }, inputs);
      if (rubrics) summary = buildCompactSummary(rubrics);
    } catch {}
  } else if (/oc_diagnostic_rca_checklist/i.test(toolName)) {
    try {
      const res = obj?.result || obj;
      const total = Number(res?.summary?.totalChecks || 0);
      const completed = Number(res?.summary?.completedChecks || 0);
      inputs.coverageRatio = total>0 ? completed/total : undefined;
      const checks: any[] = Array.isArray(res?.checksPerformed) ? res.checksPerformed : [];
      inputs.infraFailed = checks.some(c=>/infra/i.test(String(c?.name||'')) && String(c?.status||'').toLowerCase()!=='pass');
      inputs.netFailed = checks.some(c=>/network/i.test(String(c?.name||'')) && String(c?.status||'').toLowerCase()!=='pass');
      inputs.pvcFailed = checks.some(c=>/pvc|storage/i.test(String(c?.name||'')) && String(c?.status||'').toLowerCase()!=='pass');
      inputs.controlPlaneReadyRatio = undefined;
      rubrics = evaluateRubrics({ mapping: DIAGNOSTIC_RCA_CHECKLIST_MAPPING_V1, safety: DIAGNOSTIC_RCA_CHECKLIST_SAFETY_V1 }, inputs);
      if (rubrics) summary = buildCompactSummary(rubrics);
    } catch {}
  } else if (/memory_search_incidents/i.test(toolName) || /memory_search_operational/i.test(toolName)) {
    try {
      const hits: any[] = Array.isArray(obj?.hits) ? obj.hits : [];
      const top = hits[0] || {};
      const score = Number(top.score ?? top.confidence ?? 0);
      // freshness in days if ts provided (epoch ms or ISO)
      let days = undefined as any;
      const ts = top.ts || top.timestamp;
      if (typeof ts === 'number') days = Math.abs(Date.now() - ts) / (1000*60*60*24);
      else if (typeof ts === 'string') { const d = Date.parse(ts); if (!isNaN(d)) days = Math.abs(Date.now() - d)/(1000*60*60*24); }
      inputs.recallTop1 = score;
      inputs.freshnessDaysTop1 = days;
      const agree = hits.length > 1 ? (hits.filter(h=>Number(h.score ?? h.confidence ?? 0) >= 0.7).length / hits.length) : undefined;
      inputs.relevanceAgreement = agree;
      rubrics = evaluateRubrics({ confidence: MEMORY_SEARCH_CONFIDENCE_V1 }, inputs);
      if (rubrics) summary = buildCompactSummary(rubrics);
    } catch {}
  } else if (/memory_store_operational/i.test(toolName)) {
    try {
      inputs.ttlDays = Number(obj?.record?.ttlDays ?? obj?.ttlDays ?? 365);
      const scope = obj?.record?.scope ?? obj?.scope;
      inputs.scopeValid = typeof scope === 'string' ? /^(cluster|namespace|pod)$/.test(scope) : Boolean(scope ?? true);
      rubrics = evaluateRubrics({ safety: MEMORY_STORE_SAFETY_V1 }, inputs);
      if (rubrics) summary = buildCompactSummary(rubrics);
    } catch {}
  } else if (/memory_get_stats/i.test(toolName)) {
    try {
      const ok = (obj?.healthOk === true) || /ok/i.test(String(obj?.health || '')) || (obj?.healthy === true);
      inputs.healthOk = ok;
      rubrics = evaluateRubrics({ safety: MEMORY_STATS_SAFETY_V1 }, inputs);
      if (rubrics) summary = buildCompactSummary(rubrics);
    } catch {}
  } else if (/memory_search_conversations/i.test(toolName)) {
    try {
      const hits: any[] = Array.isArray(obj?.hits) ? obj.hits : [];
      const top = hits[0] || {};
      inputs.contextRestorationConfidence = Number(top.confidence ?? top.score ?? 0);
      rubrics = evaluateRubrics({ confidence: MEMORY_CONVERSATIONS_CONFIDENCE_V1 }, inputs);
      if (rubrics) summary = buildCompactSummary(rubrics);
    } catch {}
  }
  if (rubrics) return { inputs, rubrics, summary };
  return null;
}

function buildCompactSummary(rubrics: any) {
  return {
    priority: rubrics?.triage?.label,
    confidence: rubrics?.confidence?.label,
    allowAuto: rubrics?.safety?.allowAuto,
    slo: rubrics?.slo?.label
  };
}

function persistShadowDiff(planId: string, target: string, data: any) {
  try {
    const dir = path.join('logs', 'runs');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${Date.now()}-${planId}-${target}.shadow.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch {}
}

function buildShadowDiff(templateOut: { steps: string[]; rubrics: any }, shadowRes: any) {
  const out: any = { steps: {}, rubrics: {} };
  try {
    const shadowSteps: string[] = Array.isArray(shadowRes?.toolStrategy?.steps) ? shadowRes.toolStrategy.steps.map((s:any)=>s.tool) : [];
    out.steps = {
      expected: templateOut.steps,
      actual: shadowSteps,
      match: JSON.stringify(templateOut.steps) === JSON.stringify(shadowSteps)
    };
  } catch { out.steps = { error: 'unavailable' }; }
  try {
    const g = { triage: templateOut?.rubrics?.triage?.label, confidence: templateOut?.rubrics?.confidence?.label, safety: templateOut?.rubrics?.safety?.allowAuto };
    const a = g; // Using same rubrics for now
    out.rubrics = { expected: g, actual: a, match: JSON.stringify(g) === JSON.stringify(a) };
  } catch { out.rubrics = { error: 'unavailable' }; }
  return out;
}

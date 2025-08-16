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
try { await sharedMemory.initialize(); } catch {}

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
const templateRegistry = new TemplateRegistry();
const templateEngine = new TemplateEngine();
await templateRegistry.load().catch(()=>{});
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
  async execute(args: any): Promise<string> {
    const userInput = String(args?.thought ?? args?.userInput ?? '');
    const session = String(args?.sessionId || `session-${Date.now()}`);
    const coerceBool = (v: any) => typeof v === 'string' ? ['true','1','yes','on','false','0','no','off'].includes(v.toLowerCase()) ? ['true','1','yes','on'].includes(v.toLowerCase()) : Boolean(v) : Boolean(v);
    const coerceNum = (v: any, d?: number) => typeof v === 'string' ? (Number(v) || d || 0) : (typeof v === 'number' ? v : (d || 0));
    const bounded = coerceBool(args?.bounded);
    const triageTarget = typeof args?.triageTarget === 'string' ? args.triageTarget : undefined;
    const firstStepOnly = 'firstStepOnly' in (args||{}) ? coerceBool(args?.firstStepOnly) : (bounded ? true : false);
    const nextThoughtNeeded = 'nextThoughtNeeded' in (args||{}) ? coerceBool(args?.nextThoughtNeeded) : true;
    const timeoutMs = coerceNum(args?.timeoutMs ?? process.env.SEQ_TIMEOUT_MS ?? (bounded ? 12000 : 0), bounded ? 12000 : 0);
    const reflectOnly = nextThoughtNeeded === false;
    let mode = typeof args?.mode === 'string' ? args.mode : (firstStepOnly ? 'firstStepOnly' : (bounded ? 'firstStepOnly' : 'planOnly'));
    if (!args?.mode && bounded && triageTarget && triageTarget.toLowerCase().includes('ingress')) {
      mode = 'boundedMultiStep';
    }
    const continuePlan = coerceBool(args?.continuePlan);
    const stepBudget = coerceNum(args?.stepBudget ?? (mode === 'boundedMultiStep' ? 2 : 2), 2);
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
      const stepBudget = Number(targs.stepBudget || 2);
      const bounded = !!targs.bounded;
      const sessionId = String(targs.sessionId || `session-${Date.now()}`);
      const plan = templateEngine.buildPlan(sel.template, { sessionId, bounded, stepBudget, vars: (args as any)?.vars || {} });
      const enforcer = new BoundaryEnforcer({ maxSteps: plan.boundaries.maxSteps, timeoutMs: plan.boundaries.timeoutMs, toolWhitelist: undefined, allowedNamespaces: targs.allowedNamespaces });
      const steps = enforcer.filterSteps(plan.steps);
      const exec: any[] = [];
      for (const s of steps) {
        const r = await toolRegistry.executeTool(s.tool, s.params);
        exec.push({ step: s, result: r });
      }
      const out = { planId: plan.planId, target: triageTarget, executed: exec.length, steps: exec };
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
    error = toolError instanceof Error ? toolError.message : 'Unknown error';
    console.error(`❌ Tool execution failed: ${error}`);
    throw new Error(`Tool execution failed: ${error}`);
    
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
  
  return {
    content: [
      {
        type: 'text',
        text: result!
      }
    ]
  };
});

// Connect to stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('✅ MCP-ocs server connected and ready!');

// Re-exports for library consumers
export { MCPOcsMemoryAdapter } from './lib/memory/mcp-ocs-memory-adapter.js';
export type { OCSIncidentMemory } from './lib/memory/mcp-ocs-memory-adapter.js';

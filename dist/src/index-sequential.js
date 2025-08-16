#!/usr/bin/env node
/**
 * MCP-ocs Entry (Sequential Thinking Parallel)
 *
 * Parallel server entrypoint integrating EnhancedSequentialThinkingOrchestrator
 * without modifying the original src/index.ts
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { DiagnosticToolsV2 } from './tools/diagnostics/index.js';
import { ReadOpsTools } from './tools/read-ops/index.js';
import { StateMgmtTools } from './tools/state-mgmt/index.js';
import { OpenShiftClient } from './lib/openshift-client.js';
import { SharedMemoryManager } from './lib/memory/shared-memory.js';
import { WorkflowEngine } from './lib/workflow/workflow-engine.js';
import { AutoMemorySystem } from './lib/memory/auto-memory-system.js';
import { KnowledgeSeedingSystem } from './lib/memory/knowledge-seeding-system.js';
import { UnifiedToolRegistry } from './lib/tools/tool-registry.js';
import { EnhancedSequentialThinkingOrchestrator } from './lib/tools/sequential-thinking-with-memory.js';
console.error('🚀 Starting MCP-ocs server (sequential) ...');
const ENABLE_SEQUENTIAL_THINKING = process.env.ENABLE_SEQUENTIAL_THINKING === 'true';
// Initialize core components
const openshiftClient = new OpenShiftClient({ ocPath: 'oc', timeout: process.env.OC_TIMEOUT_MS ? Number(process.env.OC_TIMEOUT_MS) : 30000 });
const sharedMemory = new SharedMemoryManager({
    domain: 'mcp-ocs',
    namespace: 'default',
    memoryDir: process.env.SHARED_MEMORY_DIR || './memory',
    enableCompression: true,
    retentionDays: 30,
    chromaHost: process.env.CHROMA_HOST || '127.0.0.1',
    chromaPort: process.env.CHROMA_PORT ? Number(process.env.CHROMA_PORT) : 8000,
});
const workflowEngine = new WorkflowEngine({
    enablePanicDetection: true,
    enforcementLevel: 'guidance',
    memoryManager: sharedMemory,
    minEvidenceThreshold: 2,
});
const autoMemory = new AutoMemorySystem(sharedMemory);
const knowledgeSeedingSystem = new KnowledgeSeedingSystem(sharedMemory, autoMemory);
const toolRegistry = new UnifiedToolRegistry();
const diagnosticTools = new DiagnosticToolsV2(openshiftClient, sharedMemory);
const readOpsTools = new ReadOpsTools(openshiftClient, sharedMemory);
const stateMgmtTools = new StateMgmtTools(sharedMemory, workflowEngine);
toolRegistry.registerSuite(diagnosticTools);
toolRegistry.registerSuite(readOpsTools);
toolRegistry.registerSuite(stateMgmtTools);
let allTools = toolRegistry.getMCPTools();
console.error(`✅ Registered ${allTools.length} tools (sequential server)`);
const stats = toolRegistry.getStats();
console.error('📈 Registry Stats:', JSON.stringify(stats, null, 2));
// Enhanced orchestrator
const sequentialThinkingOrchestrator = new EnhancedSequentialThinkingOrchestrator(toolRegistry, sharedMemory);
// Register explicit orchestrator tool here as well (sequential entry)
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
    async execute(args) {
        const userInput = String(args?.thought ?? args?.userInput ?? '');
        const session = String(args?.sessionId || `session-${Date.now()}`);
        const coerceBool = (v) => typeof v === 'string' ? ['true', '1', 'yes', 'on', 'false', '0', 'no', 'off'].includes(v.toLowerCase()) ? ['true', '1', 'yes', 'on'].includes(v.toLowerCase()) : Boolean(v) : Boolean(v);
        const coerceNum = (v, d) => typeof v === 'string' ? (Number(v) || d || 0) : (typeof v === 'number' ? v : (d || 0));
        const bounded = coerceBool(args?.bounded);
        const firstStepOnly = 'firstStepOnly' in (args || {}) ? coerceBool(args?.firstStepOnly) : (bounded ? true : false);
        const nextThoughtNeeded = 'nextThoughtNeeded' in (args || {}) ? coerceBool(args?.nextThoughtNeeded) : true;
        const timeoutMs = coerceNum(args?.timeoutMs ?? process.env.SEQ_TIMEOUT_MS ?? (bounded ? 12000 : 0), bounded ? 12000 : 0);
        const reflectOnly = nextThoughtNeeded === false;
        const mode = typeof args?.mode === 'string' ? args.mode : (firstStepOnly ? 'firstStepOnly' : (bounded ? 'firstStepOnly' : 'planOnly'));
        const continuePlan = coerceBool(args?.continuePlan);
        const triageTarget = typeof args?.triageTarget === 'string' ? args.triageTarget : undefined;
        const stepBudget = coerceNum(args?.stepBudget, 2);
        const result = await sequentialThinkingOrchestrator.handleUserRequest(userInput, session, { bounded, firstStepOnly, reflectOnly, timeoutMs, nextThoughtNeeded, mode, continuePlan, triageTarget, stepBudget });
        return JSON.stringify(result, null, 2);
    },
    category: 'workflow',
    version: 'v2',
    metadata: { experimental: true, mcpCompatible: true }
});
// Refresh tool list after dynamic registration
allTools = toolRegistry.getMCPTools();
console.error('🔧 Debug - Tool names (sequential):', allTools.map(t => t.name));
// Create MCP server
const server = new Server({ name: 'mcp-ocs', version: '1.0.0' }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => {
    // Always reflect latest
    allTools = toolRegistry.getMCPTools();
    return { tools: allTools.map((tool) => ({ name: tool.name, description: tool.description, inputSchema: tool.inputSchema })) };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const startTime = Date.now();
    console.error(`🔧 (sequential) Executing: ${name}`);
    const relevantContext = await autoMemory.retrieveRelevantContext(name, args || {});
    if (relevantContext.length > 0)
        console.error(`🧠 Found ${relevantContext.length} relevant past experiences`);
    let result = '';
    let success = true;
    let error;
    try {
        const coerceBool = (v) => typeof v === 'string' ? ['true', '1', 'yes', 'on'].includes(v.toLowerCase()) : Boolean(v);
        const isDiagnostic = ['oc_diagnostic_cluster_health', 'oc_diagnostic_namespace_health', 'oc_diagnostic_pod_health', 'oc_diagnostic_rca_checklist'].includes(name);
        const triageIntent = isDiagnostic && (coerceBool(args?.bounded) ||
            typeof args?.namespaceList !== 'undefined' ||
            typeof args?.maxRuntimeMs !== 'undefined');
        if (ENABLE_SEQUENTIAL_THINKING && args?.userInput) {
            const thinking = await sequentialThinkingOrchestrator.handleUserRequest(args.userInput, args.sessionId || `session-${Date.now()}`);
            result = JSON.stringify(thinking, null, 2);
            if (thinking.networkResetDetected)
                console.error('⚠️ Network reset was detected and handled');
        }
        else if (ENABLE_SEQUENTIAL_THINKING && triageIntent && name !== 'sequential_thinking') {
            // Pre-orchestration shim for bounded triage calls that would otherwise bypass planning
            const sessionId = args?.sessionId || `session-${Date.now()}`;
            const list = args?.namespaceList;
            const ns = Array.isArray(list) ? list.join(', ') : (typeof list === 'string' ? list : 'ingress-related namespaces');
            const thought = `Capped triage requested for ${ns}. Use bounded approach with first step only to avoid timeouts. Original tool: ${name}.`;
            const resp = await sequentialThinkingOrchestrator.handleUserRequest(thought, String(sessionId), { bounded: true, firstStepOnly: true });
            result = JSON.stringify(resp, null, 2);
        }
        else {
            result = await toolRegistry.executeTool(name, args || {});
        }
    }
    catch (e) {
        success = false;
        error = e instanceof Error ? e.message : 'Unknown error';
        console.error(`❌ Tool execution failed: ${error}`);
        throw new Error(`Tool execution failed: ${error}`);
    }
    finally {
        const duration = Date.now() - startTime;
        const sessionId = args?.sessionId || `auto-session-${Date.now()}`;
        await autoMemory.captureToolExecution({ toolName: name, arguments: args || {}, result, sessionId, timestamp: startTime, duration, success, error });
    }
    return { content: [{ type: 'text', text: result }] };
});
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('✅ MCP-ocs sequential server connected and ready!');
export { MCPOcsMemoryAdapter } from './lib/memory/mcp-ocs-memory-adapter.js';

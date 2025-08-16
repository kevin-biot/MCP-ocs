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
            nextThoughtNeeded: { type: 'boolean' },
            thoughtNumber: { type: 'integer' },
            totalThoughts: { type: 'integer' },
            isRevision: { type: 'boolean' },
            revisesThought: { type: 'integer' },
            branchFromThought: { type: 'integer' },
            branchId: { type: 'string' },
            needsMoreThoughts: { type: 'boolean' },
            bounded: { type: 'boolean', description: 'Avoid expensive cluster-wide sweeps' },
            firstStepOnly: { type: 'boolean', description: 'Execute only the first planned step' }
        },
        required: ['thought', 'nextThoughtNeeded', 'thoughtNumber', 'totalThoughts'],
        additionalProperties: true
    },
    async execute(args) {
        const userInput = String(args?.thought ?? args?.userInput ?? '');
        const session = String(args?.sessionId || `session-${Date.now()}`);
        const bounded = Boolean(args?.bounded);
        const firstStepOnly = Boolean(args?.firstStepOnly);
        const result = await sequentialThinkingOrchestrator.handleUserRequest(userInput, session, { bounded, firstStepOnly });
        return JSON.stringify(result, null, 2);
    },
    category: 'workflow',
    version: 'v2',
    metadata: { experimental: true, mcpCompatible: true }
});
// Refresh tool list after dynamic registration
allTools = toolRegistry.getMCPTools();
console.error('🔧 Debug - Tool names (sequential):', allTools.map(t => t.name));
// Expose an explicit MCP tool for orchestrated reasoning so LLMs can call it directly
toolRegistry.registerTool({
    name: 'sequential_thinking',
    fullName: 'sequential_thinking',
    description: 'Facilitates detailed, step-by-step thinking for problem-solving: plan → execute → reflect with memory.',
    inputSchema: {
        type: 'object',
        properties: {
            sessionId: { type: 'string', description: 'Conversation/session identifier' },
            thought: { type: 'string' },
            nextThoughtNeeded: { type: 'boolean' },
            thoughtNumber: { type: 'integer' },
            totalThoughts: { type: 'integer' },
            isRevision: { type: 'boolean' },
            revisesThought: { type: 'integer' },
            branchFromThought: { type: 'integer' },
            branchId: { type: 'string' },
            needsMoreThoughts: { type: 'boolean' }
        },
        required: ['thought', 'nextThoughtNeeded', 'thoughtNumber', 'totalThoughts'],
        additionalProperties: true
    },
    async execute(args) {
        const userInput = String(args?.thought ?? args?.userInput ?? '');
        const session = String(args?.sessionId || `session-${Date.now()}`);
        const result = await sequentialThinkingOrchestrator.handleUserRequest(userInput, session);
        return JSON.stringify(result, null, 2);
    },
    category: 'workflow',
    version: 'v2',
    metadata: { experimental: true, mcpCompatible: true }
});
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
        if (ENABLE_SEQUENTIAL_THINKING && args?.userInput) {
            const thinking = await sequentialThinkingOrchestrator.handleUserRequest(args.userInput, args.sessionId || `session-${Date.now()}`);
            result = JSON.stringify(thinking, null, 2);
            if (thinking.networkResetDetected)
                console.error('⚠️ Network reset was detected and handled');
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

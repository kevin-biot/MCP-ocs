# Detailed Sequential Thinking Implementation Plan for MCP-ocs

## Overview
This document provides a comprehensive, step-by-step implementation guide for integrating Sequential Thinking into the MCP-ocs codebase with specific file changes and coding tasks.

## Implementation Strategy

### Phase 1: Core Sequential Thinking Framework (2-3 hours)

#### File: `src/lib/tools/sequential-thinking.ts`
Create a new module to handle the sequential thinking process:

```typescript
/**
 * Sequential Thinking Orchestrator for MCP-ocs
 * 
 * This module provides structured problem-solving for all user requests,
 * ensuring systematic approach to OpenShift diagnostics and operations.
 */

import { UnifiedToolRegistry } from './tool-registry.js';
import { ToolMaturity } from '../../types/tool-maturity.js';

export interface SequentialThinkingContext {
  sessionId: string;
  userInput: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  previousResults?: any[];
  toolRegistry: UnifiedToolRegistry;
}

export interface ToolStrategy {
  steps: ToolStep[];
  estimatedSteps: number;
  rationale: string;
}

export interface ToolStep {
  sequenceNumber: number;
  tool: string;
  parameters: any;
  rationale: string;
  dependencies?: string[];
}

export interface SequentialThinkingResult {
  success: boolean;
  toolStrategy: ToolStrategy;
  reasoningTrace: ThoughtProcess[];
  finalResult?: any;
  error?: string;
}

export interface ThoughtProcess {
  thoughtNumber: number;
  thought: string;
  timestamp: Date;
  nextThoughtNeeded: boolean;
  totalThoughts?: number;
  needsMoreThoughts?: boolean;
}

class SequentialThinkingOrchestrator {
  private toolRegistry: UnifiedToolRegistry;

  constructor(toolRegistry: UnifiedToolRegistry) {
    this.toolRegistry = toolRegistry;
  }

  /**
   * Handle user request with structured sequential thinking
   */
  async handleUserRequest(userInput: string, sessionId: string): Promise<SequentialThinkingResult> {
    const thinkingContext: SequentialThinkingContext = {
      sessionId,
      userInput,
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      toolRegistry: this.toolRegistry
    };

    try {
      // Phase 1: Problem decomposition and analysis
      const problemAnalysis = await this.analyzeProblem(userInput, thinkingContext);
      
      // Phase 2: Tool strategy formulation  
      const toolStrategy = await this.formulateToolStrategy(problemAnalysis, thinkingContext);
      
      // Phase 3: Execute with continuous reflection
      const executionResult = await this.executeWithReflection(toolStrategy, thinkingContext);
      
      return {
        success: true,
        toolStrategy,
        reasoningTrace: [problemAnalysis, ...toolStrategy.steps.map(step => ({
          thoughtNumber: step.sequenceNumber,
          thought: `Executing ${step.tool} with rationale: ${step.rationale}`,
          timestamp: new Date(),
          nextThoughtNeeded: false,
          needsMoreThoughts: false
        }))],
        finalResult: executionResult
      };
      
    } catch (error) {
      return {
        success: false,
        toolStrategy: { steps: [], estimatedSteps: 0, rationale: 'Failed to generate strategy' },
        reasoningTrace: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Analyze initial problem statement
   */
  private async analyzeProblem(userInput: string, context: SequentialThinkingContext): Promise<ThoughtProcess> {
    const thought = `Analyzing user request: "${userInput}". 
                     Available tools: ${this.listAvailableTools(context.toolRegistry)}.
                     Problem complexity assessment: ${this.assessComplexity(userInput)}.
                     Initial approach: ${this.suggestInitialApproach(userInput)}`;
    
    return {
      thoughtNumber: context.thoughtNumber++,
      thought,
      timestamp: new Date(),
      nextThoughtNeeded: true,
      totalThoughts: context.totalThoughts
    };
  }

  /**
   * Formulate tool selection strategy with reasoning
   */
  private async formulateToolStrategy(
    problemAnalysis: ThoughtProcess, 
    context: SequentialThinkingContext
  ): Promise<ToolStrategy> {
    // Determine which tools are most appropriate based on problem analysis
    const availableTools = this.toolRegistry.getAllTools();
    
    // Simple strategy for demonstration - in reality this would be more sophisticated
    const steps: ToolStep[] = [];
    
    // Determine if we need cluster health first (common pattern)
    if (this.isClusterProblem(userInput)) {
      steps.push({
        sequenceNumber: context.thoughtNumber++,
        tool: 'oc_diagnostic_cluster_health',
        parameters: { sessionId: context.sessionId, depth: 'summary' },
        rationale: 'Start with cluster health to understand the overall state before diving into specific diagnostics',
        dependencies: []
      });
    }
    
    // Add namespace health if monitoring issues reported
    if (this.isMonitoringProblem(userInput)) {
      steps.push({
        sequenceNumber: context.thoughtNumber++,
        tool: 'oc_diagnostic_namespace_health',
        parameters: { 
          sessionId: context.sessionId, 
          namespace: 'openshift-monitoring',
          includeIngressTest: true 
        },
        rationale: 'Focus on monitoring namespace specifically as requested',
        dependencies: ['oc_diagnostic_cluster_health']
      });
    }
    
    // Add RCA if it's an incident response scenario
    if (this.isIncidentResponse(userInput)) {
      steps.push({
        sequenceNumber: context.thoughtNumber++,
        tool: 'oc_diagnostic_rca_checklist',
        parameters: { 
          sessionId: context.sessionId,
          outputFormat: 'json'
        },
        rationale: 'Run systematic RCA for incident response',
        dependencies: []
      });
    }
    
    return {
      steps,
      estimatedSteps: steps.length,
      rationale: `Generated tool strategy based on user input: "${context.userInput}". 
                 Identified ${steps.length} appropriate tools for this problem.`
    };
  }

  /**
   * Execute tool sequence with continuous thinking and reflection
   */
  private async executeWithReflection(
    strategy: ToolStrategy, 
    context: SequentialThinkingContext
  ): Promise<any> {
    const results = [];
    
    for (const step of strategy.steps) {
      // Pre-execution thinking
      const preThinking = await this.reflectOnExecution(step, context);
      
      // Execute tool with proper error handling
      let result = null;
      try {
        result = await this.executeToolWithLogging(step.tool, step.parameters);
        
        // Post-execution reflection
        const postThinking = await this.reflectOnResults(result, step, context);
        
        results.push({ 
          step, 
          result, 
          thinking: { pre: preThinking, post: postThinking } 
        });
        
      } catch (error) {
        console.error(`Tool execution failed: ${step.tool}`, error);
        results.push({ 
          step, 
          result: { error: error instanceof Error ? error.message : 'Unknown error' },
          thinking: { pre: preThinking, post: null }
        });
      }
    }
    
    return this.synthesizeResults(results);
  }

  /**
   * Execute a tool with proper logging and error handling
   */
  private async executeToolWithLogging(toolName: string, parameters: any): Promise<any> {
    console.error(`🔧 Executing tool: ${toolName} with parameters:`, JSON.stringify(parameters));
    
    // Use the existing tool registry to execute
    return await this.toolRegistry.executeTool(toolName, parameters);
  }

  /**
   * Reflect on tool execution before
   */
  private async reflectOnExecution(step: ToolStep, context: SequentialThinkingContext): Promise<ThoughtProcess> {
    return {
      thoughtNumber: context.thoughtNumber++,
      thought: `About to execute ${step.tool} with parameters: ${JSON.stringify(step.parameters)}.
                 Rationale: ${step.rationale}`,
      timestamp: new Date(),
      nextThoughtNeeded: true
    };
  }

  /**
   * Reflect on tool execution results
   */
  private async reflectOnResults(result: any, step: ToolStep, context: SequentialThinkingContext): Promise<ThoughtProcess> {
    const resultSummary = typeof result === 'string' ? result.substring(0, 100) : JSON.stringify(result).substring(0, 100);
    
    return {
      thoughtNumber: context.thoughtNumber++,
      thought: `Result from ${step.tool}: ${resultSummary}.
                 Assessment: ${this.assessResult(result)}.
                 Next steps needed: ${this.determineNextSteps(result, step)}`,
      timestamp: new Date(),
      nextThoughtNeeded: false,
      needsMoreThoughts: this.shouldReviseStrategy(result, step)
    };
  }

  /**
   * Determine if more thoughts are needed based on results
   */
  private shouldReviseStrategy(result: any, step: ToolStep): boolean {
    // Simple logic - if result indicates more investigation needed
    const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
    
    return resultStr.includes('error') || 
           resultStr.includes('failing') || 
           resultStr.includes('degraded');
  }

  /**
   * Synthesize results from all steps
   */
  private synthesizeResults(results: any[]): any {
    return {
      overallStatus: results.every(r => r.result && !r.result.error) ? 'success' : 'partial',
      steps: results,
      summary: `Executed ${results.length} tools with structured reasoning`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Helper methods for problem analysis
   */
  private isClusterProblem(input: string): boolean {
    const clusterKeywords = ['cluster', 'overall', 'health', 'status', 'diagnostic'];
    return clusterKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private isMonitoringProblem(input: string): boolean {
    const monitoringKeywords = ['monitoring', 'alert', 'prometheus', 'grafana'];
    return monitoringKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private isIncidentResponse(input: string): boolean {
    const incidentKeywords = ['incident', 'crash', 'error', 'fail', 'problem'];
    return incidentKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private listAvailableTools(toolRegistry: UnifiedToolRegistry): string {
    return toolRegistry.getAllTools()
      .map(tool => tool.name)
      .join(', ');
  }

  private assessComplexity(input: string): string {
    if (input.length > 100) return 'high';
    if (input.length > 50) return 'medium';
    return 'low';
  }

  private suggestInitialApproach(input: string): string {
    if (this.isClusterProblem(input)) return 'cluster_health';
    if (this.isMonitoringProblem(input)) return 'namespace_health(openshift-monitoring)';
    if (this.isIncidentResponse(input)) return 'rca_checklist';
    return 'cluster_health';
  }

  private assessResult(result: any): string {
    const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
    
    if (resultStr.includes('error') || resultStr.includes('fail')) {
      return 'Problem detected - requires further investigation';
    }
    
    if (resultStr.includes('healthy') || resultStr.includes('success')) {
      return 'Positive result - progress made';
    }
    
    return 'Result processed - awaiting next step';
  }

  private determineNextSteps(result: any, currentStep: ToolStep): string {
    const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
    
    if (resultStr.includes('failing') || resultStr.includes('degraded')) {
      return 'Need to investigate specific failing components';
    }
    
    if (currentStep.tool.includes('cluster_health') && 
        (resultStr.includes('openshift-monitoring') || resultStr.includes('monitoring'))) {
      return 'Focus on openshift-monitoring namespace next';
    }
    
    return 'Continue with planned tool sequence';
  }
}

export { SequentialThinkingOrchestrator };
```

### Phase 2: Server Integration Changes

#### File: `src/index.ts` - Update the main server entry point:

```typescript
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
import { SequentialThinkingOrchestrator } from './lib/tools/sequential-thinking.js';

console.error('🚀 Starting MCP-ocs server...');

// Initialize core components
const openshiftClient = new OpenShiftClient({
  ocPath: 'oc',
  timeout: 30000
});

const sharedMemory = new SharedMemoryManager({
  domain: 'mcp-ocs',
  namespace: 'default',
  memoryDir: './memory',
  enableCompression: true,
  retentionDays: 30,
  chromaHost: '127.0.0.1',
  chromaPort: 8000
});

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

// Get all tools for MCP registration
const allTools = toolRegistry.getMCPTools();

console.error(`✅ Registered ${allTools.length} tools from all suites`);

// Print registry statistics
const stats = toolRegistry.getStats();
console.error('📈 Registry Stats:', JSON.stringify(stats, null, 2));
console.error('🔧 Debug - Tool names:', allTools.map(t => t.name));

// Create Sequential Thinking Orchestrator
const sequentialThinkingOrchestrator = new SequentialThinkingOrchestrator(toolRegistry);

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
  return {
    tools: allTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))
  };
});

// Register tools/call handler with sequential thinking integration
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();
  
  console.error(`🔧 Executing tool: ${name}`);
  
  // Check for relevant past context before execution
  const relevantContext = await autoMemory.retrieveRelevantContext(name, args || {});
  if (relevantContext.length > 0) {
    console.error(`🧠 Found ${relevantContext.length} relevant past experiences`);
  }
  
  let result: string;
  let success = true;
  let error: string | undefined;
  
  try {
    // Handle tool calls through sequential thinking for structured approach
    if (args && args.userInput) {
      // If this is a user request that should go through sequential thinking
      const thinkingResult = await sequentialThinkingOrchestrator.handleUserRequest(
        args.userInput, 
        args.sessionId || `session-${Date.now()}`
      );
      
      // Return the sequential thinking result
      result = JSON.stringify(thinkingResult, null, 2);
    } else {
      // Standard tool execution (backward compatibility)
      result = await toolRegistry.executeTool(name, args || {});
    }
    
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
```

### Phase 3: Enhanced Tool Registry Integration

#### File: `src/lib/tools/tool-registry.ts` - Add tool-aware capabilities:

```typescript
// ... existing code ...

/**
 * Get tools by maturity (using fullName metadata)
 */
getToolsByMaturity(maturities: ToolMaturity[]): StandardTool[] {
  return this.getAllTools().filter(tool => {
    const m = tool.metadata?.maturity ?? ToolMaturity.DEVELOPMENT;
    return maturities.includes(m);
  });
}

/**
 * Get all tool names for sequential thinking awareness
 */
getAllToolNames(): string[] {
  return Array.from(this.tools.keys());
}

/**
 * Get tool capabilities for reasoning purposes
 */
getToolCapabilities(toolName: string): { type: string; level: string; riskLevel: string }[] {
  const tool = this.tools.get(toolName);
  if (!tool || !tool.metadata?.maturity) {
    return [];
  }
  
  // Return capabilities based on tool metadata
  const capabilities = tool.metadata.maturity === ToolMaturity.PRODUCTION ? 
    [{ type: 'diagnostic', level: 'advanced', riskLevel: 'safe' }] :
    [{ type: 'diagnostic', level: 'basic', riskLevel: 'safe' }];
  
  return capabilities;
}

// ... existing code ...
```

### Phase 4: Enhanced Tool Definitions

#### File: `src/tools/diagnostics/index.ts` - Update to support tool-aware sequential thinking:

```typescript
// ... existing code ...

/**
 * Enhanced cluster health check with v2 capabilities
 */
private async enhancedClusterHealth(args: {
  sessionId: string;
  includeNamespaceAnalysis?: boolean;
  maxNamespacesToAnalyze?: number;
  namespaceScope?: 'all' | 'system' | 'user';
  focusNamespace?: string;
  focusStrategy?: 'auto' | 'events' | 'resourcePressure' | 'none';
  depth?: 'summary' | 'detailed';
}): Promise<string> {
  const startTime = Date.now();
  const { sessionId, includeNamespaceAnalysis = false, maxNamespacesToAnalyze = 10 } = args;
  const namespaceScope = args.namespaceScope || 'all';
  const focusNamespace = args.focusNamespace;
  const focusStrategy = args.focusStrategy || 'auto';
  const depth = args.depth || 'summary';

  try {
    // Get cluster info using both v1 and v2 capabilities
    const clusterInfo = await this.openshiftClient.getClusterInfo();
    
    // Enhanced analysis using v2 wrapper
    const nodeHealth = await this.analyzeNodeHealth();
    const operatorHealth = await this.analyzeOperatorHealth();
    const systemNamespaceHealth = await this.analyzeSystemNamespaces();
    
    // Namespace analysis with prioritization
    let namespaceAnalysis: any = null;
    let prioritization: any = null;
    if (includeNamespaceAnalysis) {
      const analysis = await this.prioritizeNamespaces({
        scope: namespaceScope,
        focusNamespace,
        focusStrategy,
        maxDetailed: maxNamespacesToAnalyze,
        depth
      });
      prioritization = analysis.prioritized;
      namespaceAnalysis = analysis.output;
    }

    // Generate comprehensive report
    const healthSummary = {
      cluster: {
        status: clusterInfo.status,
        version: clusterInfo.version,
        currentUser: clusterInfo.currentUser,
        serverUrl: clusterInfo.serverUrl,
        timestamp: new Date().toISOString()
      },
      nodes: nodeHealth,
      operators: operatorHealth,
      systemNamespaces: systemNamespaceHealth,
      userNamespaces: namespaceAnalysis,
      namespacePrioritization: prioritization,
      overallHealth: this.calculateOverallHealth(nodeHealth, operatorHealth, systemNamespaceHealth),
      duration: `${Date.now() - startTime}ms`,
      recommendations: this.generateClusterRecommendations(nodeHealth, operatorHealth, systemNamespaceHealth)
    };

    // Store diagnostic results via adapter-backed gateway (Chroma v2 aware)
    await this.memoryGateway.storeToolExecution(
      'oc_diagnostic_cluster_health',
      { includeNamespaceAnalysis, maxNamespacesToAnalyze },
      healthSummary,
      sessionId,
      ['diagnostic', 'cluster_health', String(healthSummary.overallHealth)],
      'openshift',
      'prod',
      healthSummary.overallHealth === 'healthy' ? 'low' : 'medium'
    );

    return this.formatClusterHealthResponse(healthSummary, sessionId);

  } catch (error) {
    return this.formatErrorResponse('cluster health check', error, sessionId);
  }
}

// ... existing code ...

/**
 * Enhanced namespace health using v2 implementation
 */
private async enhancedNamespaceHealth(args: {
  sessionId: string;
  namespace: string;
  includeIngressTest?: boolean;
  deepAnalysis?: boolean;
}): Promise<string> {
  const { sessionId, namespace, includeIngressTest = false, deepAnalysis = false } = args;

  try {
    // Use v2 namespace health checker
    const healthResult = await this.namespaceHealthChecker.checkHealth({
      namespace,
      includeIngressTest,
      maxLogLinesPerPod: deepAnalysis ? 50 : 0
    });

    // Enhanced analysis if requested
    let deepAnalysisResults = null;
    if (deepAnalysis) {
      deepAnalysisResults = await this.performDeepNamespaceAnalysis(namespace);
    }

    // Format response with v2 enhancements
    const response = {
      tool: 'oc_diagnostic_namespace_health',
      sessionId,
      namespace: healthResult.namespace,
      status: healthResult.status,
      timestamp: healthResult.timestamp,
      duration: `${healthResult.duration}ms`,
      
      summary: {
        pods: `${healthResult.checks.pods.ready}/${healthResult.checks.pods.total} ready`,
        pvcs: `${healthResult.checks.pvcs.bound}/${healthResult.checks.pvcs.total} bound`,
        routes: `${healthResult.checks.routes.total} configured`,
        criticalEvents: healthResult.checks.events.length
      },
      
      issues: {
        crashLoopPods: healthResult.checks.pods.crashloops,
        imagePullErrors: healthResult.checks.pods.imagePullErrors,
        pendingPods: healthResult.checks.pods.pending,
        oomKilledPods: healthResult.checks.pods.oomKilled,
        pvcErrors: healthResult.checks.pvcs.errors,
        recentEvents: healthResult.checks.events.slice(0, 5)
      },
      
      suspicions: healthResult.suspicions,
      human: healthResult.human,
      
      deepAnalysis: deepAnalysisResults,
      
      nextActions: this.generateNamespaceNextActions(healthResult),
      
      // Integration with existing memory system
      memoryStored: true
    };

    // Normalize for schema compatibility
    const normalized = this.normalizeNamespaceHealthOutput(response);

    // Store in operational memory
    await this.memoryManager.storeOperational({
      incidentId: `namespace-health-${sessionId}`,
      domain: 'cluster',
      timestamp: Date.now(),
      symptoms: healthResult.suspicions.length > 0 ? healthResult.suspicions : ['namespace_healthy'],
      affectedResources: [`namespace/${namespace}`],
      diagnosticSteps: ['Enhanced namespace health check completed'],
      tags: ['namespace_health', 'diagnostic', namespace, healthResult.status],
      environment: 'prod'
    });

    return JSON.stringify(normalized, null, 2);

  } catch (error) {
    return this.formatErrorResponse('namespace health check', error, sessionId);
  }
}

// ... existing code ...
```

### Phase 5: Configuration Updates

#### File: `package.json` - Add any necessary dependencies:

```json
{
  // ... existing content ...
  "dependencies": {
    "@chroma-core/default-embed": "^0.1.8",
    "@kubernetes/client-node": "^0.21.0",
    "@modelcontextprotocol/sdk": "^1.12.3",
    "chromadb": "^3.0.10",
    "express": "^4.18.0",
    "js-yaml": "^4.1.0",
    "mcp-shared-memory": "file:../MCP-router/src/memory",
    "sqlite3": "^5.1.6",
    "zod": "^3.22.0"
  },
  // ... existing content ...
}
```

## Testing Strategy

### Unit Tests for Sequential Thinking Module:

```typescript
// tests/unit/tools/sequential-thinking.spec.ts

import { SequentialThinkingOrchestrator } from '../../../src/lib/tools/sequential-thinking.js';
import { UnifiedToolRegistry } from '../../../src/lib/tools/tool-registry.js';

describe('SequentialThinkingOrchestrator', () => {
  let mockRegistry: jest.Mocked<UnifiedToolRegistry>;
  let orchestrator: SequentialThinkingOrchestrator;

  beforeEach(() => {
    mockRegistry = {
      getAllTools: jest.fn(),
      executeTool: jest.fn(),
      getMCPTools: jest.fn()
    } as any;
    
    orchestrator = new SequentialThinkingOrchestrator(mockRegistry);
  });

  it('should analyze user input and generate problem analysis', async () => {
    const result = await orchestrator.handleUserRequest('check cluster health', 'test-session');
    
    expect(result.success).toBe(true);
    expect(result.toolStrategy.steps.length).toBeGreaterThan(0);
  });

  it('should handle monitoring related requests', async () => {
    const result = await orchestrator.handleUserRequest('monitoring stack issues', 'test-session');
    
    expect(result.success).toBe(true);
    // Should include namespace health for monitoring problems
  });
});
```

## Implementation Timeline and Resource Requirements

### Hour-by-Hour Breakdown:

**Hours 1-2: Core Framework Implementation**
- Create `src/lib/tools/sequential-thinking.ts` 
- Implement the SequentialThinkingOrchestrator class
- Set up basic tool selection logic

**Hours 2-3: Server Integration**
- Modify `src/index.ts` to integrate with the new sequential thinking framework
- Update MCP server request handling logic
- Add backward compatibility for existing tool usage

**Hours 3-4: Tool Integration and Enhancement**
- Enhance `src/lib/tools/tool-registry.ts` with tool-aware capabilities
- Update `src/tools/diagnostics/index.ts` to support the new thinking patterns
- Add proper error handling and logging throughout

**Hours 4-5: Testing and Refinement**
- Write unit tests for the new sequential thinking logic
- Create integration tests to verify end-to-end functionality
- Perform performance testing to ensure no degradation

## Risk Mitigation Strategies

1. **Backward Compatibility**: All existing tool execution patterns remain unchanged
2. **Gradual Rollout**: The sequential thinking can be enabled selectively for new requests
3. **Comprehensive Testing**: Unit and integration tests ensure stability
4. **Performance Monitoring**: Implementation will be monitored for any performance impact

## Success Indicators

1. **User Experience Improvements**: More structured, thoughtful responses to user queries
2. **Audit Trail Quality**: Complete reasoning traces for every interaction  
3. **Tool Execution Efficiency**: No degradation in tool performance
4. **Learning Capability**: Memory system showing improved pattern recognition over time

This implementation plan provides a clear, structured approach to integrating sequential thinking into MCP-ocs while maintaining full backward compatibility and leveraging the existing codebase architecture effectively.
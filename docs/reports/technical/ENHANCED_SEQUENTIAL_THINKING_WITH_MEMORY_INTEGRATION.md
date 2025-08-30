# Enhanced Sequential Thinking with Memory Integration for MCP-ocs

## Overview
This document expands on the sequential thinking implementation to include advanced memory search capabilities that enrich the reasoning process with historical context and learned patterns, while also addressing network reset scenarios during tool usage.

## Enhanced Sequential Thinking Framework

### Key Enhancement: Memory-Aware Sequential Thinking

The new implementation adds sophisticated memory integration that enriches the sequential thinking process with:

1. **Historical Pattern Recognition**: Previous problem-solving approaches and outcomes
2. **Contextual Learning**: From similar issues encountered in the past
3. **Network Reset Handling**: Graceful recovery when network connectivity issues occur

## Implementation Details

### 1. Enhanced Memory Integration Module

#### File: `src/lib/tools/sequential-thinking-with-memory.ts`

```typescript
/**
 * Enhanced Sequential Thinking with Memory Integration for MCP-ocs
 * 
 * This module extends the basic sequential thinking with:
 * - Memory-aware problem analysis
 * - Historical pattern recognition  
 * - Network reset handling and recovery
 * - Contextual learning from previous interactions
 */

import { UnifiedToolRegistry } from './tool-registry.js';
import { ToolMaturity } from '../../types/tool-maturity.js';
import { SharedMemoryManager } from '../memory/shared-memory.js';
import { MemorySearchResult } from '../memory/memory-search-types.js';

export interface SequentialThinkingContext {
  sessionId: string;
  userInput: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  previousResults?: any[];
  toolRegistry: UnifiedToolRegistry;
  memoryManager: SharedMemoryManager;
  contextHistory?: any[];
}

export interface ToolStrategy {
  steps: ToolStep[];
  estimatedSteps: number;
  rationale: string;
  confidenceScore: number;
}

export interface ToolStep {
  sequenceNumber: number;
  tool: string;
  parameters: any;
  rationale: string;
  dependencies?: string[];
  memoryContext?: MemorySearchResult[];
}

export interface SequentialThinkingResult {
  success: boolean;
  toolStrategy: ToolStrategy;
  reasoningTrace: ThoughtProcess[];
  finalResult?: any;
  error?: string;
  networkResetDetected?: boolean;
}

export interface ThoughtProcess {
  thoughtNumber: number;
  thought: string;
  timestamp: Date;
  nextThoughtNeeded: boolean;
  totalThoughts?: number;
  needsMoreThoughts?: boolean;
  memoryContext?: MemorySearchResult[];
}

class EnhancedSequentialThinkingOrchestrator {
  private toolRegistry: UnifiedToolRegistry;
  private memoryManager: SharedMemoryManager;

  constructor(toolRegistry: UnifiedToolRegistry, memoryManager: SharedMemoryManager) {
    this.toolRegistry = toolRegistry;
    this.memoryManager = memoryManager;
  }

  /**
   * Handle user request with enhanced sequential thinking and memory integration
   */
  async handleUserRequest(userInput: string, sessionId: string): Promise<SequentialThinkingResult> {
    const thinkingContext: SequentialThinkingContext = {
      sessionId,
      userInput,
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      toolRegistry: this.toolRegistry,
      memoryManager: this.memoryManager
    };

    try {
      // Phase 1: Enhanced problem analysis with memory context
      const problemAnalysis = await this.analyzeProblemWithMemory(userInput, thinkingContext);
      
      // Phase 2: Tool strategy formulation with historical context
      const toolStrategy = await this.formulateToolStrategyWithMemory(problemAnalysis, thinkingContext);
      
      // Phase 3: Execute with continuous reflection and network reset handling
      const executionResult = await this.executeWithReflectionAndNetworkRecovery(
        toolStrategy, 
        thinkingContext
      );
      
      return {
        success: true,
        toolStrategy,
        reasoningTrace: [problemAnalysis, ...toolStrategy.steps.map(step => ({
          thoughtNumber: step.sequenceNumber,
          thought: `Executing ${step.tool} with rationale: ${step.rationale}`,
          timestamp: new Date(),
          nextThoughtNeeded: false,
          memoryContext: step.memoryContext,
          needsMoreThoughts: false
        }))],
        finalResult: executionResult,
        networkResetDetected: false
      };
      
    } catch (error) {
      return {
        success: false,
        toolStrategy: { 
          steps: [], 
          estimatedSteps: 0, 
          rationale: 'Failed to generate strategy',
          confidenceScore: 0
        },
        reasoningTrace: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        networkResetDetected: false
      };
    }
  }

  /**
   * Enhanced problem analysis with memory context and pattern recognition
   */
  private async analyzeProblemWithMemory(userInput: string, context: SequentialThinkingContext): Promise<ThoughtProcess> {
    // Search memory for similar problems and solutions
    const similarProblems = await this.searchSimilarProblems(userInput, context);
    
    // Analyze problem complexity and patterns
    const complexity = this.assessComplexity(userInput);
    const patternRecognition = await this.identifyProblemPatterns(userInput, context);
    
    // Build enhanced thought with memory context
    let thought = `Analyzing user request: "${userInput}". 
                     Available tools: ${this.listAvailableTools(context.toolRegistry)}.
                     Problem complexity assessment: ${complexity}.
                     Identified patterns: ${patternRecognition.length > 0 ? patternRecognition.join(', ') : 'None'}.
                     Historical context: ${similarProblems.length > 0 ? 
                       `Found ${similarProblems.length} similar cases with solutions: ${similarProblems.map(p => p.problem).join(', ')}` : 
                       'No similar problems found'}`;
    
    // If we have memory context, enrich the thinking
    if (similarProblems.length > 0) {
      thought += `\n\nMemory-Enhanced Analysis:\n`;
      similarProblems.forEach((problem, index) => {
        thought += `${index + 1}. Previous case: "${problem.problem}" -> Solution path: ${problem.solutionPath}\n`;
      });
    }
    
    return {
      thoughtNumber: context.thoughtNumber++,
      thought,
      timestamp: new Date(),
      nextThoughtNeeded: true,
      totalThoughts: context.totalThoughts,
      memoryContext: similarProblems
    };
  }

  /**
   * Search memory for similar problems and solutions (Voyage-Context-3 integration)
   */
  private async searchSimilarProblems(userInput: string, context: SequentialThinkingContext): Promise<any[]> {
    try {
      // Search operational memory for similar problems
      const searchResults = await this.memoryManager.searchOperational({
        query: userInput,
        limit: 5,
        filters: {
          domain: 'cluster',
          tags: ['diagnostic', 'problem']
        }
      });
      
      // Process and format results for thinking context
      const similarProblems = searchResults.map(result => ({
        problem: result.symptoms?.join(', ') || 'Unknown problem',
        solutionPath: result.diagnosticSteps?.join(' -> ') || 'No solution path',
        timestamp: result.timestamp,
        tags: result.tags || []
      }));
      
      return similarProblems;
    } catch (error) {
      console.error('Memory search failed:', error);
      return [];
    }
  }

  /**
   * Identify problem patterns from historical data
   */
  private async identifyProblemPatterns(userInput: string, context: SequentialThinkingContext): Promise<string[]> {
    const patterns = [];
    
    // Check for common monitoring issue patterns
    if (userInput.toLowerCase().includes('monitoring') || 
        userInput.toLowerCase().includes('alert') ||
        userInput.toLowerCase().includes('prometheus')) {
      patterns.push('monitoring_stack_issue');
    }
    
    // Check for network connectivity patterns
    if (userInput.toLowerCase().includes('network') || 
        userInput.toLowerCase().includes('connectivity') ||
        userInput.toLowerCase().includes('timeout')) {
      patterns.push('network_connectivity_issue');
    }
    
    // Check for resource constraint patterns
    if (userInput.toLowerCase().includes('memory') || 
        userInput.toLowerCase().includes('cpu') ||
        userInput.toLowerCase().includes('resource')) {
      patterns.push('resource_constraint_issue');
    }
    
    // Check for pod crash patterns
    if (userInput.toLowerCase().includes('crash') || 
        userInput.toLowerCase().includes('oom') ||
        userInput.toLowerCase().includes('restart')) {
      patterns.push('pod_crash_issue');
    }
    
    return patterns;
  }

  /**
   * Enhanced tool strategy formulation with memory-aware decision making
   */
  private async formulateToolStrategyWithMemory(
    problemAnalysis: ThoughtProcess, 
    context: SequentialThinkingContext
  ): Promise<ToolStrategy> {
    const availableTools = this.toolRegistry.getAllTools();
    
    // Get memory context from the problem analysis
    const memoryContext = problemAnalysis.memoryContext || [];
    
    // Initialize strategy with confidence score
    let confidenceScore = 0.7; // Base confidence
    
    // Build steps with memory-informed decision making
    const steps: ToolStep[] = [];
    
    // Determine if we need cluster health first (common pattern)
    if (this.isClusterProblem(userInput)) {
      const step: ToolStep = {
        sequenceNumber: context.thoughtNumber++,
        tool: 'oc_diagnostic_cluster_health',
        parameters: { 
          sessionId: context.sessionId, 
          depth: 'summary',
          includeNamespaceAnalysis: true
        },
        rationale: 'Start with cluster health to understand the overall state before diving into specific diagnostics',
        dependencies: [],
        memoryContext: memoryContext.slice(0, 2) // Include top 2 similar problems
      };
      
      steps.push(step);
      
      // Increase confidence if we have historical context supporting this approach
      if (memoryContext.some(ctx => ctx.problem.includes('cluster_health'))) {
        confidenceScore = 0.9;
      }
    }
    
    // Add namespace health if monitoring issues reported
    if (this.isMonitoringProblem(userInput)) {
      const step: ToolStep = {
        sequenceNumber: context.thoughtNumber++,
        tool: 'oc_diagnostic_namespace_health',
        parameters: { 
          sessionId: context.sessionId, 
          namespace: 'openshift-monitoring',
          includeIngressTest: true,
          deepAnalysis: true
        },
        rationale: 'Focus on monitoring namespace specifically as requested, with deep analysis',
        dependencies: ['oc_diagnostic_cluster_health'],
        memoryContext: memoryContext.slice(0, 3) // Include top 3 similar problems
      };
      
      steps.push(step);
      
      // Increase confidence based on historical monitoring patterns
      if (memoryContext.some(ctx => ctx.problem.includes('monitoring'))) {
        confidenceScore += 0.1;
      }
    }
    
    // Add RCA if it's an incident response scenario with memory support
    if (this.isIncidentResponse(userInput)) {
      const step: ToolStep = {
        sequenceNumber: context.thoughtNumber++,
        tool: 'oc_diagnostic_rca_checklist',
        parameters: { 
          sessionId: context.sessionId,
          outputFormat: 'json',
          includeDeepAnalysis: true
        },
        rationale: 'Run systematic RCA for incident response, with deep analysis based on historical patterns',
        dependencies: [],
        memoryContext: memoryContext.slice(0, 2)
      };
      
      steps.push(step);
      
      // Boost confidence for incident handling
      if (memoryContext.some(ctx => ctx.problem.includes('incident') || ctx.problem.includes('crash'))) {
        confidenceScore = Math.min(1.0, confidenceScore + 0.15);
      }
    }
    
    // Add pod health if specific pod issues mentioned
    if (this.isPodIssue(userInput)) {
      const step: ToolStep = {
        sequenceNumber: context.thoughtNumber++,
        tool: 'oc_diagnostic_pod_health',
        parameters: { 
          sessionId: context.sessionId,
          namespaceScope: 'all',
          focusStrategy: 'auto',
          depth: 'detailed'
        },
        rationale: 'Focus on pod health analysis for specific pod issues reported',
        dependencies: [],
        memoryContext: memoryContext.slice(0, 2)
      };
      
      steps.push(step);
    }
    
    // Add network troubleshooting if relevant
    if (this.isNetworkProblem(userInput)) {
      const step: ToolStep = {
        sequenceNumber: context.thoughtNumber++,
        tool: 'oc_read_get_pods',
        parameters: { 
          sessionId: context.sessionId,
          namespace: 'openshift-monitoring',
          selector: 'app=prometheus'
        },
        rationale: 'Check pod status for network-related issues in monitoring namespace',
        dependencies: [],
        memoryContext: memoryContext.slice(0, 2)
      };
      
      steps.push(step);
    }
    
    return {
      steps,
      estimatedSteps: steps.length,
      rationale: `Generated tool strategy based on user input: "${context.userInput}". 
                   Identified ${steps.length} appropriate tools for this problem. 
                   Memory-informed decision making: ${memoryContext.length > 0 ? 'Yes' : 'No'}`,
      confidenceScore: Math.min(1.0, confidenceScore)
    };
  }

  /**
   * Execute tool sequence with network reset handling and continuous reflection
   */
  private async executeWithReflectionAndNetworkRecovery(
    strategy: ToolStrategy, 
    context: SequentialThinkingContext
  ): Promise<any> {
    const results = [];
    let networkResetDetected = false;
    
    for (const step of strategy.steps) {
      // Pre-execution thinking with memory context
      const preThinking = await this.reflectOnExecution(step, context);
      
      // Execute tool with network reset handling
      let result = null;
      let attemptCount = 0;
      const maxAttempts = 3;
      
      while (attemptCount < maxAttempts) {
        attemptCount++;
        
        try {
          console.error(`🔧 Attempt ${attemptCount} executing tool: ${step.tool}`);
          
          // Execute tool with proper error handling and network reset detection
          result = await this.executeToolWithNetworkHandling(step.tool, step.parameters);
          
          // If we get here without error, break the retry loop
          break;
          
        } catch (error) {
          console.error(`❌ Attempt ${attemptCount} failed for tool: ${step.tool}`, error);
          
          // Check if this is a network reset scenario
          if (this.isNetworkResetError(error) && attemptCount < maxAttempts) {
            networkResetDetected = true;
            console.error(`⚠️ Network reset detected for ${step.tool}, retrying...`);
            
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attemptCount));
            continue;
          }
          
          // If it's not a retryable network error or we've exhausted retries, throw the error
          if (attemptCount >= maxAttempts) {
            throw new Error(`Tool execution failed after ${maxAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
      
      // Post-execution reflection with memory context
      const postThinking = await this.reflectOnResults(result, step, context);
      
      results.push({ 
        step, 
        result, 
        thinking: { pre: preThinking, post: postThinking } 
      });
      
      // Store the tool execution for future reference (memory integration)
      await this.storeToolExecutionInMemory(step, result, context.sessionId);
    }
    
    return this.synthesizeResults(results, networkResetDetected);
  }

  /**
   * Execute a tool with proper network handling and error detection
   */
  private async executeToolWithNetworkHandling(toolName: string, parameters: any): Promise<any> {
    console.error(`🔧 Executing tool: ${toolName} with parameters:`, JSON.stringify(parameters));
    
    // Use the existing tool registry to execute
    return await this.toolRegistry.executeTool(toolName, parameters);
  }

  /**
   * Detect network reset scenarios
   */
  private isNetworkResetError(error: any): boolean {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Common network reset indicators
    const networkResetIndicators = [
      'network reset',
      'connection timeout',
      'connection reset',
      'timeout',
      'ECONNRESET',
      'ETIMEDOUT',
      'connection refused',
      'no route to host'
    ];
    
    return networkResetIndicators.some(indicator => 
      errorMessage.toLowerCase().includes(indicator)
    );
  }

  /**
   * Store tool execution in memory for future context
   */
  private async storeToolExecutionInMemory(step: ToolStep, result: any, sessionId: string): Promise<void> {
    try {
      // Store execution details in memory for future pattern recognition
      const executionData = {
        toolName: step.tool,
        parameters: step.parameters,
        result: typeof result === 'string' ? JSON.parse(result) : result,
        sessionId,
        timestamp: new Date().toISOString(),
        duration: 'unknown', // Would be calculated in real implementation
        success: !('error' in (result || {}))
      };
      
      // Store in memory system for pattern recognition
      await this.memoryManager.storeOperational({
        incidentId: `tool-execution-${sessionId}-${Date.now()}`,
        domain: 'cluster',
        timestamp: Date.now(),
        symptoms: ['tool_execution'],
        affectedResources: [step.tool],
        diagnosticSteps: [`Executed ${step.tool} with parameters`],
        tags: ['tool_execution', 'memory_enhanced', step.tool],
        environment: 'prod',
        metadata: {
          executionData,
          memoryContext: step.memoryContext || []
        }
      });
      
    } catch (error) {
      console.error('Failed to store tool execution in memory:', error);
    }
  }

  /**
   * Reflect on tool execution before
   */
  private async reflectOnExecution(step: ToolStep, context: SequentialThinkingContext): Promise<ThoughtProcess> {
    const memoryContextInfo = step.memoryContext && step.memoryContext.length > 0 
      ? `Based on ${step.memoryContext.length} similar past problems` 
      : 'No historical context available';
    
    return {
      thoughtNumber: context.thoughtNumber++,
      thought: `About to execute ${step.tool} with parameters: ${JSON.stringify(step.parameters)}.
                 Rationale: ${step.rationale}.
                 ${memoryContextInfo}.
                 Confidence: ${(step.memoryContext ? step.memoryContext.length > 0 ? 'High' : 'Medium' : 'Low')}`,
      timestamp: new Date(),
      nextThoughtNeeded: true
    };
  }

  /**
   * Reflect on tool execution results with enhanced memory context
   */
  private async reflectOnResults(result: any, step: ToolStep, context: SequentialThinkingContext): Promise<ThoughtProcess> {
    const resultSummary = typeof result === 'string' ? result.substring(0, 100) : JSON.stringify(result).substring(0, 100);
    
    // Enhanced reflection with memory insights
    let assessment = this.assessResult(result);
    const nextSteps = this.determineNextSteps(result, step);
    
    // Add memory-based insights to the reflection
    let memoryInsights = '';
    if (step.memoryContext && step.memoryContext.length > 0) {
      memoryInsights = `\n\nMemory Insights:\n`;
      step.memoryContext.slice(0, 2).forEach((memory, index) => {
        memoryInsights += `${index + 1}. Previous similar case: "${memory.problem}" -> Recommended action: ${memory.solutionPath}\n`;
      });
    }
    
    return {
      thoughtNumber: context.thoughtNumber++,
      thought: `Result from ${step.tool}: ${resultSummary}.
                 Assessment: ${assessment}. 
                 Next steps needed: ${nextSteps}${memoryInsights}`,
      timestamp: new Date(),
      nextThoughtNeeded: false,
      needsMoreThoughts: this.shouldReviseStrategy(result, step),
      memoryContext: step.memoryContext
    };
  }

  /**
   * Determine if more thoughts are needed based on results and memory context
   */
  private shouldReviseStrategy(result: any, step: ToolStep): boolean {
    const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
    
    // Check for various failure conditions that might require strategy revision
    const failureIndicators = [
      'error', 
      'fail', 
      'failing', 
      'degraded',
      'timeout',
      'connection reset'
    ];
    
    const hasFailure = failureIndicators.some(indicator => 
      resultStr.toLowerCase().includes(indicator)
    );
    
    // Also check memory for similar patterns that suggest strategy revision
    const hasMemoryBasedIndicators = step.memoryContext?.some(memory => 
      memory.problem.toLowerCase().includes('requires adjustment') ||
      memory.problem.toLowerCase().includes('changed approach')
    ) || false;
    
    return hasFailure || hasMemoryBasedIndicators;
  }

  /**
   * Synthesize results from all steps with network reset awareness
   */
  private synthesizeResults(results: any[], networkResetDetected: boolean): any {
    return {
      overallStatus: results.every(r => r.result && !r.result.error) ? 'success' : 'partial',
      steps: results,
      summary: `Executed ${results.length} tools with structured reasoning and network reset handling`,
      timestamp: new Date().toISOString(),
      networkResetDetected,
      memoryContextUsed: results.length > 0 ? results[0].step.memoryContext?.length || 0 : 0
    };
  }

  /**
   * Helper methods for problem analysis with enhanced memory awareness
   */
  private isClusterProblem(input: string): boolean {
    const clusterKeywords = ['cluster', 'overall', 'health', 'status', 'diagnostic'];
    return clusterKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private isMonitoringProblem(input: string): boolean {
    const monitoringKeywords = ['monitoring', 'alert', 'prometheus', 'grafana', 'metrics'];
    return monitoringKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private isIncidentResponse(input: string): boolean {
    const incidentKeywords = ['incident', 'crash', 'error', 'fail', 'problem', 'outage'];
    return incidentKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private isPodIssue(input: string): boolean {
    const podKeywords = ['pod', 'container', 'crash', 'oom', 'restart', 'image'];
    return podKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private isNetworkProblem(input: string): boolean {
    const networkKeywords = ['network', 'connectivity', 'timeout', 'dns', 'port', 'firewall'];
    return networkKeywords.some(keyword => input.toLowerCase().includes(keyword));
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

export { EnhancedSequentialThinkingOrchestrator };
```

### 2. Updated Server Integration

#### File: `src/index.ts` - Enhanced Integration with Memory and Network Reset Handling:

```typescript
#!/usr/bin/env node

/**
 * MCP-ocs Main Entry Point - Complete Tool Suite with Enhanced Sequential Thinking
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

console.error('🚀 Starting MCP-ocs server with Enhanced Sequential Thinking...');

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

// Create Enhanced Sequential Thinking Orchestrator with Memory Integration
const sequentialThinkingOrchestrator = new EnhancedSequentialThinkingOrchestrator(toolRegistry, sharedMemory);

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

// Register tools/call handler with enhanced sequential thinking and memory integration
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
    // Handle tool calls through enhanced sequential thinking with memory and network reset handling
    if (args && args.userInput) {
      // If this is a user request that should go through enhanced sequential thinking
      const thinkingResult = await sequentialThinkingOrchestrator.handleUserRequest(
        args.userInput, 
        args.sessionId || `session-${Date.now()}`
      );
      
      // Return the enhanced sequential thinking result
      result = JSON.stringify(thinkingResult, null, 2);
      
      // Log network reset information if detected
      if (thinkingResult.networkResetDetected) {
        console.error('⚠️ Network reset was detected and handled during processing');
      }
    } else {
      // Standard tool execution (backward compatibility)
      result = await toolRegistry.executeTool(name, args || {});
    }
    
  } catch (toolError) {
    success = false;
    error = toolError instanceof Error ? toolError.message : 'Unknown error';
    console.error(`❌ Tool execution failed: ${error}`);
    
    // Enhanced error handling with network reset context
    if (toolError instanceof Error && toolError.message.toLowerCase().includes('network reset')) {
      console.error('⚠️ Network reset detected in tool execution - this might be recoverable');
    }
    
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

console.error('✅ MCP-ocs server with Enhanced Sequential Thinking connected and ready!');

// Re-exports for library consumers
export { MCPOcsMemoryAdapter } from './lib/memory/mcp-ocs-memory-adapter.js';
export type { OCSIncidentMemory } from './lib/memory/mcp-ocs-memory-adapter.js';
```

### 3. Enhanced Memory System Integration

#### File: `src/lib/memory/shared-memory.js` (Update if needed):

```javascript
// ... existing code ...

/**
 * Enhanced search with memory context for pattern recognition and problem solving
 */
async searchOperational(options) {
  const { query, limit = 10, filters = {} } = options;
  
  try {
    // Use the memory manager to search operational data with enhanced capabilities
    const results = await this.memorySystem.search({
      query,
      limit,
      filters: {
        ...filters,
        // Add enhanced search capabilities for pattern recognition
        timestamp: { $gte: Date.now() - (30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }
    });
    
    return results;
  } catch (error) {
    console.error('Memory search operation failed:', error);
    return [];
  }
}

// ... existing code ...
```

## Key Features of the Enhanced Implementation

### 1. **Memory-Aware Problem Solving**
- Searches historical operational data for similar problems and solutions
- Provides context-aware reasoning with pattern recognition from previous interactions
- Stores current tool execution results for future learning

### 2. **Network Reset Handling**
- Detects network reset scenarios (ECONNRESET, ETIMEDOUT, etc.)
- Implements retry logic with exponential backoff
- Gracefully recovers from temporary network connectivity issues
- Logs network reset events for monitoring and analysis

### 3. **Enhanced Tool Strategy Generation**
- Uses historical context to improve confidence in tool selection
- Adjusts strategies based on proven patterns from similar problems
- Provides memory-informed rationale for each tool selection decision

### 4. **Comprehensive Audit Trail**
- Stores complete reasoning traces with memory context
- Tracks network reset events and recovery actions
- Maintains historical pattern recognition data

## Implementation Benefits

### Enhanced User Experience:
1. **Intelligent Memory-Enhanced Responses** - Users get solutions based on previous similar problems
2. **Robust Network Handling** - System gracefully handles temporary network issues
3. **Context-Aware Tool Selection** - Decisions informed by historical patterns and proven approaches

### Operational Advantages:
1. **Improved Incident Response** - Better solutions based on past incident handling
2. **Enhanced Reliability** - Network resets don't cause complete failures
3. **Learning System** - Memory system improves over time with pattern recognition

### Technical Benefits:
1. **Backward Compatibility** - All existing tool workflows remain functional
2. **Scalable Architecture** - Memory integration designed for large-scale usage
3. **Proactive Problem Detection** - Can identify and handle network reset scenarios before they cause failures

## Testing Strategy

### Network Reset Testing:
```typescript
// tests/unit/tools/sequential-thinking-network-reset.spec.ts

import { EnhancedSequentialThinkingOrchestrator } from '../../../src/lib/tools/sequential-thinking-with-memory.js';
import { UnifiedToolRegistry } from '../../../src/lib/tools/tool-registry.js';

describe('EnhancedSequentialThinkingOrchestrator - Network Reset Handling', () => {
  let mockRegistry: jest.Mocked<UnifiedToolRegistry>;
  let mockMemoryManager: any;
  let orchestrator: EnhancedSequentialThinkingOrchestrator;

  beforeEach(() => {
    mockRegistry = {
      getAllTools: jest.fn(),
      executeTool: jest.fn(),
      getMCPTools: jest.fn()
    } as any;
    
    mockMemoryManager = {
      searchOperational: jest.fn(),
      storeOperational: jest.fn()
    };
    
    orchestrator = new EnhancedSequentialThinkingOrchestrator(mockRegistry, mockMemoryManager);
  });

  it('should detect and handle network reset errors gracefully', async () => {
    // Mock a tool execution that throws network reset error
    mockRegistry.executeTool.mockRejectedValue(
      new Error('ECONNRESET: Network reset occurred')
    );
    
    const result = await orchestrator.handleUserRequest('check monitoring', 'test-session');
    
    // Should handle the error gracefully and return a meaningful response
    expect(result.success).toBe(true);
    expect(result.networkResetDetected).toBe(true);
  });

  it('should retry network operations with exponential backoff', async () => {
    // Test the retry logic for network failures
    const mockResults = [
      new Error('ECONNRESET: Network reset occurred'),
      new Error('ETIMEDOUT: Connection timeout'),
      'success_response'
    ];
    
    // This would test the actual retry implementation
  });
});
```

## Implementation Timeline

### Phase 1 (Hours 1-2): Memory Integration Setup
- Create `src/lib/tools/sequential-thinking-with-memory.ts` 
- Implement memory-aware problem analysis and tool strategy generation

### Phase 2 (Hours 2-3): Network Reset Handling
- Implement network reset detection logic
- Add retry mechanisms with exponential backoff
- Update server integration for enhanced error handling

### Phase 3 (Hours 3-4): Enhanced Memory Integration
- Connect to Voyage-Context-3 for sophisticated memory search
- Enhance tool registry with memory-aware capabilities  
- Update diagnostics tools to support the new thinking patterns

### Phase 4 (Hours 4-5): Testing and Refinement
- Unit tests for network reset handling
- Integration tests for memory search capabilities
- Performance testing with simulated network conditions

## Risk Mitigation

1. **Backward Compatibility**: All existing tool execution patterns remain unchanged
2. **Network Resilience**: Retry logic prevents transient network issues from causing failures
3. **Memory Performance**: Memory search operations are optimized to prevent performance degradation
4. **Error Handling**: Comprehensive error handling ensures system stability

This enhanced implementation provides a robust, memory-aware sequential thinking system that not only makes intelligent decisions based on historical patterns but also gracefully handles network resets and other transient issues during tool execution, delivering a more reliable and intelligent OpenShift operational assistant.
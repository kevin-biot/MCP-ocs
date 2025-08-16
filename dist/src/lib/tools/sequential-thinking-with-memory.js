/**
 * Enhanced Sequential Thinking with Memory Integration for MCP-ocs
 *
 * Implements memory-aware analysis, strategy planning, and resilient execution
 * with network reset detection and retries.
 */
import { logger } from '../../lib/logging/structured-logger.js';
export class EnhancedSequentialThinkingOrchestrator {
    toolRegistry;
    memoryManager;
    constructor(toolRegistry, memoryManager) {
        this.toolRegistry = toolRegistry;
        this.memoryManager = memoryManager;
    }
    async handleUserRequest(userInput, sessionId, opts) {
        const context = {
            sessionId,
            userInput,
            thoughtNumber: 1,
            totalThoughts: 5,
            nextThoughtNeeded: true,
            toolRegistry: this.toolRegistry,
            memoryManager: this.memoryManager,
            bounded: Boolean(opts?.bounded),
            firstStepOnly: Boolean(opts?.firstStepOnly),
        };
        try {
            const analysis = await this.analyzeProblemWithMemory(userInput, context);
            const { strategy, suggestions } = await this.formulateToolStrategyWithMemory(analysis, context);
            // Optionally execute only first step to stay within tight timeouts
            const final = context.firstStepOnly
                ? await this.executeFirstStep(strategy, context)
                : await this.executeWithReflectionAndNetworkRecovery(strategy, context);
            return {
                success: true,
                toolStrategy: strategy,
                reasoningTrace: [analysis, ...strategy.steps.map((s) => ({
                        thoughtNumber: s.sequenceNumber,
                        thought: `Executing ${s.tool} with rationale: ${s.rationale}`,
                        timestamp: new Date(),
                        nextThoughtNeeded: false,
                        memoryContext: s.memoryContext,
                        needsMoreThoughts: false,
                    }))],
                finalResult: final,
                networkResetDetected: Boolean(final?.networkResetDetected),
                suggestions,
            };
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return {
                success: false,
                toolStrategy: { steps: [], estimatedSteps: 0, rationale: 'Failed to generate strategy', confidenceScore: 0 },
                reasoningTrace: [],
                error: msg,
                networkResetDetected: false,
            };
        }
    }
    async analyzeProblemWithMemory(userInput, context) {
        let similar = await this.searchSimilarProblems(userInput);
        // Augment with session-aware operational memories
        try {
            const sessionOnly = await this.memoryManager.searchOperational(context.sessionId, 3);
            const mapped = sessionOnly.map((r) => {
                const op = r.memory;
                const problem = Array.isArray(op?.symptoms) ? op.symptoms.join(', ') : 'session_activity';
                const solutionPath = Array.isArray(op?.diagnosticSteps) ? op.diagnosticSteps.join(' -> ') : (op?.resolution || '');
                return { problem, solutionPath, timestamp: op?.timestamp, tags: op?.tags || [] };
            });
            similar = [...mapped, ...similar];
        }
        catch { }
        // Session-aware context: fetch recent tool executions for this session
        let sessionOps = [];
        try {
            const q = `${context.sessionId} tool_execution`;
            const ops = await this.memoryManager.searchOperational(q, 5);
            sessionOps = ops.map((r) => {
                const op = r.memory;
                const problem = Array.isArray(op?.symptoms) ? op.symptoms.join(', ') : 'tool_execution';
                const solutionPath = Array.isArray(op?.diagnosticSteps) ? op.diagnosticSteps.join(' -> ') : (op?.resolution || '');
                return { problem, solutionPath, timestamp: op?.timestamp, tags: op?.tags || [] };
            });
        }
        catch { }
        try {
            logger.memoryOperation('search_operational', context.sessionId, similar.length, { query: userInput });
        }
        catch { }
        const patterns = await this.identifyProblemPatterns(userInput);
        const complexity = this.assessComplexity(userInput);
        let thought = `Analyzing request: "${userInput}". ` +
            `Available tools: ${this.listAvailableTools(this.toolRegistry)}. ` +
            `Complexity: ${complexity}. Patterns: ${patterns.length > 0 ? patterns.join(', ') : 'none'}. ` +
            `${similar.length > 0 ? `Found ${similar.length} similar cases.` : 'No similar cases found.'}`;
        if (similar.length > 0) {
            thought += `\n\nMemory Insights:\n` + similar.slice(0, 3).map((m, i) => `${i + 1}. ${m.problem} -> ${m.solutionPath}`).join('\n');
        }
        if (sessionOps.length > 0) {
            thought += `\n\nSession Context (recent tool executions):\n` + sessionOps.slice(0, 3).map((m, i) => `${i + 1}. ${m.problem} -> ${m.solutionPath}`).join('\n');
        }
        return {
            thoughtNumber: context.thoughtNumber++,
            thought,
            timestamp: new Date(),
            nextThoughtNeeded: true,
            totalThoughts: context.totalThoughts,
            memoryContext: similar,
        };
    }
    async searchSimilarProblems(userInput) {
        try {
            // SharedMemoryManager.searchOperational signature: (query: string, limit?: number)
            const results = await this.memoryManager.searchOperational(userInput, 5);
            return results.map((r) => {
                const op = r.memory;
                const problem = Array.isArray(op?.symptoms) ? op.symptoms.join(', ') : 'Unknown problem';
                const solutionPath = Array.isArray(op?.diagnosticSteps) ? op.diagnosticSteps.join(' -> ') : 'No solution path';
                return { problem, solutionPath, timestamp: op?.timestamp, tags: op?.tags || [] };
            });
        }
        catch (e) {
            console.error('Memory search failed:', e);
            return [];
        }
    }
    async identifyProblemPatterns(userInput) {
        const t = userInput.toLowerCase();
        const p = [];
        if (/(monitoring|alert|prometheus|grafana|metrics)/.test(t))
            p.push('monitoring_stack_issue');
        if (/(network|connectivity|timeout)/.test(t))
            p.push('network_connectivity_issue');
        if (/(memory|cpu|resource)/.test(t))
            p.push('resource_constraint_issue');
        if (/(crash|oom|restart)/.test(t))
            p.push('pod_crash_issue');
        return p;
    }
    async executeFirstStep(strategy, context) {
        const steps = strategy.steps.slice(0, 1);
        const limitedStrategy = { ...strategy, steps, estimatedSteps: steps.length };
        const result = await this.executeWithReflectionAndNetworkRecovery(limitedStrategy, context);
        try {
            logger.info('First-step-only execution completed', { sessionId: context.sessionId, steps: steps.length });
        }
        catch { }
        return { ...result, note: 'Executed only the first planned step (firstStepOnly=true)' };
    }
    async formulateToolStrategyWithMemory(analysis, context) {
        const mem = analysis.memoryContext || [];
        let confidence = 0.7;
        const steps = [];
        const input = context.userInput;
        const suggestions = [];
        // Derive recent tools executed from session context
        let recentTools = new Set();
        try {
            const ops = await this.memoryManager.searchOperational(`${context.sessionId} tool_execution`, 10);
            ops.forEach((r) => {
                const tags = Array.isArray(r?.memory?.tags) ? r.memory.tags : [];
                tags.forEach((t) => recentTools.add(String(t)));
            });
        }
        catch { }
        if (this.isClusterProblem(input) && !context.bounded) {
            if (recentTools.has('oc_diagnostic_cluster_health')) {
                suggestions.push('Skipped cluster health (recently executed in this session)');
            }
            else {
                steps.push({
                    sequenceNumber: context.thoughtNumber++,
                    tool: 'oc_diagnostic_cluster_health',
                    parameters: { sessionId: context.sessionId, depth: 'summary', includeNamespaceAnalysis: true },
                    rationale: 'Establish overall cluster state before targeted diagnostics',
                    dependencies: [],
                    memoryContext: mem.slice(0, 2),
                });
                if (mem.some((m) => m.problem.includes('cluster')))
                    confidence = Math.max(confidence, 0.9);
            }
        }
        else if (this.isClusterProblem(input) && context.bounded) {
            suggestions.push('Bounded mode: skipping cluster-wide health sweep');
        }
        if (this.isMonitoringProblem(input)) {
            if (recentTools.has('oc_diagnostic_namespace_health')) {
                suggestions.push('Namespace health recently executed; consider pod logs/events for failing components');
                // If pods were recently listed, suggest logs next
                if (recentTools.has('oc_read_get_pods')) {
                    suggestions.push('Pods already listed; next recommended: oc_read_logs on failing pods or oc_get events');
                }
                else {
                    steps.push({
                        sequenceNumber: context.thoughtNumber++,
                        tool: 'oc_read_get_pods',
                        parameters: { sessionId: context.sessionId, namespace: 'openshift-monitoring', selector: 'app=prometheus' },
                        rationale: 'List Prometheus pods to target logs/events for failures',
                        dependencies: [],
                        memoryContext: mem.slice(0, 2),
                    });
                }
            }
            else {
                steps.push({
                    sequenceNumber: context.thoughtNumber++,
                    tool: 'oc_diagnostic_namespace_health',
                    parameters: { sessionId: context.sessionId, namespace: 'openshift-monitoring', includeIngressTest: true, deepAnalysis: true },
                    rationale: 'Focus on monitoring stack namespace based on symptoms',
                    dependencies: context.bounded ? [] : ['oc_diagnostic_cluster_health'],
                    memoryContext: mem.slice(0, 3),
                });
            }
            if (mem.some((m) => m.problem.includes('monitor')))
                confidence += 0.1;
        }
        if (this.isIncidentResponse(input)) {
            steps.push({
                sequenceNumber: context.thoughtNumber++,
                tool: 'oc_diagnostic_rca_checklist',
                parameters: { sessionId: context.sessionId, outputFormat: 'json', includeDeepAnalysis: true },
                rationale: 'Run systematic RCA for incident response',
                dependencies: [],
                memoryContext: mem.slice(0, 2),
            });
            confidence = Math.min(1.0, confidence + 0.15);
        }
        if (this.isPodIssue(input)) {
            steps.push({
                sequenceNumber: context.thoughtNumber++,
                tool: 'oc_diagnostic_pod_health',
                parameters: { sessionId: context.sessionId, namespaceScope: 'all', focusStrategy: 'auto', depth: 'detailed' },
                rationale: 'Investigate pod-level health for reported issues',
                dependencies: [],
                memoryContext: mem.slice(0, 2),
            });
        }
        if (this.isNetworkProblem(input)) {
            steps.push({
                sequenceNumber: context.thoughtNumber++,
                tool: 'oc_read_get_pods',
                parameters: { sessionId: context.sessionId, namespace: 'openshift-monitoring', selector: 'app=prometheus' },
                rationale: 'Check monitoring pods for network-related issues',
                dependencies: [],
                memoryContext: mem.slice(0, 2),
            });
        }
        const strategy = {
            steps,
            estimatedSteps: steps.length,
            rationale: `Generated tool strategy for: "${context.userInput}" with ${steps.length} steps. Memory-aware: ${mem.length > 0 ? 'yes' : 'no'}.`,
            confidenceScore: Math.min(1.0, confidence),
        };
        try {
            logger.info('Sequential strategy generated', {
                sessionId: context.sessionId,
                operation: 'sequential_strategy',
                stepCount: strategy.estimatedSteps,
                confidence: strategy.confidenceScore,
            });
        }
        catch { }
        try {
            if (suggestions.length)
                logger.info('Orchestrator suggestions', { sessionId: context.sessionId, suggestions });
        }
        catch { }
        return { strategy, suggestions };
    }
    async executeWithReflectionAndNetworkRecovery(strategy, context) {
        const results = [];
        let networkResetDetected = false;
        for (const step of strategy.steps) {
            await this.reflectOnExecution(step, context); // pre-exec thought (not stored)
            let attempt = 0;
            const maxAttempts = 3;
            let execResult = null;
            const startedAt = Date.now();
            while (attempt < maxAttempts) {
                attempt++;
                try {
                    execResult = await this.executeToolWithNetworkHandling(step.tool, step.parameters);
                    break;
                }
                catch (e) {
                    if (this.isNetworkResetError(e) && attempt < maxAttempts) {
                        networkResetDetected = true;
                        try {
                            logger.warn('Network reset detected; retrying tool', {
                                sessionId: context.sessionId,
                                toolName: step.tool,
                                attempt,
                                maxAttempts,
                                operation: 'tool_retry'
                            });
                        }
                        catch { }
                        await new Promise((r) => setTimeout(r, 1000 * attempt));
                        continue;
                    }
                    if (attempt >= maxAttempts) {
                        const duration = Date.now() - startedAt;
                        try {
                            logger.toolExecution(step.tool, context.sessionId, duration, false, { retries: attempt - 1 });
                        }
                        catch { }
                        throw e;
                    }
                }
            }
            const post = await this.reflectOnResults(execResult, step, context);
            results.push({ step, result: execResult, thinking: { post } });
            await this.storeToolExecutionInMemory(step, execResult, context.sessionId);
            const duration = Date.now() - startedAt;
            try {
                logger.toolExecution(step.tool, context.sessionId, duration, true, { retries: attempt - 1 });
            }
            catch { }
        }
        return {
            overallStatus: results.every((r) => r.result && !(typeof r.result === 'string' && r.result.includes('error'))) ? 'success' : 'partial',
            steps: results,
            summary: `Executed ${results.length} tools with memory-aware reasoning`,
            networkResetDetected,
            timestamp: new Date().toISOString(),
        };
    }
    async executeToolWithNetworkHandling(toolName, parameters) {
        return await this.toolRegistry.executeTool(toolName, parameters);
    }
    isNetworkResetError(error) {
        const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
        const indicators = ['network reset', 'connection timeout', 'connection reset', 'timeout', 'econnreset', 'etimedout', 'connection refused', 'no route to host'];
        return indicators.some((i) => msg.includes(i));
    }
    async storeToolExecutionInMemory(step, result, sessionId) {
        try {
            await this.memoryManager.storeOperational({
                incidentId: `tool-execution-${sessionId}-${Date.now()}`,
                domain: 'cluster',
                timestamp: Date.now(),
                symptoms: ['tool_execution'],
                affectedResources: [step.tool],
                diagnosticSteps: [`Executed ${step.tool}`],
                tags: ['tool_execution', 'memory_enhanced', step.tool],
                environment: 'prod',
                // metadata is accepted by SharedMemoryManager.storeOperational but not typed; safe to include
                // @ts-ignore
                metadata: { resultSummary: typeof result === 'string' ? result.slice(0, 200) : JSON.stringify(result).slice(0, 200), memoryContext: step.memoryContext || [] },
            });
        }
        catch (e) {
            console.error('Failed to store tool execution in memory:', e);
        }
    }
    async reflectOnExecution(step, context) {
        const info = step.memoryContext && step.memoryContext.length > 0
            ? `Based on ${step.memoryContext.length} similar past problems`
            : 'No historical context available';
        return {
            thoughtNumber: context.thoughtNumber++,
            thought: `About to execute ${step.tool} with parameters ${JSON.stringify(step.parameters)}. ${info}.`,
            timestamp: new Date(),
            nextThoughtNeeded: true,
        };
    }
    async reflectOnResults(result, step, context) {
        const resultSummary = typeof result === 'string' ? result.substring(0, 120) : JSON.stringify(result).substring(0, 120);
        let memoryInsights = '';
        if (step.memoryContext && step.memoryContext.length > 0) {
            memoryInsights = `\n\nMemory Insights:\n` + step.memoryContext.slice(0, 2).map((m, i) => `${i + 1}. ${m.problem} -> ${m.solutionPath}`).join('\n');
        }
        return {
            thoughtNumber: context.thoughtNumber++,
            thought: `Result from ${step.tool}: ${resultSummary}.${memoryInsights}`,
            timestamp: new Date(),
            nextThoughtNeeded: false,
            needsMoreThoughts: this.shouldReviseStrategy(result, step),
            memoryContext: step.memoryContext,
        };
    }
    shouldReviseStrategy(result, step) {
        const s = typeof result === 'string' ? result.toLowerCase() : JSON.stringify(result).toLowerCase();
        const failureIndicators = ['error', 'fail', 'degraded', 'timeout', 'connection reset'];
        const hasFailure = failureIndicators.some((i) => s.includes(i));
        const memSignals = step.memoryContext?.some((m) => m.problem.toLowerCase().includes('requires adjustment')) || false;
        return hasFailure || memSignals;
    }
    assessComplexity(input) {
        const len = input.length;
        if (len < 40)
            return 'low';
        if (len < 120)
            return 'medium';
        return 'high';
    }
    isClusterProblem(input) {
        return ['cluster', 'overall', 'health', 'status', 'diagnostic'].some((k) => input.toLowerCase().includes(k));
    }
    isMonitoringProblem(input) {
        return ['monitoring', 'alert', 'prometheus', 'grafana', 'metrics'].some((k) => input.toLowerCase().includes(k));
    }
    isIncidentResponse(input) {
        return ['incident', 'crash', 'error', 'fail', 'outage', 'problem'].some((k) => input.toLowerCase().includes(k));
    }
    isPodIssue(input) {
        return ['pod', 'container', 'crash', 'oom', 'restart', 'image'].some((k) => input.toLowerCase().includes(k));
    }
    isNetworkProblem(input) {
        return ['network', 'connectivity', 'timeout', 'dns', 'port', 'firewall'].some((k) => input.toLowerCase().includes(k));
    }
    listAvailableTools(registry) {
        return registry.getAllTools().map((t) => t.name).join(', ');
    }
}

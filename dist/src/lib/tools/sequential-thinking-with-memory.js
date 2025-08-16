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
        const t = input.toLowerCase();
        const skipIngress = t.includes('skip ingress');
        const isSpecific = this.isSpecificRequest(input);
        const isExplicitComprehensive = this.isExplicitComprehensiveRequest(input);
        const isComplexUnclear = this.isComplexOrUnclear(input);
        const inferredNs = this.inferNamespaceFromInput(input);
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
                // Heuristics & defaults: in bounded mode, avoid deep/ingress unless explicitly stated
                steps.push({
                    sequenceNumber: context.thoughtNumber++,
                    tool: 'oc_diagnostic_namespace_health',
                    parameters: {
                        sessionId: context.sessionId,
                        namespace: 'openshift-monitoring',
                        includeIngressTest: skipIngress ? false : (context.bounded ? false : true),
                        deepAnalysis: context.bounded ? false : true
                    },
                    rationale: 'Focus on monitoring stack namespace based on symptoms',
                    dependencies: context.bounded ? [] : ['oc_diagnostic_cluster_health'],
                    memoryContext: mem.slice(0, 3),
                });
            }
            if (mem.some((m) => m.problem.includes('monitor')))
                confidence += 0.1;
        }
        // RCA positioning & gating
        // - Specific request: do NOT trigger RCA initially.
        // - Explicit comprehensive or complex/unclear + unbounded: allow RCA.
        // - Bounded mode: prefer bounded RCA (subset, time-limited, optionally namespace-scoped).
        if (!isSpecific) {
            if (isExplicitComprehensive && !context.bounded) {
                steps.push({
                    sequenceNumber: context.thoughtNumber++,
                    tool: 'oc_diagnostic_rca_checklist',
                    parameters: { sessionId: context.sessionId, outputFormat: 'json', includeDeepAnalysis: true },
                    rationale: 'Comprehensive RCA requested by user',
                    dependencies: [],
                    memoryContext: mem.slice(0, 2),
                });
                confidence = Math.min(1.0, confidence + 0.15);
            }
            else if ((isExplicitComprehensive || isComplexUnclear) && context.bounded) {
                // Bounded RCA subset
                steps.push({
                    sequenceNumber: context.thoughtNumber++,
                    tool: 'oc_diagnostic_rca_checklist',
                    parameters: {
                        sessionId: context.sessionId,
                        outputFormat: 'json',
                        includeDeepAnalysis: false,
                        maxCheckTime: 15000,
                        ...(inferredNs ? { namespace: inferredNs } : {})
                    },
                    rationale: 'Bounded RCA (subset) due to performance constraints',
                    dependencies: [],
                    memoryContext: mem.slice(0, 2),
                });
                suggestions.push('Used bounded RCA (subset, time-limited) to respect bounded mode');
                confidence = Math.min(1.0, confidence + 0.1);
            }
            else if (isComplexUnclear && !context.bounded) {
                steps.push({
                    sequenceNumber: context.thoughtNumber++,
                    tool: 'oc_diagnostic_rca_checklist',
                    parameters: { sessionId: context.sessionId, outputFormat: 'json', includeDeepAnalysis: true },
                    rationale: 'Complex/unclear problem warrants comprehensive RCA',
                    dependencies: [],
                    memoryContext: mem.slice(0, 2),
                });
                confidence = Math.min(1.0, confidence + 0.15);
            }
        }
        // Pod issue heuristics: avoid broad pod_health; list pods in likely namespace first
        if (this.isPodIssue(input)) {
            const ns = t.includes('ingress') || t.includes('router')
                ? 'openshift-ingress'
                : (t.includes('monitoring') ? 'openshift-monitoring' : undefined);
            steps.push({
                sequenceNumber: context.thoughtNumber++,
                tool: 'oc_read_get_pods',
                parameters: { sessionId: context.sessionId, ...(ns ? { namespace: ns } : {}) },
                rationale: ns ? `List pods in likely affected namespace (${ns}) before deep diagnostics` : 'List pods to identify target for pod health diagnostics',
                dependencies: [],
                memoryContext: mem.slice(0, 2),
            });
            suggestions.push('After listing pods, run oc_diagnostic_pod_health on failing pod');
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
        // Ingress-focused routing: map ingress/router/503 signals to targeted steps
        if (t.includes('ingress') || t.includes('router') || t.includes('503') || t.includes('openshift-ingress')) {
            // 1) Get operator pods
            if (!recentTools.has('oc_read_get_pods')) {
                steps.push({
                    sequenceNumber: context.thoughtNumber++,
                    tool: 'oc_read_get_pods',
                    parameters: { sessionId: context.sessionId, namespace: 'openshift-ingress-operator' },
                    rationale: 'Check ingress operator pod status for controller health',
                    dependencies: [],
                    memoryContext: mem.slice(0, 2),
                });
            }
            else {
                suggestions.push('Operator pods recently listed; consider describing operator if issues found');
            }
            // 2) Get router pods
            steps.push({
                sequenceNumber: context.thoughtNumber++,
                tool: 'oc_read_get_pods',
                parameters: { sessionId: context.sessionId, namespace: 'openshift-ingress' },
                rationale: 'List router pods to verify replicas and readiness',
                dependencies: [],
                memoryContext: mem.slice(0, 2),
            });
            // 3) Describe default ingresscontroller
            steps.push({
                sequenceNumber: context.thoughtNumber++,
                tool: 'oc_read_describe',
                parameters: { sessionId: context.sessionId, resourceType: 'ingresscontroller', name: 'default', namespace: 'openshift-ingress-operator' },
                rationale: 'Inspect default ingresscontroller configuration and status',
                dependencies: [],
                memoryContext: mem.slice(0, 2),
            });
            suggestions.push('After listing routers, describe a router pod with oc_read_describe');
        }
        // Smart plan diffing: skip steps matching recently executed tools in-session
        const filteredSteps = steps.filter(s => !recentTools.has(s.tool));
        if (filteredSteps.length < steps.length) {
            suggestions.push('Skipped steps recently executed in this session');
        }
        const strategy = {
            steps: filteredSteps,
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
        // Persist last strategy for plan continuity
        try {
            await this.storePlanStrategyInMemory(strategy, context.sessionId);
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
    async storePlanStrategyInMemory(strategy, sessionId) {
        try {
            await this.memoryManager.storeOperational({
                incidentId: `plan-strategy-${sessionId}`,
                domain: 'cluster',
                timestamp: Date.now(),
                symptoms: ['plan_strategy', sessionId],
                affectedResources: strategy.steps.map(s => s.tool),
                diagnosticSteps: strategy.steps.map(s => `Planned ${s.tool}`),
                tags: ['plan_strategy', sessionId],
                environment: 'prod',
                // @ts-ignore - metadata accepted by storeOperational
                metadata: { steps: strategy.steps }
            });
        }
        catch (e) {
            // Non-fatal
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
        // Escalation logic: detect red flags and propose RCA (bounded or unbounded)
        const redFlags = this.detectRedFlags(result);
        if (redFlags.length > 0) {
            const ns = this.inferNamespaceFromInput(context.userInput) || (typeof step.parameters?.namespace === 'string' ? step.parameters.namespace : undefined);
            const boundedEscalation = context.bounded;
            const escalationParams = {
                sessionId: context.sessionId,
                outputFormat: 'json',
                includeDeepAnalysis: !boundedEscalation,
                ...(boundedEscalation ? { maxCheckTime: 15000 } : {}),
                ...(ns ? { namespace: ns } : {})
            };
            try {
                // Persist an escalation plan memory so a follow-up "continue" can schedule it
                await this.memoryManager.storeOperational({
                    incidentId: `plan-escalation-${context.sessionId}-${Date.now()}`,
                    domain: 'cluster',
                    timestamp: Date.now(),
                    symptoms: ['escalation_planned', ...redFlags],
                    affectedResources: [step.tool],
                    diagnosticSteps: ['Planned oc_diagnostic_rca_checklist'],
                    tags: ['plan_escalation', context.sessionId],
                    environment: 'prod',
                    // @ts-ignore
                    metadata: { tool: 'oc_diagnostic_rca_checklist', params: escalationParams }
                });
            }
            catch { }
        }
        return {
            thoughtNumber: context.thoughtNumber++,
            thought: `Result from ${step.tool}: ${resultSummary}.` +
                (redFlags.length ? ` Escalation signals detected: ${redFlags.join(', ')}. RCA planned${context.bounded ? ' (bounded)' : ''}.` : '') +
                `${memoryInsights}`,
            timestamp: new Date(),
            nextThoughtNeeded: false,
            needsMoreThoughts: this.shouldReviseStrategy(result, step),
            memoryContext: step.memoryContext,
        };
    }
    shouldReviseStrategy(result, step) {
        const s = typeof result === 'string' ? result.toLowerCase() : JSON.stringify(result).toLowerCase();
        const failureIndicators = ['error', 'fail', 'degraded', 'timeout', 'connection reset', 'imagepullbackoff', 'not ready', 'pending', '503'];
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
    isSpecificRequest(input) {
        const t = input.toLowerCase();
        const verbs = /(check|describe|get|list|show|inspect)\b/;
        const entities = /(ingress|router|pod|namespace|prometheus|ingresscontroller|route|service)/;
        return verbs.test(t) && entities.test(t);
    }
    isExplicitComprehensiveRequest(input) {
        const t = input.toLowerCase();
        return [
            'full cluster analysis',
            'complete incident report',
            'comprehensive analysis',
            'overall cluster health',
            'cluster-wide',
            'run rca',
            'root cause analysis'
        ].some(p => t.includes(p));
    }
    isComplexOrUnclear(input) {
        const t = input.toLowerCase();
        return [
            'we don\'t know why',
            'unknown cause',
            'multiple apps failing',
            'widespread',
            'outage',
            'everything is slow',
        ].some(p => t.includes(p));
    }
    inferNamespaceFromInput(input) {
        const t = input.toLowerCase();
        if (t.includes('openshift-ingress-operator'))
            return 'openshift-ingress-operator';
        if (t.includes('openshift-ingress') || t.includes('router'))
            return 'openshift-ingress';
        if (t.includes('monitoring') || t.includes('prometheus') || t.includes('grafana'))
            return 'openshift-monitoring';
        return undefined;
    }
    detectRedFlags(result) {
        const s = typeof result === 'string' ? result.toLowerCase() : JSON.stringify(result).toLowerCase();
        const flags = [
            { k: 'degraded', m: 'degraded' },
            { k: 'failing', m: 'failing' },
            { k: 'pending', m: 'pending' },
            { k: 'not_ready', m: 'not ready' },
            { k: 'imagepullbackoff', m: 'imagepullbackoff' },
            { k: 'crashloop', m: 'crashloop' },
            { k: '503', m: '503' },
            { k: 'tls', m: 'tls' }
        ];
        return flags.filter(f => s.includes(f.m)).map(f => f.k);
    }
}

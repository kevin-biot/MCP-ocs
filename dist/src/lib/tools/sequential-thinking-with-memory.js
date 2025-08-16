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
        // Fast-path: reflect-only mode (e.g., nextThoughtNeeded=false) to avoid long runs
        const reflectOnly = opts?.reflectOnly === true || opts?.nextThoughtNeeded === false;
        if (reflectOnly) {
            return await this.quickReflect(sessionId, userInput);
        }
        const timeoutMs = typeof opts?.timeoutMs === 'number' && opts?.timeoutMs > 0
            ? opts.timeoutMs
            : (context.bounded ? 12000 : 0);
        const work = (async () => {
            const mode = opts?.mode || (context.firstStepOnly ? 'firstStepOnly' : (context.bounded ? 'firstStepOnly' : 'planOnly'));
            // Continuation path: execute next planned steps without re-planning
            if (opts?.continuePlan) {
                return await this.resumePlannedSteps(sessionId, opts?.stepBudget || (context.firstStepOnly ? 1 : 2));
            }
            const analysis = await this.analyzeProblemWithMemory(userInput, context);
            const { strategy, suggestions } = await this.formulateToolStrategyWithMemory(analysis, context, opts?.triageTarget);
            if (mode === 'planOnly') {
                try {
                    await this.storePlanStrategyInMemory(strategy, sessionId);
                }
                catch { }
                return {
                    success: true,
                    toolStrategy: strategy,
                    reasoningTrace: [analysis],
                    finalResult: { note: 'Plan-only mode: no steps executed' },
                    networkResetDetected: false,
                    suggestions,
                };
            }
            let stepsToRun = strategy.steps;
            if (mode === 'firstStepOnly')
                stepsToRun = strategy.steps.slice(0, 1);
            if (mode === 'boundedMultiStep') {
                const n = Math.max(1, Math.min((opts?.stepBudget || 2), strategy.steps.length));
                stepsToRun = strategy.steps.slice(0, n);
            }
            const partial = { ...strategy, steps: stepsToRun, estimatedSteps: stepsToRun.length };
            const final = await this.executeWithReflectionAndNetworkRecovery(partial, context);
            try {
                await this.advancePlanPointer(sessionId, stepsToRun.length);
            }
            catch { }
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
        })();
        if (timeoutMs && timeoutMs > 0) {
            const timed = await Promise.race([
                work,
                (async () => {
                    await new Promise((r) => setTimeout(r, timeoutMs));
                    const fallback = await this.quickReflect(sessionId, userInput);
                    return { ...fallback, error: `orchestrator_timeout_${timeoutMs}ms` };
                })()
            ]);
            return timed;
        }
        return await work;
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
    async quickReflect(sessionId, userInput) {
        // Ultra-fast reflection: intentionally avoid any memory or network calls to prevent timeouts
        const recent = [];
        const suggestions = [
            'Tip: Use bounded=true and firstStepOnly=true for fast, targeted runs',
            'Set SEQ_TIMEOUT_MS to raise orchestrator timeout if needed'
        ];
        return {
            success: true,
            toolStrategy: { steps: [], estimatedSteps: 0, rationale: `Quick reflection for: "${userInput}"`, confidenceScore: 0.6 },
            reasoningTrace: [{
                    thoughtNumber: 1,
                    thought: 'Reflection-only mode: skipping planning and execution to avoid timeouts',
                    timestamp: new Date(),
                    nextThoughtNeeded: false,
                    totalThoughts: 1,
                }],
            finalResult: { note: 'Reflection-only response (no tool execution)' },
            networkResetDetected: false,
            suggestions,
        };
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
    async formulateToolStrategyWithMemory(analysis, context, triageTarget) {
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
        // Scenario template: ingress triage (strong defaults)
        if ((triageTarget && triageTarget.toLowerCase().includes('ingress')) || t.includes('ingress')) {
            const nsOp = 'openshift-ingress-operator';
            const nsIng = 'openshift-ingress';
            // Step 1: list router pods
            steps.push({
                sequenceNumber: context.thoughtNumber++,
                tool: 'oc_read_get_pods',
                parameters: { sessionId: context.sessionId, namespace: nsIng },
                rationale: 'List router pods in ingress namespace',
                dependencies: [],
                memoryContext: mem.slice(0, 2),
            });
            // Step 2: describe ingresscontroller early to confirm config
            steps.push({
                sequenceNumber: context.thoughtNumber++,
                tool: 'oc_read_describe',
                parameters: { sessionId: context.sessionId, resourceType: 'ingresscontroller', name: 'default', namespace: nsOp },
                rationale: 'Describe default ingresscontroller for configuration/status',
                dependencies: [],
                memoryContext: mem.slice(0, 2),
            });
            // Step 3: operator pods
            steps.push({
                sequenceNumber: context.thoughtNumber++,
                tool: 'oc_read_get_pods',
                parameters: { sessionId: context.sessionId, namespace: nsOp },
                rationale: 'Check ingress operator pod status',
                dependencies: [],
                memoryContext: mem.slice(0, 2),
            });
            suggestions.push('Template applied: ingress triage');
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
    includesSchedulingRedFlags(text) {
        const s = text.toLowerCase();
        return /faileddcheduling/.test(s) || /taint/.test(s) || /anti-?affinity/.test(s);
    }
    extractNodeFromText(text) {
        // Try to find a node name like ip-10-0-77-117.eu-west-1.compute.internal or similar
        const m = text.match(/\b([a-z0-9-]+\.[a-z0-9.-]+compute\.internal)\b/i);
        if (m)
            return m[1];
        // Fallback: hostname-like token
        const h = text.match(/\b([a-z0-9-]+\.localdomain)\b/i);
        if (h)
            return h[1];
        return undefined;
    }
    async storeMiniPlanStrategy(sessionId, steps, telemetry) {
        try {
            await this.memoryManager.storeOperational({
                incidentId: `plan-strategy-${sessionId}`,
                domain: 'cluster',
                timestamp: Date.now(),
                symptoms: ['plan_strategy', sessionId, 'mini_plan'],
                affectedResources: steps.map(s => s.tool),
                diagnosticSteps: steps.map(s => `Planned ${s.tool}`),
                tags: ['plan_strategy', sessionId, 'mini_plan'],
                environment: 'prod',
                // @ts-ignore
                metadata: { steps, ...(telemetry || {}) }
            });
        }
        catch { }
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
    async resumePlannedSteps(sessionId, stepBudget) {
        // Retrieve last strategy (plan) with steps from metadata
        let steps = [];
        try {
            const results = await this.memoryManager.searchOperational(`${sessionId} plan_strategy`, 3);
            const latest = results[0]?.memory;
            // @ts-ignore
            const meta = latest?.metadata || {};
            steps = Array.isArray(meta.steps) ? meta.steps : [];
        }
        catch { }
        if (!steps.length) {
            return {
                success: false,
                toolStrategy: { steps: [], estimatedSteps: 0, rationale: 'No prior plan found', confidenceScore: 0 },
                reasoningTrace: [],
                networkResetDetected: false,
                error: 'no_prior_plan'
            };
        }
        // Read pointer
        let pointer = 0;
        try {
            const ptr = await this.memoryManager.searchOperational(`plan-pointer-${sessionId}`, 1);
            const latestPtr = ptr[0]?.memory;
            // @ts-ignore
            pointer = Number(latestPtr?.metadata?.index || 0);
        }
        catch { }
        const toRun = steps.slice(pointer, pointer + Math.max(1, stepBudget));
        if (!toRun.length) {
            return {
                success: true,
                toolStrategy: { steps: [], estimatedSteps: 0, rationale: 'Plan already completed', confidenceScore: 0.9 },
                reasoningTrace: [],
                finalResult: { note: 'No remaining steps' },
                networkResetDetected: false,
                suggestions: []
            };
        }
        // Execute
        const partial = {
            steps: toRun.map((s, i) => ({ sequenceNumber: i + 1, tool: s.tool, parameters: s.parameters, rationale: s.rationale, dependencies: s.dependencies || [], memoryContext: s.memoryContext || [] })),
            estimatedSteps: toRun.length,
            rationale: 'Continue plan execution',
            confidenceScore: 0.8,
        };
        const context = { sessionId, userInput: 'continue', thoughtNumber: 1, totalThoughts: 3, nextThoughtNeeded: false, toolRegistry: this.toolRegistry, memoryManager: this.memoryManager, bounded: true, firstStepOnly: false };
        const final = await this.executeWithReflectionAndNetworkRecovery(partial, context);
        try {
            await this.advancePlanPointer(sessionId, toRun.length, pointer);
        }
        catch { }
        return {
            success: true,
            toolStrategy: partial,
            reasoningTrace: [],
            finalResult: final,
            networkResetDetected: Boolean(final?.networkResetDetected),
            suggestions: []
        };
    }
    async advancePlanPointer(sessionId, ran, currentIndex) {
        const nextIndex = (currentIndex ?? 0) + ran;
        try {
            await this.memoryManager.storeOperational({
                incidentId: `plan-pointer-${sessionId}`,
                domain: 'cluster',
                timestamp: Date.now(),
                symptoms: ['plan_pointer', sessionId],
                affectedResources: [],
                diagnosticSteps: [`advanced_to_${nextIndex}`],
                tags: ['plan_pointer', sessionId],
                environment: 'prod',
                // @ts-ignore
                metadata: { index: nextIndex }
            });
        }
        catch { }
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
        // Persist deterministic mini-plan for taints/anti-affinity scheduling failures
        try {
            const s = typeof result === 'string' ? result : JSON.stringify(result);
            if (this.includesSchedulingRedFlags(s)) {
                const node = this.extractNodeFromText(s);
                const nsOp = 'openshift-ingress-operator';
                const nsIng = 'openshift-ingress';
                const steps = [
                    { sequenceNumber: 1, tool: 'oc_read_describe', parameters: { sessionId: context.sessionId, resourceType: 'deployment', namespace: nsIng, name: 'router-default' }, rationale: 'Confirm router tolerations and anti-affinity', dependencies: [], memoryContext: [] },
                    { sequenceNumber: 2, tool: 'oc_read_describe', parameters: { sessionId: context.sessionId, resourceType: 'ingresscontroller', namespace: nsOp, name: 'default' }, rationale: 'Inspect ingresscontroller nodePlacement and status', dependencies: [], memoryContext: [] },
                    { sequenceNumber: 3, tool: 'oc_read_describe', parameters: { sessionId: context.sessionId, resourceType: 'node', name: node || '<NODE_FROM_FAILED_SCHED_EVENT>' }, rationale: 'Verify node taints and role labels', dependencies: [], memoryContext: [] }
                ];
                await this.storeMiniPlanStrategy(context.sessionId, steps, {
                    plan_id: context.sessionId,
                    plan_phase: 'continue',
                    step_budget: 3,
                    trigger: 'failed_scheduling_taint_affinity'
                });
            }
        }
        catch { }
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

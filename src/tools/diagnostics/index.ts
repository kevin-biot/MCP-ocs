/**
 * Enhanced Diagnostic Tools v2 - OpenShift Health and Status Checks
 * 
 * Replaces v1 diagnostic tools with enhanced implementations:
 * - Better error handling and caching
 * - Intelligent pattern detection  
 * - Comprehensive health analysis
 * - Real-world operational patterns
 */

import { ToolDefinition } from '../../lib/tools/tool-types.js';
import { ToolSuite, StandardTool } from '../../lib/tools/tool-registry.js';
import { nowIso, nowEpoch } from '../../utils/time.js';
import { OpenShiftClient } from '../../lib/openshift-client.js';
import { SharedMemoryManager } from '../../lib/memory/shared-memory.js';
import { ToolMemoryGateway } from '../../lib/tools/tool-memory-gateway.js';
import { OcWrapperV2 } from '../../v2/lib/oc-wrapper-v2.js';
import { NamespaceHealthChecker } from '../../v2/tools/check-namespace-health/index.js';
import { RCAChecklistEngine } from '../../v2/tools/rca-checklist/index.js';
import { checkNamespaceHealthV2Tool } from '../../v2-integration.js';

export class DiagnosticToolsV2 implements ToolSuite {
  category = 'diagnostic';
  version = 'v2';
  private ocWrapperV2: OcWrapperV2;
  private namespaceHealthChecker: NamespaceHealthChecker;
  private rcaChecklistEngine: RCAChecklistEngine;
  private memoryGateway: ToolMemoryGateway;

  constructor(
    private openshiftClient: OpenShiftClient,
    private memoryManager: SharedMemoryManager
  ) {
    // Initialize v2 components
    this.ocWrapperV2 = new OcWrapperV2();
    this.namespaceHealthChecker = new NamespaceHealthChecker(this.ocWrapperV2);
    this.rcaChecklistEngine = new RCAChecklistEngine(this.ocWrapperV2);
    this.memoryGateway = new ToolMemoryGateway('./memory');
  }

  /**
   * Execute the enhanced namespace health tool
   */
  private async executeNamespaceHealthV2(args: {
    sessionId: string;
    namespace: string;
    includeIngressTest?: boolean;
    maxLogLinesPerPod?: number;
  }): Promise<string> {
    try {
      // Use the original V2 tool implementation
      const v2Args = {
        sessionId: args.sessionId,
        namespace: args.namespace,
        includeIngressTest: args.includeIngressTest || false,
        maxLogLinesPerPod: args.maxLogLinesPerPod || 0
      };

      const raw = await checkNamespaceHealthV2Tool.handler(v2Args);
      // Ensure we have a JSON object to persist
      let payload: any;
      try {
        payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        payload = { result: raw };
      }

      // Persist via adapter-backed gateway for consistent Chroma v2 integration
      if (!this.memoryGateway) {
        this.memoryGateway = new ToolMemoryGateway('./memory');
      }
      await this.memoryGateway.storeToolExecution(
        'oc_diagnostic_namespace_health',
        { namespace: args.namespace, includeIngressTest: !!args.includeIngressTest },
        payload,
        args.sessionId,
        ['diagnostic', 'namespace_health', args.namespace, String(payload?.status || 'unknown')],
        'openshift',
        'prod',
        payload?.status === 'healthy' ? 'low' : 'medium'
      );

      return typeof raw === 'string' ? raw : JSON.stringify(raw);
    } catch (error) {
      return this.formatErrorResponse('enhanced namespace health check', error, args.sessionId);
    }
  }

  getTools(): StandardTool[] {
    const toolDefinitions = this.getToolDefinitions();
    return toolDefinitions.map(tool => this.convertToStandardTool(tool));
  }

  private getToolDefinitions(): ToolDefinition[] {
    return [
      {
        name: 'cluster_health',
        namespace: 'mcp-openshift',
        fullName: 'oc_diagnostic_cluster_health',
        domain: 'cluster',
        priority: 90,
        capabilities: [
          { type: 'diagnostic', level: 'basic', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [],
        description: 'Enhanced cluster health analysis with intelligent issue detection',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: { type: 'string' },
            includeNamespaceAnalysis: { anyOf: [{ type: 'boolean' }, { type: 'string' }], default: false },
            maxNamespacesToAnalyze: { anyOf: [{ type: 'number' }, { type: 'string' }], default: 10 },
            namespaceScope: { anyOf: [{ type: 'string' }], enum: ['all', 'system', 'user'], default: 'all', description: 'Limit namespace analysis to system, user, or all' },
            focusNamespace: { type: 'string', description: 'Namespace to prioritize for deep analysis' },
            focusStrategy: { anyOf: [{ type: 'string' }], enum: ['auto', 'events', 'resourcePressure', 'none'], default: 'auto' },
            depth: { anyOf: [{ type: 'string' }], enum: ['summary', 'detailed'], default: 'summary' },
            // New: bounded-mode compatibility and scoping (accept strings too)
            bounded: { anyOf: [{ type: 'boolean' }, { type: 'string' }], default: false, description: 'Enable performance-bounded execution (skips cluster-wide sweeps)' },
            namespaceList: { anyOf: [{ type: 'array', items: { type: 'string' } }, { type: 'string' }], description: 'Explicit list of namespaces to analyze (bounded triage); accepts comma-separated string' },
            maxRuntimeMs: { anyOf: [{ type: 'number' }, { type: 'string' }], description: 'Hard cap on execution time; triage loops stop when exceeded' }
          },
          required: ['sessionId']
        }
      },
      {
        name: 'namespace_health',
        namespace: 'mcp-openshift',
        fullName: 'oc_diagnostic_namespace_health',
        domain: 'cluster',
        priority: 80,
        capabilities: [
          { type: 'diagnostic', level: 'basic', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [
          { type: 'domain_focus', value: 'namespace', required: true }
        ],
        description: 'Comprehensive namespace health analysis with pod, PVC, route diagnostics and ingress testing',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: { type: 'string' },
            namespace: { type: 'string' },
            includeIngressTest: { anyOf: [{ type: 'boolean' }, { type: 'string' }], default: false },
            maxLogLinesPerPod: { anyOf: [{ type: 'number' }, { type: 'string' }], default: 0 },
            deepAnalysis: { anyOf: [{ type: 'boolean' }, { type: 'string' }], default: false }
          },
          required: ['sessionId', 'namespace']
        }
      },
      {
        name: 'pod_health',
        namespace: 'mcp-openshift',
        fullName: 'oc_diagnostic_pod_health',
        domain: 'cluster',
        priority: 70,
        capabilities: [
          { type: 'diagnostic', level: 'basic', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [
          { type: 'domain_focus', value: 'namespace', required: true },
          { type: 'domain_focus', value: 'pod', required: true }
        ],
        description: 'Enhanced pod health diagnostics with dependency analysis',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: { type: 'string' },
            namespace: { type: 'string' },
            podName: { type: 'string' },
            includeDependencies: { anyOf: [{ type: 'boolean' }, { type: 'string' }], default: true },
            includeResourceAnalysis: { anyOf: [{ type: 'boolean' }, { type: 'string' }], default: true }
          },
          required: ['sessionId', 'namespace', 'podName']
        }
      },
    {
      name: 'rca_checklist',
      namespace: 'mcp-openshift',
      fullName: 'oc_diagnostic_rca_checklist',
      domain: 'cluster',
      priority: 100,
      capabilities: [
        { type: 'diagnostic', level: 'advanced', riskLevel: 'safe' }
      ],
      dependencies: [],
      contextRequirements: [],
      description: 'Guided "First 10 Minutes" RCA workflow for systematic incident response',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          namespace: { type: 'string', description: 'Target namespace (optional for cluster-wide analysis)' },
          outputFormat: { type: 'string', enum: ['json', 'markdown'], default: 'json' },
          includeDeepAnalysis: { anyOf: [{ type: 'boolean' }, { type: 'string' }], default: false },
          maxCheckTime: { anyOf: [{ type: 'number' }, { type: 'string' }], default: 60000, description: 'Maximum checklist execution time in ms' }
        },
        required: ['sessionId']
      }
    }];
  }

  private convertToStandardTool(toolDef: ToolDefinition): StandardTool {
    return {
      name: toolDef.name,
      fullName: toolDef.fullName,
      description: toolDef.description,
      inputSchema: toolDef.inputSchema,
      category: 'diagnostic' as const,
      version: 'v2' as const,
      execute: async (args: unknown) => this.executeTool(toolDef.fullName, args)
    };
  }

  async executeTool(toolName: string, args: unknown): Promise<string> {
    const rec = (v: unknown): Record<string, unknown> => (v && typeof v === 'object') ? (v as Record<string, unknown>) : {};
    const raw = rec(args);
    const sessionId = typeof raw.sessionId === 'string' ? raw.sessionId : `session-${Date.now()}`;

    try {
      switch (toolName) {
        case 'oc_diagnostic_cluster_health':
          return await this.enhancedClusterHealth(raw as any);
          
        case 'oc_diagnostic_namespace_health':
          return await this.executeNamespaceHealthV2(raw as any);  // Use V2 implementation
          
        case 'oc_diagnostic_pod_health':
          return await this.enhancedPodHealth(raw as any);
          
        case 'oc_diagnostic_rca_checklist':
          return await this.executeRCAChecklist(raw as any);
          
        default:
          throw new Error(`Unknown diagnostic tool: ${toolName}`);
      }
    } catch (error) {
      // Store diagnostic error for analysis
      await this.memoryManager.storeOperational({
        incidentId: `diagnostic-error-${sessionId}-${Date.now()}`,
        domain: 'cluster',
        timestamp: nowEpoch(),
        symptoms: [`Diagnostic tool error: ${toolName}`],
        rootCause: error instanceof Error ? error.message : 'Unknown error',
        affectedResources: [],
        diagnosticSteps: [`Failed to execute ${toolName}`],
        tags: ['diagnostic_error', 'tool_failure', toolName],
        environment: 'prod'
      });

      throw error;
    }
  }

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
    bounded?: boolean;
    namespaceList?: string[];
    maxRuntimeMs?: number;
  }): Promise<string> {
    const startTime = Date.now();
    const coerceBool = (v: any) => typeof v === 'string' ? ['true','1','yes','on'].includes(v.toLowerCase()) : Boolean(v);
    const coerceNum = (v: any, d?: number) => typeof v === 'string' ? (Number(v) || d || 0) : (typeof v === 'number' ? v : (d || 0));
    const toList = (v: any): string[] => Array.isArray(v) ? v : (typeof v === 'string' ? v.split(',').map(s=>s.trim()).filter(Boolean) : []);

    const sessionId = String((args as any)?.sessionId || `session-${Date.now()}`);
    const includeNamespaceAnalysis = coerceBool((args as any)?.includeNamespaceAnalysis);
    const maxNamespacesToAnalyze = coerceNum((args as any)?.maxNamespacesToAnalyze, 10);
    const namespaceScope = args.namespaceScope || 'all';
    const focusNamespace = args.focusNamespace;
    const focusStrategy = args.focusStrategy || 'auto';
    const depth = args.depth || 'summary';
    const bounded = coerceBool((args as any)?.bounded) || (coerceNum((args as any)?.maxRuntimeMs, 0) > 0) || (maxNamespacesToAnalyze <= 3);
    const maxRuntimeMs = coerceNum((args as any)?.maxRuntimeMs, bounded ? 20000 : 0);
    const namespaceList = toList((args as any)?.namespaceList);

    try {
      // Get cluster info using both v1 and v2 capabilities
      const clusterInfo = await this.openshiftClient.getClusterInfo();
      
      // Enhanced analysis using v2 wrapper
      const nodeHealth = await this.analyzeNodeHealth();
      const operatorHealth = await this.analyzeOperatorHealth();
      // Bounded path: avoid cluster-wide system namespace probes unless explicitly requested
      let systemNamespaceHealth: any = [];
      if (!bounded) {
        systemNamespaceHealth = await this.analyzeSystemNamespaces();
      }
      
      // Namespace analysis with prioritization
      let namespaceAnalysis: any = null;
      let prioritization: any = null;
      if (includeNamespaceAnalysis && !bounded) {
        const nsArgs = {
          scope: namespaceScope,
          focusStrategy,
          maxDetailed: maxNamespacesToAnalyze,
          depth
        };
        const analysis = await this.prioritizeNamespaces(
          typeof focusNamespace === 'string' ? { ...nsArgs, focusNamespace } : nsArgs
        );
        prioritization = analysis.prioritized;
        namespaceAnalysis = analysis.output;
      } else if (bounded) {
        // Bounded triage: prefer explicit namespaceList, else infer small set from scope/strategy
        const targets: string[] = namespaceList.length > 0
          ? namespaceList.slice(0, Math.max(1, Math.min(maxNamespacesToAnalyze || 3, namespaceList.length)))
          : await (async () => {
              // Heuristic: select up to N likely ingress namespaces
              const allNs = await this.listNamespacesByScope('all');
              const likely = allNs.filter(n => /^(openshift-ingress(-operator)?|cert-manager)$/.test(n));
              return likely.slice(0, Math.max(1, Math.min(maxNamespacesToAnalyze || 3, likely.length)));
            })();

        // Run quick checks on targets with time cap
        const detailed: any[] = [];
        for (const ns of targets) {
          if (maxRuntimeMs && Date.now() - startTime > maxRuntimeMs) break;
          try {
            const health = await this.namespaceHealthChecker.checkHealth({ namespace: ns, includeIngressTest: false, maxLogLinesPerPod: 0 });
            detailed.push({ namespace: ns, status: health.status, checks: health.checks, suspicions: health.suspicions, human: health.human });
          } catch {
            detailed.push({ namespace: ns, status: 'error', issues: 1 });
          }
        }
        namespaceAnalysis = {
          scope: 'bounded',
          depth: 'summary',
          totalNamespaces: detailed.length,
          analyzedDetailedCount: detailed.length,
          detailed,
          summaries: []
        };
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
        recommendations: this.generateClusterRecommendations(nodeHealth, operatorHealth, systemNamespaceHealth),
        mode: bounded ? 'bounded' : 'comprehensive',
        bounded: bounded ? { namespaceList: namespaceList, maxNamespacesToAnalyze, maxRuntimeMs } : undefined
      };

      // Store diagnostic results via adapter-backed gateway (Chroma v2 aware)
      await this.memoryGateway.storeToolExecution(
        'oc_diagnostic_cluster_health',
        { includeNamespaceAnalysis, maxNamespacesToAnalyze, bounded, namespaceList },
        healthSummary,
        sessionId,
        ['diagnostic', 'cluster_health', String(healthSummary.overallHealth)],
        'openshift',
        'prod',
        healthSummary.overallHealth === 'healthy' ? 'low' : 'medium'
      );

      // Persist deterministic mini-plan when ingress namespace shows pending pods under bounded sweep
      try {
        if (bounded && healthSummary?.userNamespaces?.detailed) {
          const detailed = Array.isArray((healthSummary as any).userNamespaces?.detailed) ? (healthSummary as any).userNamespaces.detailed : [];
          const ingress = detailed.find((d: any) => d?.namespace === 'openshift-ingress');
          const pending = Number(ingress?.checks?.pods?.pending || 0);
          if (pending > 0) {
            const steps = [
          { sequenceNumber: 1, tool: 'oc_read_get_pods', parameters: { sessionId, namespace: 'openshift-ingress' }, rationale: 'List router pods to locate pending', dependencies: [], memoryContext: [] },
          { sequenceNumber: 2, tool: 'oc_read_describe', parameters: { sessionId, resourceType: 'pod', namespace: 'openshift-ingress', name: '<FIRST_PENDING_ROUTER_POD>' }, rationale: 'Describe pending router pod to capture FailedScheduling causes', dependencies: [], memoryContext: [] },
          { sequenceNumber: 3, tool: 'oc_read_describe', parameters: { sessionId, resourceType: 'ingresscontroller', namespace: 'openshift-ingress-operator', name: 'default' }, rationale: 'Confirm ingresscontroller nodePlacement/tolerations and status', dependencies: [], memoryContext: [] }
            ];
            await this.memoryManager.storeOperational({
              incidentId: `plan-strategy-${sessionId}`,
              domain: 'cluster',
              timestamp: nowIso(),
              symptoms: ['plan_strategy', sessionId, 'mini_plan'],
              affectedResources: steps.map((s: any) => s.tool),
              diagnosticSteps: steps.map((s: any) => `Planned ${s.tool}`),
              tags: ['plan_strategy', sessionId, 'mini_plan', 'ingress_pending'],
              environment: 'prod',
              // @ts-ignore
              metadata: { steps, plan_id: sessionId, plan_phase: 'continue', step_budget: 3, trigger: 'ingress_pending' }
            } as any);
          }
        }
      } catch {}

      return this.formatClusterHealthResponse(healthSummary, sessionId);

    } catch (error) {
      return this.formatErrorResponse('cluster health check', error, sessionId);
    }
  }

  /**
   * Prioritize namespaces for analysis and build focused output
   */
  private async prioritizeNamespaces(opts: {
    scope: 'all' | 'system' | 'user';
    focusNamespace?: string;
    focusStrategy: 'auto' | 'events' | 'resourcePressure' | 'none';
    maxDetailed: number;
    depth: 'summary' | 'detailed';
  }): Promise<{ prioritized: any[]; output: any }>
  {
    const allNamespaces = await this.listNamespacesByScope(opts.scope);
    const summaries: Array<{ namespace: string; status: string; checks: any; suspicions: any[]; human?: any }>
      = [];

    // Build summaries (lightweight call)
    for (const ns of allNamespaces) {
      try {
        const health = await this.namespaceHealthChecker.checkHealth({
          namespace: ns,
          includeIngressTest: false,
          maxLogLinesPerPod: 0
        });
        summaries.push({ namespace: ns, status: health.status, checks: health.checks, suspicions: health.suspicions, human: health.human });
      } catch (e) {
        summaries.push({ namespace: ns, status: 'error', checks: { pods: { total: 0, crashloops: 0, pending: 0, imagePullErrors: 0 }, pvcs: { total: 0, errors: 0 }, routes: { total: 0 }, events: [] }, suspicions: ['error_checking_namespace'] });
      }
    }

    // Score and prioritize
    const scored = summaries.map(s => {
      const { score, reasons } = this.scoreNamespace(s, opts.focusStrategy);
      // Boost focused namespace
      const boosted = (opts.focusNamespace && s.namespace === opts.focusNamespace) ? score + 100 : score;
      return { namespace: s.namespace, status: s.status, score: boosted, reasons, summary: this.makeNsSummary(s) };
    }).sort((a, b) => b.score - a.score);

    // Decide detailed set
    const detailedSet = new Set<string>();
    if (opts.focusNamespace) detailedSet.add(opts.focusNamespace);
    for (const item of scored) {
      if (detailedSet.size >= opts.maxDetailed) break;
      detailedSet.add(item.namespace);
    }

    // Build output sections
    const detailed = summaries
      .filter(s => detailedSet.has(s.namespace))
      .map(s => ({ namespace: s.namespace, status: s.status, checks: s.checks, suspicions: s.suspicions, human: s.human }));

    const sampled = summaries
      .filter(s => !detailedSet.has(s.namespace))
      .map(s => ({ namespace: s.namespace, status: s.status, summary: this.makeNsSummary(s) }));

    const output = {
      scope: opts.scope,
      depth: opts.depth,
      totalNamespaces: summaries.length,
      analyzedDetailedCount: detailed.length,
      detailed: opts.depth === 'detailed' ? detailed : undefined,
      summaries: sampled
    };

    return { prioritized: scored, output };
  }

  private makeNsSummary(s: { checks: any; suspicions: any[] }) {
    const pods = s.checks?.pods || {};
    const pvcs = s.checks?.pvcs || {};
    const routes = s.checks?.routes || {};
    const events = s.checks?.events || [];
    return {
      pods: { ready: pods.ready, total: pods.total, crashloops: pods.crashloops, pending: pods.pending, imagePullErrors: pods.imagePullErrors },
      pvcs: { total: pvcs.total, bound: pvcs.bound, errors: pvcs.errors },
      routes: { total: routes.total },
      criticalEvents: Array.isArray(events) ? events.length : 0,
      suspicions: s.suspicions?.length || 0
    };
  }

  private scoreNamespace(s: { status: string; checks: any; suspicions: any[] }, strategy: 'auto' | 'events' | 'resourcePressure' | 'none') {
    const pods = s.checks?.pods || {};
    const pvcs = s.checks?.pvcs || {};
    const events = s.checks?.events || [];

    // Base weights
    let wCrash = 5, wImage = 4, wPending = 3, wPVC = 4, wEvents = 1, wStatus = 3, wSusp = 2;
    if (strategy === 'events') { wEvents = 5; wCrash = 3; wPending = 2; }
    if (strategy === 'resourcePressure') { wPending = 5; wPVC = 5; wCrash = 4; wEvents = 1; }
    if (strategy === 'none') { wCrash = wImage = wPending = wPVC = wEvents = wStatus = wSusp = 0; }

    const reasons: string[] = [];
    const addReason = (cond: boolean, message: string) => { if (cond) reasons.push(message); };

    const score =
      (pods.crashloops || 0) * wCrash +
      (pods.imagePullErrors || 0) * wImage +
      (pods.pending || 0) * wPending +
      (pvcs.errors || 0) * wPVC +
      (Array.isArray(events) ? events.length : 0) * wEvents +
      (s.status && s.status !== 'healthy' ? 1 : 0) * wStatus +
      (Array.isArray(s.suspicions) ? s.suspicions.length : 0) * wSusp;

    addReason((pods.crashloops || 0) > 0, `crashloops:${pods.crashloops}`);
    addReason((pods.imagePullErrors || 0) > 0, `imagePullErrors:${pods.imagePullErrors}`);
    addReason((pods.pending || 0) > 0, `pending:${pods.pending}`);
    addReason((pvcs.errors || 0) > 0, `pvcErrors:${pvcs.errors}`);
    addReason((Array.isArray(events) ? events.length : 0) > 0, `events:${events.length}`);
    addReason(s.status !== 'healthy', `status:${s.status}`);
    addReason((Array.isArray(s.suspicions) ? s.suspicions.length : 0) > 0, `suspicions:${s.suspicions.length}`);

    return { score, reasons };
  }

  private async listNamespacesByScope(scope: 'all' | 'system' | 'user'): Promise<string[]> {
    const namespacesData = await this.ocWrapperV2.executeOc(['get', 'namespaces', '-o', 'json']);
    const namespaces = JSON.parse(namespacesData.stdout);
    const names = (namespaces.items || []).map((ns: any) => ns.metadata?.name).filter((n: any) => !!n);
    if (scope === 'system') return names.filter((n: string) => n.startsWith('kube-') || n.startsWith('openshift-'));
    if (scope === 'user') return names.filter((n: string) => !n.startsWith('kube-') && !n.startsWith('openshift-'));
    return names;
  }

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
        timestamp: nowEpoch(),
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

  /**
   * Enhanced pod health with dependency analysis
   */
  private async enhancedPodHealth(args: {
    sessionId: string;
    namespace: string;
    podName: string;
    includeDependencies?: boolean;
    includeResourceAnalysis?: boolean;
  }): Promise<string> {
    const { sessionId, namespace, podName, includeDependencies = true, includeResourceAnalysis = true } = args;

    try {
      // Get pod details using v2 wrapper
      const podData = await this.ocWrapperV2.executeOc(['get', 'pod', podName, '-o', 'json'], { namespace });
      const pod = JSON.parse(podData.stdout);

      // Analyze pod health
      const podAnalysis = this.analyzePodDetails(pod);
      
      // Optional dependency analysis
      let dependencies = null;
      if (includeDependencies) {
        dependencies = await this.analyzePodDependencies(namespace, podName);
      }

      // Optional resource analysis
      let resourceAnalysis = null;
      if (includeResourceAnalysis) {
        resourceAnalysis = await this.analyzePodResources(pod);
      }

      const response = {
        tool: 'oc_diagnostic_pod_health',
        sessionId,
        namespace,
        podName,
        timestamp: nowIso(),
        
        health: podAnalysis,
        dependencies,
        resources: resourceAnalysis,
        
        recommendations: this.generatePodRecommendations(podAnalysis, dependencies, resourceAnalysis),
        
        human: this.generatePodHealthSummary(podName, podAnalysis, dependencies)
      };

      // Normalize for schema compatibility
      const normalized = this.normalizePodHealthOutput(response);

      // Store pod health check
      await this.memoryManager.storeOperational({
        incidentId: `pod-health-${sessionId}`,
        domain: 'cluster',
        timestamp: nowEpoch(),
        symptoms: podAnalysis.issues.length > 0 ? podAnalysis.issues : ['pod_healthy'],
        affectedResources: [`pod/${podName}`, `namespace/${namespace}`],
        diagnosticSteps: ['Enhanced pod health check completed'],
        tags: ['pod_health', 'diagnostic', namespace, podName],
        environment: 'prod'
      });

      return JSON.stringify(normalized, null, 2);

    } catch (error) {
      return this.formatErrorResponse('pod health check', error, sessionId);
    }
  }

  // Helper methods for enhanced analysis

  private normalizeTimestamp(ts: any): string {
    if (typeof ts === 'string') return ts;
    if (typeof ts === 'number') {
      try { return new Date(ts).toISOString(); } catch {}
    }
    return new Date().toISOString();
  }

  private normalizeNamespaceHealthOutput(resp: any): any {
    const out = { ...resp };
    out.timestamp = this.normalizeTimestamp(out.timestamp);
    // Ensure summary exists and types are stable
    out.summary = out.summary || {};
    const podsReady = String(out.summary.pods ?? '0/0 ready');
    const pvcsBound = String(out.summary.pvcs ?? '0/0 bound');
    const routes = String(out.summary.routes ?? '0 configured');
    const critical = Number(
      typeof out.summary.criticalEvents === 'number' ? out.summary.criticalEvents : 0
    );
    out.summary = {
      pods: podsReady,
      pvcs: pvcsBound,
      routes,
      criticalEvents: Number.isFinite(critical) ? critical : 0
    };
    return out;
  }

  private normalizePodHealthOutput(resp: any): any {
    const out = { ...resp };
    out.timestamp = this.normalizeTimestamp(out.timestamp);
    const deps = out.dependencies;
    if (deps && !Array.isArray(deps) && typeof deps === 'object') {
      // ok
    } else if (Array.isArray(deps)) {
      out.dependencies = { items: deps };
    } else if (deps == null) {
      out.dependencies = null;
    } else {
      out.dependencies = { value: deps };
    }
    const res = out.resources;
    if (res && !Array.isArray(res) && typeof res === 'object') {
      // ok
    } else if (Array.isArray(res)) {
      out.resources = { items: res };
    } else if (res == null) {
      out.resources = null;
    } else {
      out.resources = { value: res };
    }
    return out;
  }

  private async analyzeNodeHealth() {
    try {
      const nodesData = await this.ocWrapperV2.executeOc(['get', 'nodes', '-o', 'json']);
      const nodes = JSON.parse(nodesData.stdout);
      
      return {
        total: nodes.items.length,
        ready: nodes.items.filter((node: any) => 
          node.status.conditions.some((c: any) => c.type === 'Ready' && c.status === 'True')
        ).length,
        issues: nodes.items.filter((node: any) => 
          node.status.conditions.some((c: any) => c.type === 'Ready' && c.status !== 'True')
        ).map((node: any) => node.metadata.name)
      };
    } catch (error) {
      return { total: 0, ready: 0, issues: [`Failed to get node status: ${error}`] };
    }
  }

  private async analyzeOperatorHealth() {
    try {
      const operatorsData = await this.ocWrapperV2.executeOc(['get', 'clusteroperators', '-o', 'json']);
      const operators = JSON.parse(operatorsData.stdout);
      
      return {
        total: operators.items.length,
        degraded: operators.items.filter((op: any) =>
          op.status.conditions.some((c: any) => c.type === 'Degraded' && c.status === 'True')
        ).map((op: any) => op.metadata.name)
      };
    } catch (error) {
      return { total: 0, degraded: [`Failed to get operator status: ${error}`] };
    }
  }

  private async analyzeSystemNamespaces() {
    try {
      // Discover all namespaces and include system namespaces (kube-*, openshift-*)
      const nsData = await this.ocWrapperV2.executeOc(['get', 'namespaces', '-o', 'json']);
      const nsJson = JSON.parse(nsData.stdout);

      const systemNs: string[] = (nsJson.items || [])
        .map((n: any) => n.metadata?.name)
        .filter((name: string) => !!name)
        .filter((name: string) => name.startsWith('kube-') || name.startsWith('openshift-'))
        .sort();

      const results: any[] = [];
      for (const ns of systemNs) {
        try {
          const health = await this.namespaceHealthChecker.checkHealth({ namespace: ns });
          results.push({
            namespace: ns,
            status: health.status,
            issues: health.suspicions.length
          });
        } catch (error) {
          results.push({ namespace: ns, status: 'error', issues: 1 });
        }
      }

      return results;
    } catch (error) {
      return [{ namespace: 'system', status: 'error', issues: 1, note: `Failed to list namespaces: ${error}` }];
    }
  }

  private async analyzeUserNamespaces(maxCount: number) {
    try {
      const namespacesData = await this.ocWrapperV2.executeOc(['get', 'namespaces', '-o', 'json']);
      const namespaces = JSON.parse(namespacesData.stdout);
      
      const userNamespaces = namespaces.items
        .filter((ns: any) => !ns.metadata.name.startsWith('openshift-') &&
                             !ns.metadata.name.startsWith('kube-'))
        .slice(0, maxCount);

      const results = [];
      for (const ns of userNamespaces) {
        try {
          const health = await this.namespaceHealthChecker.checkHealth({ 
            namespace: ns.metadata.name 
          });
          results.push({
            namespace: ns.metadata.name,
            status: health.status,
            podCount: health.checks.pods.total,
            issues: health.suspicions.length
          });
        } catch (error) {
          results.push({
            namespace: ns.metadata.name,
            status: 'error',
            issues: 1
          });
        }
      }

      return results;
    } catch (error) {
      return [`Failed to analyze user namespaces: ${error}`];
    }
  }

  private calculateOverallHealth(nodeHealth: any, operatorHealth: any, systemHealth: any): string {
    if (nodeHealth.issues.length > 0 || operatorHealth.degraded.length > 0) {
      return 'failing';
    }
    
    const systemIssues = systemHealth.filter((ns: any) => ns.status !== 'healthy').length;
    if (systemIssues > 0) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  private generateClusterRecommendations(nodeHealth: any, operatorHealth: any, systemHealth: any): string[] {
    const recommendations = [];
    
    if (nodeHealth.issues.length > 0) {
      recommendations.push(`Check node issues: oc describe node ${nodeHealth.issues[0]}`);
    }
    
    if (operatorHealth.degraded.length > 0) {
      recommendations.push(`Check degraded operators: oc get clusteroperator ${operatorHealth.degraded[0]} -o yaml`);
    }
    
    const failingSystemNs = systemHealth.filter((ns: any) => ns.status === 'failing');
    if (failingSystemNs.length > 0) {
      recommendations.push(`Check system namespace: oc get pods -n ${failingSystemNs[0].namespace}`);
    }
    
    return recommendations.slice(0, 3); // Top 3 recommendations
  }

  private generateNamespaceNextActions(healthResult: any): string[] {
    const actions = [];
    
    if (healthResult.checks.pods.crashloops.length > 0) {
      actions.push(`Check crashloop logs: oc logs ${healthResult.checks.pods.crashloops[0]} -n ${healthResult.namespace} --previous`);
    }
    
    if (healthResult.checks.pods.imagePullErrors.length > 0) {
      actions.push(`Check image pull issues: oc describe pod ${healthResult.checks.pods.imagePullErrors[0]} -n ${healthResult.namespace}`);
    }
    
    if (healthResult.checks.pvcs.pending > 0) {
      actions.push(`Check PVC status: oc get pvc -n ${healthResult.namespace}`);
    }
    
    return actions.slice(0, 3);
  }

  private async performDeepNamespaceAnalysis(namespace: string) {
    // Placeholder for deep analysis - can be enhanced with resource quotas, network policies, etc.
    return {
      resourceQuotas: await this.checkResourceQuotas(namespace),
      networkPolicies: await this.checkNetworkPolicies(namespace),
      secrets: await this.checkSecrets(namespace)
    };
  }

  private async checkResourceQuotas(namespace: string) {
    try {
      const quotaData = await this.ocWrapperV2.executeOc(['get', 'resourcequota', '-o', 'json'], { namespace });
      return JSON.parse(quotaData.stdout).items.length;
    } catch {
      return 0;
    }
  }

  private async checkNetworkPolicies(namespace: string) {
    try {
      const npData = await this.ocWrapperV2.executeOc(['get', 'networkpolicy', '-o', 'json'], { namespace });
      return JSON.parse(npData.stdout).items.length;
    } catch {
      return 0;
    }
  }

  private async checkSecrets(namespace: string) {
    try {
      const secretData = await this.ocWrapperV2.executeOc(['get', 'secrets', '-o', 'json'], { namespace });
      return JSON.parse(secretData.stdout).items.length;
    } catch {
      return 0;
    }
  }

  private analyzePodDetails(pod: any) {
    const containerStatuses = pod.status.containerStatuses || [];
    const issues = [];
    
    for (const container of containerStatuses) {
      if (container.state?.waiting) {
        issues.push(`${container.name}: ${container.state.waiting.reason}`);
      }
      if (container.restartCount > 5) {
        issues.push(`${container.name}: High restart count (${container.restartCount})`);
      }
    }
    
    return {
      phase: pod.status.phase,
      ready: containerStatuses.every((c: any) => c.ready),
      restarts: containerStatuses.reduce((sum: number, c: any) => sum + c.restartCount, 0),
      issues
    };
  }

  private async analyzePodDependencies(namespace: string, podName: string) {
    // Placeholder for dependency analysis - services, configmaps, secrets, etc.
    return {
      services: await this.findServicesForPod(namespace, podName),
      configMaps: await this.findConfigMapsForPod(namespace, podName),
      secrets: await this.findSecretsForPod(namespace, podName)
    };
  }

  private async findServicesForPod(namespace: string, podName: string) {
    // Simplified service discovery
    try {
      const servicesData = await this.ocWrapperV2.executeOc(['get', 'services', '-o', 'json'], { namespace });
      const services = JSON.parse(servicesData.stdout);
      return services.items.length;
    } catch {
      return 0;
    }
  }

  private async findConfigMapsForPod(namespace: string, podName: string) {
    // Placeholder - would analyze pod spec for configMap references
    return 0;
  }

  private async findSecretsForPod(namespace: string, podName: string) {
    // Placeholder - would analyze pod spec for secret references  
    return 0;
  }

  private async analyzePodResources(pod: any) {
    const containers = pod.spec.containers || [];
    return {
      containers: containers.length,
      hasResourceLimits: containers.some((c: any) => c.resources?.limits),
      hasResourceRequests: containers.some((c: any) => c.resources?.requests)
    };
  }

  private generatePodRecommendations(analysis: any, dependencies: any, resources: any): string[] {
    const recommendations = [];
    
    if (analysis.issues.length > 0) {
      recommendations.push('Check pod logs and events for specific error details');
    }
    
    if (!resources?.hasResourceLimits) {
      recommendations.push('Consider adding resource limits to prevent resource contention');
    }
    
    if (analysis.restarts > 0) {
      recommendations.push('Investigate causes of pod restarts');
    }
    
    return recommendations;
  }

  private generatePodHealthSummary(podName: string, analysis: any, dependencies: any): string {
    const status = analysis.ready ? 'healthy' : 'unhealthy';
    const issues = analysis.issues.length > 0 ? ` Issues: ${analysis.issues.join(', ')}` : '';
    return `Pod ${podName} is ${status}. Phase: ${analysis.phase}, Restarts: ${analysis.restarts}.${issues}`;
  }

  private formatClusterHealthResponse(healthSummary: any, sessionId: string): string {
    return JSON.stringify({
      tool: 'oc_diagnostic_cluster_health',
      sessionId,
      ...healthSummary,
      human: `Cluster is ${healthSummary.overallHealth}. Nodes: ${healthSummary.nodes.ready}/${healthSummary.nodes.total} ready. Operators: ${healthSummary.operators.degraded.length} degraded.`
    }, null, 2);
  }

  /**
   * Execute RCA checklist workflow
   */
  private async executeRCAChecklist(args: {
    sessionId: string;
    namespace?: string;
    outputFormat?: 'json' | 'markdown';
    includeDeepAnalysis?: boolean;
    maxCheckTime?: number;
  }): Promise<string> {
    const { sessionId, namespace, outputFormat = 'json', includeDeepAnalysis = false, maxCheckTime = 60000 } = args;

    try {
      // Execute RCA checklist using v2 engine
      const checklistArgs = { outputFormat, includeDeepAnalysis, maxCheckTime } as { outputFormat: 'json' | 'markdown'; includeDeepAnalysis: boolean; maxCheckTime: number; namespace?: string };
      if (typeof namespace === 'string') checklistArgs.namespace = namespace;
      const checklistResult = await this.rcaChecklistEngine.executeRCAChecklist(checklistArgs);

      // Store RCA session in operational memory
      await this.memoryManager.storeOperational({
        incidentId: `rca-checklist-${sessionId}`,
        domain: 'cluster',
        timestamp: nowEpoch(),
        symptoms: checklistResult.evidence.symptoms,
        affectedResources: checklistResult.evidence.affectedResources,
        diagnosticSteps: checklistResult.evidence.diagnosticSteps,
        tags: ['rca_checklist', 'systematic_diagnostic', checklistResult.overallStatus, ...(namespace ? [namespace] : ['cluster_wide'])],
        environment: 'prod'
      });

      // Format response with enhanced context
      const response = {
        tool: 'oc_diagnostic_rca_checklist',
        sessionId,
        reportId: checklistResult.reportId,
        timestamp: checklistResult.timestamp,
        duration: `${checklistResult.duration}ms`,
        
        // Core findings
        scope: namespace ? `namespace: ${namespace}` : 'cluster-wide',
        overallStatus: checklistResult.overallStatus,
        
        // Checklist results
        summary: checklistResult.summary,
        checksPerformed: checklistResult.checksPerformed.map(check => ({
          name: check.name,
          status: check.status,
          severity: check.severity,
          findings: check.findings.slice(0, 3), // Limit for readability
          recommendations: check.recommendations.slice(0, 2)
        })),
        
        // Priority actions
        criticalIssues: checklistResult.criticalIssues,
        nextActions: checklistResult.nextActions,
        
        // Evidence for workflow integration
        evidence: checklistResult.evidence,
        
        // Human readable summary
        human: checklistResult.human,
        
        // Markdown report (if requested)
        ...(outputFormat === 'markdown' && { markdown: checklistResult.markdown }),
        
        // Performance metrics
        performance: {
          totalCheckTime: `${checklistResult.duration}ms`,
          checksCompleted: checklistResult.summary.totalChecks,
          averageCheckTime: `${Math.round(checklistResult.duration / Math.max(checklistResult.summary.totalChecks, 1))}ms`
        }
      };

      // Return proper ToolResult object instead of just JSON string
      return JSON.stringify({
        success: true,
        result: response,
        timestamp: new Date().toISOString()
      }, null, 2);

    } catch (error) {
      return this.formatErrorResponse('RCA checklist execution', error, sessionId);
    }
  }

  private formatErrorResponse(operation: string, error: any, sessionId: string): string {
    return JSON.stringify({
      tool: 'diagnostic_error',
      sessionId,
      error: true,
      operation,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      human: `Failed to perform ${operation}: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, null, 2);
  }
}

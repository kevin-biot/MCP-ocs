/**
 * RCA Checklist Tool v2.0
 * 
 * Guided "First 10 Minutes" diagnostic workflow for consistent incident response.
 * Eliminates junior engineer panic and provides structured troubleshooting approach.
 * 
 * Based on real operational patterns:
 * 1. Quick cluster health overview
 * 2. Namespace-specific pod/event analysis  
 * 3. Resource constraint and quota checks
 * 4. Network and connectivity validation
 * 5. Storage and PVC analysis
 * 6. Generate structured findings and next steps
 */

import { OcWrapperV2 } from '../../lib/oc-wrapper-v2.js';
import { nowEpoch } from '../../../utils/time.js';
import { NamespaceHealthChecker } from '../check-namespace-health/index.js';
import { ToolMemoryGateway } from '../../../lib/tools/tool-memory-gateway.js';

export interface RCAChecklistInput {
  namespace?: string;           // Target namespace (optional for cluster-wide)
  outputFormat?: 'json' | 'markdown';
  includeDeepAnalysis?: boolean;
  maxCheckTime?: number;        // Max time for checklist execution (ms)
}

export interface ChecklistItem {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'skipped';
  findings: string[];
  recommendations: string[];
  duration: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RCAChecklistResult {
  reportId: string;
  namespace?: string;
  timestamp: string;
  duration: number;
  
  // Structured findings
  overallStatus: 'healthy' | 'degraded' | 'failing';
  checksPerformed: ChecklistItem[];
  
  // Summary
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  
  // Prioritized actions
  criticalIssues: string[];
  nextActions: string[];
  
  // Evidence for workflow engine
  evidence: {
    symptoms: string[];
    affectedResources: string[];
    diagnosticSteps: string[];
  };
  
  // Output formats
  human: string;
  markdown?: string;

  // Intelligent RCA (Phase 2)
  rootCause?: {
    type: string;            // classification key
    summary: string;         // human-readable root cause
    confidence: number;      // 0..1 confidence score
    evidence: string[];      // distilled evidence
  };
}

export class RCAChecklistEngine {
  private ocWrapper: OcWrapperV2;
  private namespaceHealthChecker: NamespaceHealthChecker;
  private memoryGateway: ToolMemoryGateway;

  constructor(ocWrapper: OcWrapperV2, memoryGateway?: ToolMemoryGateway) {
    this.ocWrapper = ocWrapper;
    this.namespaceHealthChecker = new NamespaceHealthChecker(ocWrapper);
    this.memoryGateway = memoryGateway || new ToolMemoryGateway('./memory');
  }

  /**
   * Execute the complete RCA checklist
   */
  async executeRCAChecklist(input: RCAChecklistInput): Promise<RCAChecklistResult> {
    const startTime = nowEpoch();
    const reportId = `rca-${nowEpoch()}`;
    const { namespace, outputFormat = 'json', includeDeepAnalysis = false, maxCheckTime = 60000 } = input;

    const result: RCAChecklistResult = {
      reportId,
      timestamp: new Date().toISOString(),
      duration: 0,
      overallStatus: 'healthy',
      checksPerformed: [],
      summary: { totalChecks: 0, passed: 0, failed: 0, warnings: 0 },
      criticalIssues: [],
      nextActions: [],
      evidence: { symptoms: [], affectedResources: [], diagnosticSteps: [] },
      human: ''
    };
    if (typeof namespace === 'string') (result as any).namespace = namespace;

    try {
      // Execute checklist with timeout protection
      await Promise.race([
        this.runChecklist(result, namespace, includeDeepAnalysis),
        this.timeoutPromise(maxCheckTime)
      ]);

      // Analyze results and generate summary
      this.analyzeChecklistResults(result);
      this.generateNextActions(result);
      this.generateHumanSummary(result);
      // Derive intelligent root cause from findings
      this.deriveRootCause(result);
      
      if (outputFormat === 'markdown') {
        result.markdown = this.generateMarkdownReport(result);
      }

      result.duration = nowEpoch() - startTime;
      // Persist RCA result via modern memory gateway
      try {
        await this.memoryGateway.storeToolExecution(
          'oc_diagnostic_rca_checklist',
          input,
          result,
          `rca-${startTime}`,
          ['rca_checklist', result.overallStatus, result.rootCause ? `root_cause:${result.rootCause.type}` : 'root_cause:unknown'],
          'openshift',
          'prod',
          result.overallStatus === 'healthy' ? 'low' : (result.overallStatus === 'degraded' ? 'medium' : 'high')
        );
      } catch {
        // Non-fatal if storage unavailable
      }
      return result;

    } catch (error) {
      result.duration = nowEpoch() - startTime;
      result.overallStatus = 'failing';
      result.criticalIssues.push(`RCA checklist failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.human = `RCA checklist failed after ${result.duration}ms: ${error instanceof Error ? error.message : 'Unknown error'}`;
      try {
        await this.memoryGateway.storeToolExecution(
          'oc_diagnostic_rca_checklist',
          input,
          result,
          `rca-${startTime}`,
          ['rca_checklist', 'failure'],
          'openshift',
          'prod',
          'high'
        );
      } catch {}
      return result;
    }
  }

  /**
   * Execute the systematic diagnostic checklist
   */
  private async runChecklist(result: RCAChecklistResult, namespace?: string, deepAnalysis = false): Promise<void> {
    const maxConcurrent = Math.max(1, Number(process.env.OC_RCA_CONCURRENCY || process.env.OC_DIAG_CONCURRENCY || 8));

    // Phase 1: quick global health checks (can run in parallel)
    await this.runWithConcurrency([
      () => this.checkClusterHealth(result),
      () => this.checkNodeHealth(result)
    ], maxConcurrent);

    // Phase 2: namespace-focused checks (choose one path)
    if (namespace) {
      await this.checkNamespaceSpecific(result, namespace, deepAnalysis);
    } else {
      await this.checkCriticalNamespaces(result);
    }

    // Phase 3: broader subsystem checks (parallelizable)
    await this.runWithConcurrency([
      () => this.checkStorageHealth(result, namespace),
      () => this.checkNetworkHealth(result, namespace),
      () => this.checkRecentEvents(result, namespace)
    ], maxConcurrent);

    // Phase 4: deep analysis (optional)
    if (deepAnalysis) {
      await this.checkResourceConstraints(result, namespace);
    }
  }

  private async runWithConcurrency(tasks: Array<() => Promise<void>>, maxConcurrent: number): Promise<void> {
    for (let i = 0; i < tasks.length; i += maxConcurrent) {
      const batch = tasks.slice(i, i + maxConcurrent);
      const settled = await Promise.allSettled(batch.map(fn => fn()));
      // Non-throwing; individual checks already record failures
      void settled;
    }
  }

  /**
   * Check 1: Cluster-level health overview
   */
  private async checkClusterHealth(result: RCAChecklistResult): Promise<void> {
    const checkName = 'Cluster Health Overview';
    const startTime = nowEpoch();
    
    try {
      // Quick cluster connectivity and version check
      const clusterResult = await this.ocWrapper.executeOc(['cluster-info'], { timeout: 5000 });
      const versionResult = await this.ocWrapper.executeOc(['version', '-o', 'json'], { timeout: 5000 });
      
      const versionData = JSON.parse(versionResult.stdout);
      const clusterVersion = versionData.openshiftVersion || versionData.serverVersion?.gitVersion || 'unknown';
      
      const check: ChecklistItem = {
        name: checkName,
        status: 'pass',
        findings: [
          `Cluster accessible and responding`,
          `OpenShift version: ${clusterVersion}`,
          `API server reachable`
        ],
        recommendations: [],
        duration: nowEpoch() - startTime,
        severity: 'low'
      };
      
      result.checksPerformed.push(check);
      result.evidence.diagnosticSteps.push('Cluster connectivity verified');
      
    } catch (error) {
      const check: ChecklistItem = {
        name: checkName,
        status: 'fail',
        findings: [`Cluster connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Check cluster connectivity and authentication', 'Verify KUBECONFIG settings'],
        duration: nowEpoch() - startTime,
        severity: 'critical'
      };
      
      result.checksPerformed.push(check);
      result.evidence.symptoms.push('Cluster connectivity issues');
    }
  }

  /**
   * Check 2: Node capacity and health
   */
  private async checkNodeHealth(result: RCAChecklistResult): Promise<void> {
    const checkName = 'Node Health and Capacity';
    const startTime = nowEpoch();
    
    try {
      const nodesResult = await this.ocWrapper.executeOc(['get', 'nodes', '-o', 'json'], { timeout: 10000 });
      const nodes = JSON.parse(nodesResult.stdout);
      
      const nodeAnalysis = this.analyzeNodeHealth(nodes);
      
      const check: ChecklistItem = {
        name: checkName,
        status: nodeAnalysis.readyNodes === nodeAnalysis.totalNodes ? 'pass' : 'fail',
        findings: [
          `Nodes: ${nodeAnalysis.readyNodes}/${nodeAnalysis.totalNodes} ready`,
          ...nodeAnalysis.issues
        ],
        recommendations: nodeAnalysis.issues.length > 0 ? [
          'Check node conditions: oc describe node <node-name>',
          'Verify node resource availability'
        ] : [],
        duration: nowEpoch() - startTime,
        severity: nodeAnalysis.issues.length > 0 ? 'high' : 'low'
      };
      
      result.checksPerformed.push(check);
      
      if (nodeAnalysis.issues.length > 0) {
        result.evidence.symptoms.push('Node health issues detected');
        result.evidence.affectedResources.push(...nodeAnalysis.affectedNodes.map(n => `node/${n}`));
      }
      
    } catch (error) {
      const check: ChecklistItem = {
        name: checkName,
        status: 'fail',
        findings: [`Node health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Verify cluster access permissions for node information'],
        duration: nowEpoch() - startTime,
        severity: 'high'
      };
      
      result.checksPerformed.push(check);
    }
  }

  /**
   * Check 3: Namespace-specific analysis
   */
  private async checkNamespaceSpecific(result: RCAChecklistResult, namespace: string, deepAnalysis: boolean): Promise<void> {
    const checkName = `Namespace Health: ${namespace}`;
    const startTime = nowEpoch();
    
    try {
      // Use our comprehensive namespace health checker
      const healthResult = await this.namespaceHealthChecker.checkHealth({
        namespace,
        includeIngressTest: true,
        maxLogLinesPerPod: deepAnalysis ? 20 : 0
      });
      
      const check: ChecklistItem = {
        name: checkName,
        status: healthResult.status === 'healthy' ? 'pass' : 
                healthResult.status === 'degraded' ? 'warning' : 'fail',
        findings: [
          `Namespace status: ${healthResult.status}`,
          `Pods: ${healthResult.checks.pods.ready}/${healthResult.checks.pods.total} ready`,
          `PVCs: ${healthResult.checks.pvcs.bound}/${healthResult.checks.pvcs.total} bound`,
          `Routes: ${healthResult.checks.routes.total} configured`,
          ...healthResult.suspicions.slice(0, 3)
        ],
        recommendations: healthResult.suspicions.length > 0 ? [
          'Review namespace-specific issues identified above',
          'Check pod logs for crashloop pods',
          'Verify PVC and storage configuration'
        ] : [],
        duration: nowEpoch() - startTime,
        severity: healthResult.status === 'failing' ? 'critical' : 
                 healthResult.status === 'degraded' ? 'medium' : 'low'
      };
      
      result.checksPerformed.push(check);
      
      // Add evidence from namespace analysis
      result.evidence.symptoms.push(...healthResult.suspicions);
      result.evidence.affectedResources.push(`namespace/${namespace}`);
      
      if (healthResult.checks.pods.crashloops.length > 0) {
        result.evidence.affectedResources.push(...healthResult.checks.pods.crashloops.map((p: string) => `pod/${p}`));
      }
      
    } catch (error) {
      const check: ChecklistItem = {
        name: checkName,
        status: 'fail',
        findings: [`Namespace analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Verify namespace exists and is accessible'],
        duration: nowEpoch() - startTime,
        severity: 'high'
      };
      
      result.checksPerformed.push(check);
    }
  }

  /**
   * Check 4: Storage health analysis
   */
  private async checkStorageHealth(result: RCAChecklistResult, namespace?: string): Promise<void> {
    const checkName = 'Storage and PVC Health';
    const startTime = nowEpoch();
    
    try {
      // Check storage classes
      const storageClassResult = await this.ocWrapper.executeOc(['get', 'storageclass', '-o', 'json'], { timeout: 5000 });
      const storageClasses = JSON.parse(storageClassResult.stdout);
      
      const defaultSC = storageClasses.items.find((sc: any) => 
        sc.metadata.annotations?.['storageclass.kubernetes.io/is-default-class'] === 'true'
      );
      
      // Check PVCs (cluster-wide or namespace-specific)
      const pvcArgs = namespace ? 
        ['get', 'pvc', '-o', 'json'] : 
        ['get', 'pvc', '-A', '-o', 'json'];
        
      const pvcResult = await this.ocWrapper.executeOc(pvcArgs, namespace ? { namespace } : {});
      const pvcs = JSON.parse(pvcResult.stdout);
      
      const pvcAnalysis = this.analyzePVCHealth(pvcs);
      
      const check: ChecklistItem = {
        name: checkName,
        status: pvcAnalysis.pendingPVCs === 0 ? 'pass' : 'warning',
        findings: [
          `Storage classes: ${storageClasses.items.length} available`,
          `Default storage class: ${defaultSC ? defaultSC.metadata.name : 'NONE (issue!)'}`,
          `PVCs: ${pvcAnalysis.boundPvc}/${pvcAnalysis.totalPVCs} bound`,
          `Pending PVCs: ${pvcAnalysis.pendingPVCs}`,
          ...pvcAnalysis.issues.slice(0, 3)
        ],
        recommendations: pvcAnalysis.pendingPVCs > 0 ? [
          'Check pending PVC details: oc describe pvc -A',
          'Verify storage class configuration: oc get sc',
          'Check storage provisioner status'
        ] : [],
        duration: nowEpoch() - startTime,
        severity: pvcAnalysis.pendingPVCs > 0 ? 'medium' : 'low'
      };
      
      result.checksPerformed.push(check);
      
      if (pvcAnalysis.pendingPVCs > 0) {
        result.evidence.symptoms.push('Storage binding issues detected');
      }
      
    } catch (error) {
      const check: ChecklistItem = {
        name: checkName,
        status: 'fail',
        findings: [`Storage health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Check RBAC permissions for storage resources'],
        duration: nowEpoch() - startTime,
        severity: 'medium'
      };
      
      result.checksPerformed.push(check);
    }
  }

  /**
   * Check 5: Network connectivity and service health
   */
  private async checkNetworkHealth(result: RCAChecklistResult, namespace?: string): Promise<void> {
    const checkName = 'Network and Service Health';
    const startTime = nowEpoch();
    
    try {
      // Check services and endpoints
      const servicesArgs = namespace ? 
        ['get', 'services', '-o', 'json'] : 
        ['get', 'services', '-A', '-o', 'json'];
        
      const servicesResult = await this.ocWrapper.executeOc(servicesArgs, namespace ? { namespace } : {});
      const services = JSON.parse(servicesResult.stdout);
      
      // Fetch endpoints to validate service backends
      const endpointsArgs = namespace ?
        ['get', 'endpoints', '-o', 'json'] :
        ['get', 'endpoints', '-A', '-o', 'json'];
      const endpointsResult = await this.ocWrapper.executeOc(endpointsArgs, namespace ? { namespace } : {});
      const endpoints = JSON.parse(endpointsResult.stdout);
      
      // Check routes (OpenShift specific)
      let routes = { items: [] };
      try {
        const routesArgs = namespace ? 
          ['get', 'routes', '-o', 'json'] : 
          ['get', 'routes', '-A', '-o', 'json'];
          
        const routesResult = await this.ocWrapper.executeOc(routesArgs, namespace ? { namespace } : {});
        routes = JSON.parse(routesResult.stdout);
      } catch {
        // Routes not available (vanilla Kubernetes)
      }
      
      const networkAnalysis = this.analyzeNetworkHealth(services, routes, endpoints);
      
      const check: ChecklistItem = {
        name: checkName,
        status: networkAnalysis.issues.length === 0 ? 'pass' : 'warning',
        findings: [
          `Services: ${networkAnalysis.totalServices} configured`,
          `Routes: ${networkAnalysis.totalRoutes} configured`,
          `Services without endpoints: ${networkAnalysis.servicesWithoutEndpoints}`,
          ...networkAnalysis.issues.slice(0, 3)
        ],
        recommendations: networkAnalysis.issues.length > 0 ? [
          'Check service endpoints: oc get endpoints',
          'Verify pod readiness and labels',
          'Test route connectivity if applicable'
        ] : [],
        duration: nowEpoch() - startTime,
        severity: networkAnalysis.servicesWithoutEndpoints > 0 ? 'medium' : 'low'
      };
      
      result.checksPerformed.push(check);
      
      if (networkAnalysis.issues.length > 0) {
        result.evidence.symptoms.push('Network connectivity issues detected');
      }
      
    } catch (error) {
      const check: ChecklistItem = {
        name: checkName,
        status: 'fail',
        findings: [`Network health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Check network access and RBAC permissions'],
        duration: nowEpoch() - startTime,
        severity: 'medium'
      };
      
      result.checksPerformed.push(check);
    }
  }

  /**
   * Check 6: Recent events analysis
   */
  private async checkRecentEvents(result: RCAChecklistResult, namespace?: string): Promise<void> {
    const checkName = 'Recent Events Analysis';
    const startTime = nowEpoch();
    
    try {
      // Get recent warning/error events
      const eventsArgs = namespace ? 
        ['get', 'events', '--field-selector=type!=Normal', '-o', 'json'] :
        ['get', 'events', '-A', '--field-selector=type!=Normal', '-o', 'json'];
        
      const eventsResult = await this.ocWrapper.executeOc(eventsArgs, namespace ? { namespace } : {});
      const events = JSON.parse(eventsResult.stdout);
      
      const eventAnalysis = this.analyzeRecentEvents(events);
      
      const check: ChecklistItem = {
        name: checkName,
        status: eventAnalysis.criticalEvents === 0 ? 'pass' : 'warning',
        findings: [
          `Recent events: ${eventAnalysis.totalEvents} warning/error events`,
          `Critical events: ${eventAnalysis.criticalEvents}`,
          `Most common: ${eventAnalysis.commonPatterns.slice(0, 3).join(', ')}`,
          ...eventAnalysis.topEvents.slice(0, 3)
        ],
        recommendations: eventAnalysis.criticalEvents > 0 ? [
          'Review recent critical events for patterns',
          'Check involved objects for event clusters',
          'Correlate events with pod/deployment changes'
        ] : [],
        duration: nowEpoch() - startTime,
        severity: eventAnalysis.criticalEvents > 5 ? 'high' : 
                 eventAnalysis.criticalEvents > 0 ? 'medium' : 'low'
      };
      
      result.checksPerformed.push(check);
      
      if (eventAnalysis.criticalEvents > 0) {
        result.evidence.symptoms.push(...eventAnalysis.topEvents.slice(0, 2));
      }
      
    } catch (error) {
      const check: ChecklistItem = {
        name: checkName,
        status: 'fail',
        findings: [`Events analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Check event access permissions'],
        duration: nowEpoch() - startTime,
        severity: 'low'
      };
      
      result.checksPerformed.push(check);
    }
  }

  /**
   * Check critical system namespaces
   */
  private async checkCriticalNamespaces(result: RCAChecklistResult): Promise<void> {
    const criticalNamespaces = ['openshift-apiserver', 'openshift-etcd', 'openshift-kube-apiserver'];
    
    for (const ns of criticalNamespaces) {
      try {
        const healthResult = await this.namespaceHealthChecker.checkHealth({ namespace: ns });
        
        if (healthResult.status !== 'healthy') {
          const check: ChecklistItem = {
            name: `Critical Namespace: ${ns}`,
            status: healthResult.status === 'degraded' ? 'warning' : 'fail',
            findings: [
              `Status: ${healthResult.status}`,
              ...healthResult.suspicions.slice(0, 2)
            ],
            recommendations: [
              `Check ${ns} pod status: oc get pods -n ${ns}`,
              `Review ${ns} events: oc get events -n ${ns}`
            ],
            duration: 0,
            severity: healthResult.status === 'failing' ? 'critical' : 'high'
          };
          
          result.checksPerformed.push(check);
          result.evidence.symptoms.push(`Critical namespace ${ns} is ${healthResult.status}`);
        }
      } catch (error) {
        // Skip if namespace doesn't exist or not accessible
      }
    }
  }

  /**
   * Check 7: Resource constraints and quotas (deep analysis)
   */
  private async checkResourceConstraints(result: RCAChecklistResult, namespace?: string): Promise<void> {
    const checkName = 'Resource Constraints and Quotas';
    const startTime = nowEpoch();
    
    try {
      // Check resource quotas
      const quotaArgs = namespace ? 
        ['get', 'resourcequota', '-o', 'json'] : 
        ['get', 'resourcequota', '-A', '-o', 'json'];
        
      const quotaResult = await this.ocWrapper.executeOc(quotaArgs, namespace ? { namespace } : {});
      const quotas = JSON.parse(quotaResult.stdout);
      
      // Check limit ranges
      const limitsArgs = namespace ? 
        ['get', 'limitrange', '-o', 'json'] : 
        ['get', 'limitrange', '-A', '-o', 'json'];
        
      const limitsResult = await this.ocWrapper.executeOc(limitsArgs, namespace ? { namespace } : {});
      const limits = JSON.parse(limitsResult.stdout);
      
      const resourceAnalysis = this.analyzeResourceConstraints(quotas, limits);
      
      const check: ChecklistItem = {
        name: checkName,
        status: resourceAnalysis.constraintsViolated === 0 ? 'pass' : 'warning',
        findings: [
          `Resource quotas: ${resourceAnalysis.totalQuotas} configured`,
          `Limit ranges: ${resourceAnalysis.totalLimits} configured`,
          `Quota violations: ${resourceAnalysis.constraintsViolated}`,
          ...resourceAnalysis.issues.slice(0, 3)
        ],
        recommendations: resourceAnalysis.constraintsViolated > 0 ? [
          'Review quota usage: oc describe quota',
          'Check pod resource requests and limits',
          'Consider adjusting resource quotas if needed'
        ] : [],
        duration: nowEpoch() - startTime,
        severity: resourceAnalysis.constraintsViolated > 0 ? 'medium' : 'low'
      };
      
      result.checksPerformed.push(check);
      
      if (resourceAnalysis.constraintsViolated > 0) {
        result.evidence.symptoms.push('Resource quota constraints detected');
      }
      
    } catch (error) {
      const check: ChecklistItem = {
        name: checkName,
        status: 'fail',
        findings: [`Resource constraints check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Check RBAC permissions for quota and limit resources'],
        duration: nowEpoch() - startTime,
        severity: 'low'
      };
      
      result.checksPerformed.push(check);
    }
  }

  // Analysis helper methods

  private analyzeNodeHealth(nodes: any) {
    const totalNodes = nodes.items.length;
    let readyNodes = 0;
    const issues: string[] = [];
    const affectedNodes: string[] = [];

    for (const node of nodes.items) {
      const conditions = node.status?.conditions || [];
      const readyCondition = conditions.find((c: any) => c.type === 'Ready');
      
      if (readyCondition?.status === 'True') {
        readyNodes++;
      } else {
        issues.push(`Node ${node.metadata.name} not ready: ${readyCondition?.reason || 'Unknown'}`);
        affectedNodes.push(node.metadata.name);
      }
      
      // Check for other concerning conditions
      const concerningConditions = ['MemoryPressure', 'DiskPressure', 'PIDPressure'];
      for (const condType of concerningConditions) {
        const condition = conditions.find((c: any) => c.type === condType);
        if (condition?.status === 'True') {
          issues.push(`Node ${node.metadata.name} has ${condType}`);
          affectedNodes.push(node.metadata.name);
        }
      }
    }

    return { totalNodes, readyNodes, issues, affectedNodes };
  }

  private analyzePVCHealth(pvcs: any) {
    const totalPVCs = pvcs.items.length;
    let boundPVCs = 0;
    let pendingPVCs = 0;
    const issues: string[] = [];

    for (const pvc of pvcs.items) {
      const name = pvc.metadata.name;
      const phase = pvc.status?.phase;
      
      switch (phase) {
        case 'Bound':
          boundPVCs++;
          break;
        case 'Pending':
          pendingPVCs++;
          issues.push(`PVC ${pvc.metadata.name} pending in ${pvc.metadata.namespace}`);
          break;
        default:
          issues.push(`PVC ${pvc.metadata.name} in unknown state: ${phase}`);
      }
    }

    return { totalPVCs, boundPvc: boundPVCs, pendingPVCs, issues };
  }

  private analyzeNetworkHealth(services: any, routes: any, endpoints: any) {
    const totalServices = services.items.length;
    const totalRoutes = routes.items.length;
    let servicesWithoutEndpoints = 0;
    const issues: string[] = [];

    // Build endpoint index by namespace/name
    const epIndex = new Map<string, any>();
    for (const ep of (endpoints.items || [])) {
      const key = `${ep.metadata?.namespace || ''}/${ep.metadata?.name || ''}`;
      epIndex.set(key, ep);
    }
    
    for (const svc of (services.items || [])) {
      const ns = svc.metadata?.namespace || '';
      const name = svc.metadata?.name || '';
      const key = `${ns}/${name}`;
      const ep = epIndex.get(key);
      const subsets = ep?.subsets || [];
      const addresses = subsets.flatMap((s: any) => s.addresses || []);
      if (!ep || addresses.length === 0) {
        servicesWithoutEndpoints++;
        issues.push(`Service ${ns}/${name} has no active endpoints`);
      }
    }
    
    return { totalServices, totalRoutes, servicesWithoutEndpoints, issues };
  }

  private analyzeRecentEvents(events: any, context?: { quotaIssues?: string[] }) {
    const items = events.items || [];
    const totalEvents = items.length;

    // Expanded patterns
    const criticalReasons = [
      'Failed', 'Error', 'FailedMount', 'FailedScheduling', 'BackOff', 'ImagePullBackOff',
      'ErrImagePull', 'CrashLoopBackOff', 'OOMKilled', 'Evicted', 'Unhealthy'
    ];
    const criticalEvents = items.filter((e: any) =>
      e.type === 'Warning' && criticalReasons.some(r => (e.reason || '').includes(r))
    ).length;

    // Context-aware hints (e.g., quota issues)
    const commonPatterns = this.extractEventPatterns(items);
    const topEvents = items.slice(0, 5).map((e: any) =>
      `${e.reason}: ${e.involvedObject?.kind}/${e.involvedObject?.name}`
    );

    // Correlate with quota signals if provided
    if (context?.quotaIssues && context.quotaIssues.length > 0) {
      commonPatterns.unshift('ResourceQuotaExceeded');
    }

    return { totalEvents, criticalEvents, commonPatterns, topEvents };
  }

  private analyzeResourceConstraints(quotas: any, limits: any) {
    const totalQuotas = quotas.items.length;
    const totalLimits = limits.items.length;
    let constraintsViolated = 0;
    const issues: string[] = [];

    // Analyze quota utilization
    for (const quota of quotas.items) {
      const status = quota.status;
      if (status?.hard && status?.used) {
        const quotaName = quota.metadata.name;
        const namespace = quota.metadata.namespace;
        
        for (const [resource, hardLimit] of Object.entries(status.hard)) {
          const used = status.used[resource];
          if (used && hardLimit) {
            // Parse resource values (handle units like Mi, Gi, etc.)
            const usedNum = this.parseResourceValue(used as string);
            const hardNum = this.parseResourceValue(hardLimit as string);
            
            if (usedNum && hardNum && usedNum / hardNum > 0.8) {
              constraintsViolated++;
              const percentage = Math.round((usedNum / hardNum) * 100);
              issues.push(`Quota ${quotaName} in ${namespace}: ${resource} at ${percentage}% (${used}/${hardLimit})`);
            }
          }
        }
      }
    }

    return { totalQuotas, totalLimits, constraintsViolated, issues };
  }

  private parseResourceValue(value: string): number | null {
    // Robust parser for Kubernetes resource values
    if (!value || typeof value !== 'string') return null;

    const v = value.trim();

    // CPU: millicores (e.g., 200m) or cores (e.g., 0.5, 1)
    if (/m$/.test(v)) {
      const n = parseFloat(v.slice(0, -1));
      return isNaN(n) ? null : n; // already in millicores
    }
    if (/^\d+(?:\.\d+)?$/.test(v)) {
      // No unit; could be CPU cores or bytes depending on context.
      // For quota parsing, k8s reports plain numbers for CPU as cores.
      // Convert cores to millicores for consistent comparisons.
      const n = parseFloat(v);
      return isNaN(n) ? null : n * 1000;
    }

    // Memory: binary (Ki, Mi, Gi, Ti, Pi, Ei) or decimal (k, K, M, G, T, P, E)
    const memMatch = v.match(/^(\d+(?:\.\d+)?)(Ki|Mi|Gi|Ti|Pi|Ei|k|K|M|G|T|P|E)$/);
    if (memMatch) {
      const numStr = memMatch[1];
      const unit = memMatch[2];
      if (!numStr || !unit) return null;
      const num = parseFloat(numStr);
      const pow2: Record<string, number> = { Ki: 10, Mi: 20, Gi: 30, Ti: 40, Pi: 50, Ei: 60 };
      if (unit in pow2) {
        const exp = pow2[unit];
        if (typeof exp === 'number') return num * Math.pow(2, exp);
      }
      const dec: Record<string, number> = { k: 1e3, K: 1e3, M: 1e6, G: 1e9, T: 1e12, P: 1e15, E: 1e18 };
      if (unit in dec) {
        const mul = dec[unit];
        if (typeof mul === 'number') return num * mul;
      }
    }

    // Fallback: try parse float
    const f = parseFloat(v);
    return isNaN(f) ? null : f;
  }

  private extractEventPatterns(events: any[]): string[] {
    const patternCounts = new Map<string, number>();
    
    for (const event of events) {
      const pattern = String((event as any)?.reason ?? 'unknown');
      patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }
    
    return Array.from(patternCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern, count]) => `${pattern} (${count})`);
  }

  private analyzeChecklistResults(result: RCAChecklistResult): void {
    const { checksPerformed } = result;
    
    result.summary = {
      totalChecks: checksPerformed.length,
      passed: checksPerformed.filter(c => c.status === 'pass').length,
      failed: checksPerformed.filter(c => c.status === 'fail').length,
      warnings: checksPerformed.filter(c => c.status === 'warning').length
    };
    
    // Determine overall status
    if (result.summary.failed > 0) {
      result.overallStatus = 'failing';
    } else if (result.summary.warnings > 0) {
      result.overallStatus = 'degraded';
    } else {
      result.overallStatus = 'healthy';
    }
    
    // Extract critical issues
    result.criticalIssues = checksPerformed
      .filter(c => c.severity === 'critical' || c.status === 'fail')
      .flatMap(c => c.findings);
  }

  /**
   * Derive an intelligent root cause classification from checklist findings
   */
  private deriveRootCause(result: RCAChecklistResult): void {
    const evidence: string[] = [];
    const getCheck = (prefix: string) => result.checksPerformed.find(c => c.name.startsWith(prefix));

    const storage = getCheck('Storage and PVC Health');
    const network = getCheck('Network and Service Health');
    const node = getCheck('Node Health and Capacity');
    const ns = result.checksPerformed.find(c => c.name.startsWith('Namespace Health:'));
    const events = getCheck('Recent Events');

    const storageTxt = storage?.findings?.join(' ') || '';
    const networkTxt = network?.findings?.join(' ') || '';
    const nodeTxt = node?.findings?.join(' ') || '';
    const nsTxt = ns?.findings?.join(' ') || '';
    const eventsTxt = events?.findings?.join(' ') || '';

    // Storage related
    if (/Pending PVCs:\s*[1-9]/i.test(storageTxt)) {
      evidence.push('Pending PVCs detected');
      if (/Default storage class:\s*NONE/i.test(storageTxt)) {
        evidence.push('No default StorageClass');
        result.rootCause = { type: 'storage_no_default_storageclass', summary: 'Missing default StorageClass causing PVCs to remain pending', confidence: 0.9, evidence };
        return;
      }
      // NetworkPolicy blocking provisioner
      if (/NetworkPolicy|denied by policy|blocked by network/i.test(eventsTxt)) {
        evidence.push('Events indicate NetworkPolicy denial');
        result.rootCause = { type: 'storage_provisioner_blocked_by_network_policy', summary: 'NetworkPolicy blocking storage provisioner communication', confidence: 0.85, evidence };
        return;
      }
      if (/FailedMount/i.test(eventsTxt) || /provision/i.test(storageTxt) || /provision/i.test(eventsTxt)) {
        evidence.push('FailedMount/provisioner related evidence');
        result.rootCause = { type: 'storage_provisioner_unreachable', summary: 'Storage provisioner unreachable or misconfigured', confidence: 0.8, evidence };
        return;
      }
      result.rootCause = { type: 'storage_binding_issues', summary: 'PVCs pending due to binding/provisioning issues', confidence: 0.6, evidence };
      return;
    }

    // Services without endpoints
    const svcNoEpMatch = networkTxt.match(/Services without endpoints:\s*(\d+)/i);
    const svcCountStr = svcNoEpMatch?.[1];
    if (svcCountStr && parseInt(svcCountStr, 10) > 0) {
      const count = parseInt(svcCountStr, 10);
      evidence.push(`${count} services without endpoints`);
      result.rootCause = { type: 'service_no_backends', summary: 'Services have no active endpoints (backends not ready or selector mismatch)', confidence: 0.75, evidence };
      return;
    }

    // NetworkPolicy general block (non-storage)
    if (/NetworkPolicy|denied by policy|blocked by network/i.test(eventsTxt)) {
      evidence.push('NetworkPolicy denies traffic');
      result.rootCause = { type: 'network_policy_block', summary: 'Traffic blocked by NetworkPolicy (review ingress/egress rules and labels)', confidence: 0.75, evidence };
      return;
    }

    // Route/TLS certificate failures
    if (/x509|certificate|tls|handshake|verify failed|unknown authority/i.test(eventsTxt)) {
      evidence.push('TLS/certificate errors observed');
      result.rootCause = { type: 'route_tls_failure', summary: 'TLS/certificate issues affecting route/service connectivity', confidence: 0.65, evidence };
      return;
    }

    // Image pull
    if (/ImagePullBackOff|ErrImagePull/i.test(eventsTxt)) {
      evidence.push('Image pull failures');
      result.rootCause = { type: 'image_pull_failures', summary: 'Image registry/credentials problems or image unavailable', confidence: 0.7, evidence };
      return;
    }

    // Crash loops / OOM
    if (/CrashLoopBackOff|OOMKilled/i.test(eventsTxt)) {
      evidence.push('Crash loops or OOMKilled events');
      result.rootCause = { type: 'application_instability', summary: 'Application instability or insufficient resource limits', confidence: 0.65, evidence };
      return;
    }

    // Scheduling/resource pressure
    if (/FailedScheduling|Insufficient/i.test(eventsTxt)) {
      evidence.push('Scheduling failures due to insufficient resources');
      result.rootCause = { type: 'resource_pressure', summary: 'Cluster resource pressure causing scheduling failures', confidence: 0.7, evidence };
      return;
    }

    // Node conditions
    if (/not ready|MemoryPressure|DiskPressure|PIDPressure/i.test(nodeTxt)) {
      evidence.push('Node readiness/pressure issues');
      result.rootCause = { type: 'node_instability', summary: 'Node instability impacting workloads', confidence: 0.7, evidence };
      return;
    }

    // Quota exceeded patterns
    const quotaCheck = result.checksPerformed.find(c => c.name.startsWith('Resource Constraints and Quotas'));
    const quotaTxt = quotaCheck?.findings?.join(' ') || '';
    if (/Quota violations:\s*[1-9]/i.test(quotaTxt) || /exceeded quota|quota exceeded/i.test(eventsTxt)) {
      evidence.push('Resource quota exceeded');
      result.rootCause = { type: 'resource_quota_exceeded', summary: 'ResourceQuota limits reached for namespace/project', confidence: 0.7, evidence };
      return;
    }

    // DNS resolution failures
    if (/no such host|Temporary failure in name resolution|NXDOMAIN|SERVFAIL|i\/o timeout/i.test(eventsTxt)) {
      evidence.push('DNS resolution failures');
      result.rootCause = { type: 'dns_resolution_failure', summary: 'DNS resolution failures affecting service connectivity', confidence: 0.65, evidence };
      return;
    }

    // Probe failures
    if (/Liveness probe failed|Readiness probe failed/i.test(eventsTxt)) {
      evidence.push('Probe failures detected');
      result.rootCause = { type: 'probe_failures', summary: 'Liveness/Readiness probe failures indicating app or dependency issues', confidence: 0.6, evidence };
      return;
    }

    // Namespace health degraded/failing
    if (/Namespace status:\s*(degraded|failing)/i.test(nsTxt)) {
      evidence.push('Namespace degraded/failing');
      result.rootCause = { type: 'namespace_health_degraded', summary: 'Namespace health is degraded; see suspicions/events', confidence: 0.5, evidence };
      return;
    }

    if (result.overallStatus !== 'healthy') {
      result.rootCause = { type: 'unknown', summary: 'Root cause not determined from available signals', confidence: 0.3, evidence };
    }
  }

  private generateNextActions(result: RCAChecklistResult): void {
    const actions = [];
    
    // Priority: Critical failures first
    const criticalChecks = result.checksPerformed.filter(c => c.severity === 'critical');
    for (const check of criticalChecks) {
      actions.push(...check.recommendations.slice(0, 2));
    }
    
    // High severity warnings
    const highSeverityChecks = result.checksPerformed.filter(c => c.severity === 'high');
    for (const check of highSeverityChecks) {
      actions.push(...check.recommendations.slice(0, 1));
    }
    
    // Default action if no specific issues
    if (actions.length === 0 && result.overallStatus !== 'healthy') {
      actions.push('Review detailed findings above for specific recommendations');
    }
    
    result.nextActions = actions.slice(0, 5); // Top 5 actions
  }

  private generateHumanSummary(result: RCAChecklistResult): void {
    const { summary, overallStatus, namespace } = result;
    
    const scopeText = namespace ? `Namespace ${namespace}` : 'Cluster';
    const statusText = overallStatus;
    const checksText = `${summary.passed}/${summary.totalChecks} checks passed`;
    
    let issuesText = '';
    if (summary.failed > 0) {
      issuesText = `, ${summary.failed} critical issues`;
    } else if (summary.warnings > 0) {
      issuesText = `, ${summary.warnings} warnings`;
    }
    
    result.human = `${scopeText} is ${statusText}. ${checksText}${issuesText}. ` +
                   `${result.nextActions.length > 0 ? 'Next: ' + result.nextActions[0] : 'No immediate action required.'}`;
  }

  private generateMarkdownReport(result: RCAChecklistResult): string {
    let markdown = `# RCA Checklist Report\\n\\n`;
    markdown += `**Report ID**: ${result.reportId}\\n`;
    markdown += `**Timestamp**: ${result.timestamp}\\n`;
    markdown += `**Duration**: ${result.duration}ms\\n`;
    markdown += `**Status**: ${result.overallStatus.toUpperCase()}\\n\\n`;
    
    if (result.namespace) {
      markdown += `**Namespace**: ${result.namespace}\\n\\n`;
    }
    
    markdown += `## Summary\\n`;
    markdown += `- **Checks**: ${result.summary.passed}/${result.summary.totalChecks} passed\\n`;
    markdown += `- **Warnings**: ${result.summary.warnings}\\n`;
    markdown += `- **Failures**: ${result.summary.failed}\\n\\n`;

    if (result.rootCause) {
      markdown += `## Root Cause\\n`;
      markdown += `- **Type**: ${result.rootCause.type}\\n`;
      markdown += `- **Summary**: ${result.rootCause.summary}\\n`;
      markdown += `- **Confidence**: ${(Math.round(result.rootCause.confidence * 100))}%\\n`;
      if (Array.isArray(result.rootCause.evidence) && result.rootCause.evidence.length > 0) {
        markdown += `- **Evidence**:\\n`;
        result.rootCause.evidence.slice(0, 5).forEach(e => {
          markdown += `  - ${e}\\n`;
        });
      }
      markdown += `\\n`;
    }
    
    if (result.criticalIssues.length > 0) {
      markdown += `## Critical Issues\\n`;
      result.criticalIssues.forEach(issue => {
        markdown += `- ${issue}\\n`;
      });
      markdown += `\\n`;
    }
    
    if (result.nextActions.length > 0) {
      markdown += `## Next Actions\\n`;
      result.nextActions.forEach((action, index) => {
        markdown += `${index + 1}. ${action}\\n`;
      });
      markdown += `\\n`;
    }
    
    markdown += `## Detailed Findings\\n`;
    result.checksPerformed.forEach(check => {
      const statusIcon = check.status === 'pass' ? '✅' : 
                        check.status === 'warning' ? '⚠️' : '❌';
      markdown += `### ${statusIcon} ${check.name}\\n`;
      check.findings.forEach(finding => {
        markdown += `- ${finding}\\n`;
      });
      if (check.recommendations.length > 0) {
        markdown += `**Recommendations**:\\n`;
        check.recommendations.forEach(rec => {
          markdown += `- ${rec}\\n`;
        });
      }
      markdown += `\\n`;
    });
    
    return markdown;
  }

  private async timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`RCA checklist timed out after ${ms}ms`)), ms);
    });
  }
}

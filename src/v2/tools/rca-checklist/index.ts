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
import { NamespaceHealthChecker } from '../check-namespace-health/index.js';

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
}

export class RCAChecklistEngine {
  private ocWrapper: OcWrapperV2;
  private namespaceHealthChecker: NamespaceHealthChecker;

  constructor(ocWrapper: OcWrapperV2) {
    this.ocWrapper = ocWrapper;
    this.namespaceHealthChecker = new NamespaceHealthChecker(ocWrapper);
  }

  /**
   * Execute the complete RCA checklist
   */
  async executeRCAChecklist(input: RCAChecklistInput): Promise<RCAChecklistResult> {
    const startTime = Date.now();
    const reportId = `rca-${Date.now()}`;
    const { namespace, outputFormat = 'json', includeDeepAnalysis = false, maxCheckTime = 60000 } = input;

    const result: RCAChecklistResult = {
      reportId,
      namespace,
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
      
      if (outputFormat === 'markdown') {
        result.markdown = this.generateMarkdownReport(result);
      }

      result.duration = Date.now() - startTime;
      return result;

    } catch (error) {
      result.duration = Date.now() - startTime;
      result.overallStatus = 'failing';
      result.criticalIssues.push(`RCA checklist failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.human = `RCA checklist failed after ${result.duration}ms: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return result;
    }
  }

  /**
   * Execute the systematic diagnostic checklist
   */
  private async runChecklist(result: RCAChecklistResult, namespace?: string, deepAnalysis = false): Promise<void> {
    // Check 1: Cluster-level health overview
    await this.checkClusterHealth(result);
    
    // Check 2: Node capacity and health
    await this.checkNodeHealth(result);
    
    // Check 3: Namespace-specific checks (if namespace provided)
    if (namespace) {
      await this.checkNamespaceSpecific(result, namespace, deepAnalysis);
    } else {
      await this.checkCriticalNamespaces(result);
    }
    
    // Check 4: Storage and PVC health
    await this.checkStorageHealth(result, namespace);
    
    // Check 5: Network connectivity patterns
    await this.checkNetworkHealth(result, namespace);
    
    // Check 6: Recent events and alerts
    await this.checkRecentEvents(result, namespace);
    
    // Check 7: Resource quotas and limits (if deep analysis)
    if (deepAnalysis) {
      await this.checkResourceConstraints(result, namespace);
    }
  }

  /**
   * Check 1: Cluster-level health overview
   */
  private async checkClusterHealth(result: RCAChecklistResult): Promise<void> {
    const checkName = 'Cluster Health Overview';
    const startTime = Date.now();
    
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
        duration: Date.now() - startTime,
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
        duration: Date.now() - startTime,
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
    const startTime = Date.now();
    
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
        duration: Date.now() - startTime,
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
        duration: Date.now() - startTime,
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
    const startTime = Date.now();
    
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
        duration: Date.now() - startTime,
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
        duration: Date.now() - startTime,
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
    const startTime = Date.now();
    
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
        duration: Date.now() - startTime,
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
        duration: Date.now() - startTime,
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
    const startTime = Date.now();
    
    try {
      // Check services and endpoints
      const servicesArgs = namespace ? 
        ['get', 'services', '-o', 'json'] : 
        ['get', 'services', '-A', '-o', 'json'];
        
      const servicesResult = await this.ocWrapper.executeOc(servicesArgs, namespace ? { namespace } : {});
      const services = JSON.parse(servicesResult.stdout);
      
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
      
      const networkAnalysis = this.analyzeNetworkHealth(services, routes);
      
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
        duration: Date.now() - startTime,
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
        duration: Date.now() - startTime,
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
    const startTime = Date.now();
    
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
        duration: Date.now() - startTime,
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
        duration: Date.now() - startTime,
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
    const startTime = Date.now();
    
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
        duration: Date.now() - startTime,
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
        duration: Date.now() - startTime,
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

  private analyzeNetworkHealth(services: any, routes: any) {
    const totalServices = services.items.length;
    const totalRoutes = routes.items.length;
    let servicesWithoutEndpoints = 0;
    const issues: string[] = [];

    // Placeholder for endpoint analysis
    // Would need to check endpoints for each service
    
    return { totalServices, totalRoutes, servicesWithoutEndpoints, issues };
  }

  private analyzeRecentEvents(events: any) {
    const totalEvents = events.items.length;
    const criticalEvents = events.items.filter((e: any) => 
      e.type === 'Warning' && 
      ['Failed', 'Error', 'FailedMount', 'FailedScheduling'].some(reason => 
        e.reason.includes(reason)
      )
    ).length;
    
    const commonPatterns = this.extractEventPatterns(events.items);
    const topEvents = events.items.slice(0, 5).map((e: any) => 
      `${e.reason}: ${e.involvedObject?.kind}/${e.involvedObject?.name}`
    );

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
    // Simple parser for Kubernetes resource values
    if (!value || typeof value !== 'string') return null;
    
    // Handle memory units (Ki, Mi, Gi, Ti)
    const memoryMatch = value.match(/^(\\d+(?:\\.\\d+)?)(Ki|Mi|Gi|Ti|k|M|G|T)?$/);
    if (memoryMatch) {
      const num = parseFloat(memoryMatch[1]);
      const unit = memoryMatch[2] || '';
      
      const multipliers: { [key: string]: number } = {
        'Ki': 1024, 'Mi': 1024 * 1024, 'Gi': 1024 * 1024 * 1024, 'Ti': 1024 * 1024 * 1024 * 1024,
        'k': 1000, 'M': 1000 * 1000, 'G': 1000 * 1000 * 1000, 'T': 1000 * 1000 * 1000 * 1000
      };
      
      return num * (multipliers[unit] || 1);
    }
    
    // Handle CPU units (m for millicores)
    const cpuMatch = value.match(/^(\\d+(?:\\.\\d+)?)m?$/);
    if (cpuMatch) {
      const num = parseFloat(cpuMatch[1]);
      return value.includes('m') ? num : num * 1000; // Convert to millicores
    }
    
    // Plain numbers
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  private extractEventPatterns(events: any[]): string[] {
    const patternCounts = new Map<string, number>();
    
    for (const event of events) {
      const pattern = event.reason;
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
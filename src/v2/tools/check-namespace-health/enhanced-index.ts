/**
 * Enhanced Namespace Health Checker v2.1 with Infrastructure Correlation
 * 
 * Now includes infrastructure correlation to detect zone/storage conflicts
 * that cause pods to remain pending for hours (like tekton-results-postgres)
 */

import { OcWrapperV2 } from '../../lib/oc-wrapper-v2';
import { SharedMemoryManager } from '../../../lib/memory/shared-memory';
import { InfrastructureCorrelationChecker, InfrastructureCorrelationResult } from '../infrastructure-correlation';

export interface EnhancedNamespaceHealthInput {
  namespace: string;
  includeIngressTest?: boolean;
  includeInfrastructureCorrelation?: boolean;
  maxLogLinesPerPod?: number;
  sessionId: string;
}

export interface PodHealthSummary {
  ready: number;
  total: number;
  crashloops: string[];
  pending: string[];
  imagePullErrors: string[];
  oomKilled: string[];
}

export interface PVCHealthSummary {
  bound: number;
  pending: number;
  failed: number;
  total: number;
  errors: string[];
}

export interface RouteHealthSummary {
  total: number;
  reachable?: boolean;
  probe?: {
    url: string;
    code: number;
    message: string;
  };
}

export interface ScaleDownAnalysis {
  isScaleDown: boolean;
  evidence: string[];
  deploymentStatus: {
    total: number;
    scaledToZero: number;
    recentlyScaled: string[];
  };
  scaleDownEvents: string[];
  verdict: 'intentional_scale_down' | 'node_failure' | 'resource_pressure' | 'application_failure' | 'unknown';
}

export interface EnhancedNamespaceHealthResult {
  namespace: string;
  status: 'healthy' | 'degraded' | 'failing';
  checks: {
    pods: PodHealthSummary;
    pvcs: PVCHealthSummary;
    routes: RouteHealthSummary;
    events: string[];
  };
  suspicions: string[];
  infrastructureCorrelation?: {
    enabled: boolean;
    analysis?: InfrastructureCorrelationResult;
    enhancedSuspicions: string[];
    rootCauseCandidate?: string;
  };
  human: string;
  timestamp: string;
  duration: number;
}

export class EnhancedNamespaceHealthChecker {
  constructor(
    private ocWrapper: OcWrapperV2,
    private memoryManager: SharedMemoryManager,
    private infrastructureChecker?: InfrastructureCorrelationChecker
  ) {
    // Initialize infrastructure checker if not provided
    if (!this.infrastructureChecker) {
      this.infrastructureChecker = new InfrastructureCorrelationChecker(ocWrapper, memoryManager);
    }
  }

  /**
   * Enhanced health check with optional infrastructure correlation
   */
  async checkHealth(input: EnhancedNamespaceHealthInput): Promise<EnhancedNamespaceHealthResult> {
    const startTime = Date.now();
    const { namespace, includeIngressTest = false, includeInfrastructureCorrelation = true } = input;

    // Validate namespace exists first
    const namespaceExists = await this.ocWrapper.validateNamespaceExists(namespace);
    if (!namespaceExists) {
      return this.createFailureResult(namespace, 'Namespace does not exist or is not accessible', startTime);
    }

    try {
      // Gather all data concurrently for performance
      const [podsData, eventsData, pvcsData, routesData, deploymentsData] = await Promise.all([
        this.ocWrapper.getPods(namespace),
        this.ocWrapper.getEvents(namespace),
        this.ocWrapper.getPVCs(namespace),
        this.ocWrapper.getRoutes(namespace),
        this.ocWrapper.getDeployments(namespace)
      ]);

      // Analyze each component
      const podHealth = this.analyzePods(podsData);
      const pvcHealth = this.analyzePVCs(pvcsData);
      const routeHealth = await this.analyzeRoutes(routesData, includeIngressTest);
      const criticalEvents = this.analyzeCriticalEvents(eventsData);
      const scaleDownAnalysis = this.analyzeScaleDownPatterns(deploymentsData, eventsData, podHealth);

      // Generate base suspicions
      const baseSuspicions = this.generateSuspicions(podHealth, pvcHealth, routeHealth, criticalEvents, scaleDownAnalysis);

      // NEW: Infrastructure correlation analysis
      let infrastructureCorrelation: any = { enabled: false, enhancedSuspicions: baseSuspicions };
      
      if (includeInfrastructureCorrelation && this.shouldRunInfrastructureCorrelation(podHealth, pvcHealth)) {
        try {
          const infraAnalysis = await this.infrastructureChecker!.checkInfrastructureCorrelation({
            namespace,
            sessionId: input.sessionId,
            focusArea: 'all'
          });

          const enhancedSuspicions = this.enhanceSuspicionsWithInfrastructure(baseSuspicions, infraAnalysis);
          const rootCauseCandidate = this.identifyRootCauseCandidate(infraAnalysis);

          infrastructureCorrelation = {
            enabled: true,
            analysis: infraAnalysis,
            enhancedSuspicions,
            rootCauseCandidate
          };
        } catch (error) {
          console.warn('Infrastructure correlation failed:', error);
          infrastructureCorrelation = {
            enabled: true,
            enhancedSuspicions: [...baseSuspicions, '⚠️ Infrastructure correlation failed - manual analysis may be needed'],
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }

      // Determine overall health status
      const status = this.determineOverallStatus(podHealth, pvcHealth, routeHealth, criticalEvents, scaleDownAnalysis);

      // Generate enhanced human summary
      const human = this.generateEnhancedHumanSummary(
        namespace, 
        status, 
        podHealth, 
        pvcHealth, 
        routeHealth, 
        infrastructureCorrelation.enhancedSuspicions,
        scaleDownAnalysis,
        infrastructureCorrelation.rootCauseCandidate
      );

      const result: EnhancedNamespaceHealthResult = {
        namespace,
        status,
        checks: {
          pods: podHealth,
          pvcs: pvcHealth,
          routes: routeHealth,
          events: criticalEvents
        },
        suspicions: infrastructureCorrelation.enhancedSuspicions,
        infrastructureCorrelation,
        human,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      };

      return result;

    } catch (error) {
      return this.createFailureResult(
        namespace, 
        `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        startTime
      );
    }
  }

  /**
   * Determine if infrastructure correlation should be run
   * Run when we have pending pods or PVC issues that might be infrastructure-related
   */
  private shouldRunInfrastructureCorrelation(podHealth: PodHealthSummary, pvcHealth: PVCHealthSummary): boolean {
    return (
      podHealth.pending.length > 0 ||  // Pending pods might be zone/node issues
      pvcHealth.pending > 0 ||         // Pending PVCs might be storage zone issues  
      podHealth.ready === 0            // No ready pods might be infrastructure issue
    );
  }

  /**
   * Enhance suspicions with infrastructure correlation insights
   * This is where we add the intelligence from zone/storage analysis
   */
  private enhanceSuspicionsWithInfrastructure(
    baseSuspicions: string[], 
    infraAnalysis: InfrastructureCorrelationResult
  ): string[] {
    const enhancedSuspicions = [...baseSuspicions];

    // Priority infrastructure insights
    if (infraAnalysis.summary.hasInfrastructureIssues) {
      // Add infrastructure concerns at the top
      enhancedSuspicions.unshift(`🏗️ INFRASTRUCTURE: ${infraAnalysis.summary.primaryConcern}`);

      // Add specific zone conflict insights
      for (const conflict of infraAnalysis.zoneAnalysis.zoneConflicts) {
        if (conflict.conflictSeverity === 'critical') {
          enhancedSuspicions.unshift(
            `🚨 ZONE CONFLICT: PV ${conflict.pvName} requires zone ${conflict.requiredZone} (unavailable) - this explains pending pods`
          );
        }
      }

      // Add zone availability insights
      const unavailableZones = infraAnalysis.zoneAnalysis.availableZones.filter(z => z.status === 'unavailable');
      if (unavailableZones.length > 0) {
        enhancedSuspicions.unshift(
          `⚠️ ZONE UNAVAILABLE: ${unavailableZones.length} zone(s) scaled to 0 replicas: ${unavailableZones.map(z => z.zone).join(', ')}`
        );
      }
    }

    // Add memory-enhanced insights
    if (infraAnalysis.memoryInsights.similarPatterns.length > 0) {
      const historicalResolutions = infraAnalysis.memoryInsights.historicalResolutions;
      if (historicalResolutions.length > 0) {
        enhancedSuspicions.push(`💡 HISTORICAL INSIGHT: ${historicalResolutions[0]}`);
      }
    }

    // Add infrastructure recommendations
    if (infraAnalysis.zoneAnalysis.infrastructureRecommendations.length > 0) {
      enhancedSuspicions.push(`🔧 RECOMMENDED: ${infraAnalysis.zoneAnalysis.infrastructureRecommendations[0]}`);
    }

    return enhancedSuspicions;
  }

  /**
   * Identify the most likely root cause from infrastructure analysis
   */
  private identifyRootCauseCandidate(infraAnalysis: InfrastructureCorrelationResult): string | undefined {
    // Check for critical zone conflicts first
    const criticalConflicts = infraAnalysis.zoneAnalysis.zoneConflicts.filter(c => c.conflictSeverity === 'critical');
    if (criticalConflicts.length > 0) {
      const conflict = criticalConflicts[0];
      if (conflict) {
        return `Zone scale-down: ${conflict.requiredZone} unavailable for PV ${conflict.pvName}`;
      }
    }

    // Check for zone availability issues
    const unavailableZones = infraAnalysis.zoneAnalysis.availableZones.filter(z => z.status === 'unavailable');
    if (unavailableZones.length > 0) {
      return `Infrastructure scale-down: ${unavailableZones.length} zone(s) with 0 replicas`;
    }

    // Check overall infrastructure health
    if (infraAnalysis.summary.hasInfrastructureIssues && infraAnalysis.summary.confidenceScore > 0.8) {
      return infraAnalysis.summary.primaryConcern;
    }

    return undefined;
  }

  /**
   * Generate enhanced human summary with infrastructure insights
   */
  private generateEnhancedHumanSummary(
    namespace: string,
    status: string,
    pods: PodHealthSummary,
    pvcs: PVCHealthSummary,
    routes: RouteHealthSummary,
    suspicions: string[],
    scaleDownAnalysis: ScaleDownAnalysis,
    rootCauseCandidate?: string
  ): string {
    const parts: string[] = [];

    // Lead with root cause if identified
    if (rootCauseCandidate) {
      parts.push(`🎯 ROOT CAUSE IDENTIFIED: ${rootCauseCandidate}`);
      parts.push(`Namespace ${namespace} is ${status} due to infrastructure issues.`);
    } else if (scaleDownAnalysis.isScaleDown) {
      switch (scaleDownAnalysis.verdict) {
        case 'intentional_scale_down':
          parts.push(`Namespace ${namespace} appears to be intentionally scaled down.`);
          break;
        default:
          parts.push(`Namespace ${namespace} is ${status} with scaling activity detected.`);
      }
    } else {
      parts.push(`Namespace ${namespace} is ${status}.`);
    }

    // Pod summary
    if (pods.total > 0) {
      parts.push(`Pods: ${pods.ready}/${pods.total} ready.`);
      
      if (pods.pending.length > 0 && rootCauseCandidate?.includes('Zone')) {
        parts.push(`${pods.pending.length} pods pending due to zone/storage conflicts.`);
      } else if (pods.pending.length > 0) {
        parts.push(`${pods.pending.length} pods pending - check scheduling constraints.`);
      }
      
      if (pods.crashloops.length > 0) {
        parts.push(`CrashLoopBackOff: ${pods.crashloops.join(', ')}.`);
      }
    }

    // PVC summary with infrastructure context
    if (pvcs.total > 0) {
      parts.push(`Storage: ${pvcs.bound}/${pvcs.total} PVCs bound.`);
      
      if (pvcs.pending > 0 && rootCauseCandidate?.includes('Zone')) {
        parts.push(`${pvcs.pending} PVC(s) pending due to zone availability issues.`);
      } else if (pvcs.pending > 0) {
        parts.push(`${pvcs.pending} PVC(s) pending.`);
      }
    }

    // Top suspicion with infrastructure priority
    if (suspicions.length > 0) {
      const topSuspicion = suspicions[0];
      if (topSuspicion && (topSuspicion.includes('INFRASTRUCTURE') || topSuspicion.includes('ZONE'))) {
        parts.push(`Infrastructure issue: ${topSuspicion.replace(/^[🏗️🚨⚠️]\s*[A-Z\s]+:\s*/, '')}`);
      } else {
        if (topSuspicion) parts.push(`Key issue: ${topSuspicion}`);
      }
    }

    return parts.join(' ');
  }

  // All the original analysis methods remain the same...
  private analyzePods(podsData: any): PodHealthSummary {
    const pods = podsData.items || [];
    
    const summary: PodHealthSummary = {
      ready: 0,
      total: pods.length,
      crashloops: [],
      pending: [],
      imagePullErrors: [],
      oomKilled: []
    };

    for (const pod of pods) {
      const podName = pod.metadata.name;
      const phase = pod.status.phase;
      const containerStatuses = pod.status.containerStatuses || [];

      // Check if pod is ready
      const isReady = containerStatuses.every((container: any) => container.ready === true);
      if (isReady && phase === 'Running') {
        summary.ready++;
      }

      // Analyze container states for issues
      for (const container of containerStatuses) {
        const waitingState = container.state?.waiting;
        const terminatedState = container.state?.terminated;
        
        if (waitingState) {
          const reason = waitingState.reason;
          
          switch (reason) {
            case 'CrashLoopBackOff':
              summary.crashloops.push(podName);
              break;
            case 'ImagePullBackOff':
            case 'ErrImagePull':
              summary.imagePullErrors.push(podName);
              break;
            case 'ContainerCreating':
            case 'PodInitializing':
              if (this.isPodStuckCreating(pod)) {
                summary.pending.push(podName);
              }
              break;
          }
        }

        if (terminatedState?.reason === 'OOMKilled') {
          summary.oomKilled.push(podName);
        }

        // Check restart count for frequent restarts
        if (container.restartCount > 5) {
          if (!summary.crashloops.includes(podName)) {
            summary.crashloops.push(podName);
          }
        }
      }

      // Check for pending pods
      if (phase === 'Pending') {
        summary.pending.push(podName);
      }
    }

    return summary;
  }

  private analyzePVCs(pvcsData: any): PVCHealthSummary {
    const pvcs = pvcsData.items || [];
    
    const summary: PVCHealthSummary = {
      bound: 0,
      pending: 0,
      failed: 0,
      total: pvcs.length,
      errors: []
    };

    for (const pvc of pvcs) {
      const name = pvc.metadata.name;
      const phase = pvc.status?.phase;

      switch (phase) {
        case 'Bound':
          summary.bound++;
          break;
        case 'Pending':
          summary.pending++;
          summary.errors.push(`pvc/${name} pending (${this.getPVCPendingReason(pvc)})`);
          break;
        case 'Failed':
          summary.failed++;
          summary.errors.push(`pvc/${name} failed`);
          break;
        default:
          summary.errors.push(`pvc/${name} unknown status: ${phase}`);
      }
    }

    return summary;
  }

  private async analyzeRoutes(routesData: any, includeConnectivityTest: boolean): Promise<RouteHealthSummary> {
    const routes = routesData.items || [];
    
    const summary: RouteHealthSummary = {
      total: routes.length
    };

    if (includeConnectivityTest && routes.length > 0) {
      const firstRoute = routes[0];
      const host = firstRoute.spec?.host;
      
      if (host) {
        const testUrl = `https://${host}`;
        summary.probe = await this.testRouteConnectivity(testUrl);
        summary.reachable = summary.probe.code < 500;
      }
    }

    return summary;
  }

  private analyzeCriticalEvents(eventsData: any): string[] {
    const events = eventsData.items || [];
    const criticalEvents: string[] = [];

    const cutoffTime = Date.now() - (10 * 60 * 1000); // Last 10 minutes

    for (const event of events) {
      if (event.type !== 'Normal') {
        const raw = event.lastTimestamp || event.eventTime;
        const parsed = new Date(raw);
        const eventTime = parsed.getTime();
        if (isNaN(eventTime)) {
          continue; // skip invalid dates
        }
        if (eventTime > cutoffTime) {
          const reason = event.reason;
          const message = event.message;
          const objectKind = event.involvedObject?.kind;
          const objectName = event.involvedObject?.name;
          
          criticalEvents.push(`${reason}: ${objectKind}/${objectName} - ${message}`);
        }
      }
    }

    return criticalEvents.slice(0, 10);
  }

  private analyzeScaleDownPatterns(
    deploymentsData: any,
    eventsData: any,
    podHealth: PodHealthSummary
  ): ScaleDownAnalysis {
    const deployments = deploymentsData.items || [];
    const events = eventsData.items || [];
    
    const analysis: ScaleDownAnalysis = {
      isScaleDown: false,
      evidence: [],
      deploymentStatus: {
        total: deployments.length,
        scaledToZero: 0,
        recentlyScaled: []
      },
      scaleDownEvents: [],
      verdict: 'unknown'
    };

    // Analyze deployment replica status
    for (const deployment of deployments) {
      const name = deployment.metadata.name;
      const spec = deployment.spec || {};
      const status = deployment.status || {};
      
      const desiredReplicas = spec.replicas || 0;
      const availableReplicas = status.availableReplicas || 0;
      
      if (desiredReplicas === 0) {
        analysis.deploymentStatus.scaledToZero++;
        analysis.evidence.push(`Deployment ${name} intentionally scaled to 0 replicas`);
      }
      
      // resourceVersion is not a timestamp; prefer valid timestamps when available
      const candidateTimestamp =
        deployment.metadata?.creationTimestamp ||
        (deployment.status?.conditions || []).find((c: any) => c?.lastUpdateTime)?.lastUpdateTime ||
        (deployment.status?.conditions || []).find((c: any) => c?.lastTransitionTime)?.lastTransitionTime;
      let lastUpdateTime = NaN;
      if (candidateTimestamp) {
        const d = new Date(candidateTimestamp);
        lastUpdateTime = d.getTime();
      }
      const recentThreshold = Date.now() - (2 * 60 * 60 * 1000);
      
      if (!isNaN(lastUpdateTime) && lastUpdateTime > recentThreshold && desiredReplicas !== availableReplicas) {
        analysis.deploymentStatus.recentlyScaled.push(name);
        analysis.evidence.push(`Deployment ${name} recently modified (desired: ${desiredReplicas}, available: ${availableReplicas})`);
      }
    }

    // Analyze events for scale-down indicators
    const recentEvents = events.filter((event: any) => {
      const raw = event.lastTimestamp || event.eventTime;
      const d = new Date(raw);
      const eventTime = d.getTime();
      const cutoff = Date.now() - (60 * 60 * 1000);
      if (isNaN(eventTime)) return false;
      return eventTime > cutoff;
    });

    for (const event of recentEvents) {
      const reason = event.reason;
      const message = event.message;
      const objectKind = event.involvedObject?.kind;
      const objectName = event.involvedObject?.name;
      
      if (reason === 'ScalingReplicaSet' && message.includes('scaled down')) {
        analysis.scaleDownEvents.push(`${objectKind}/${objectName}: ${message}`);
        analysis.evidence.push(`Scale-down event detected: ${message}`);
      }
      
      if (reason === 'Killing' && objectKind === 'Pod') {
        analysis.scaleDownEvents.push(`Pod termination: ${objectName}`);
        analysis.evidence.push(`Pod ${objectName} was terminated`);
      }
      
      if (reason.includes('NodeNotReady') || reason.includes('NodeUnavailable')) {
        analysis.evidence.push(`Node issue detected: ${message}`);
      }
    }

    analysis.isScaleDown = analysis.deploymentStatus.scaledToZero > 0 || analysis.scaleDownEvents.length > 0;
    
    if (analysis.deploymentStatus.scaledToZero > 0 && analysis.scaleDownEvents.length > 0) {
      analysis.verdict = 'intentional_scale_down';
    } else if (analysis.evidence.some(e => e.includes('NodeNotReady') || e.includes('NodeUnavailable'))) {
      analysis.verdict = 'node_failure';
    } else if (podHealth.total === 0 && analysis.deploymentStatus.total === 0) {
      analysis.verdict = 'resource_pressure';
    } else if (podHealth.total === 0 && analysis.deploymentStatus.total > 0) {
      analysis.verdict = 'application_failure';
    }

    return analysis;
  }

  private generateSuspicions(
    pods: PodHealthSummary,
    pvcs: PVCHealthSummary,
    routes: RouteHealthSummary,
    events: string[],
    scaleDownAnalysis: ScaleDownAnalysis
  ): string[] {
    const suspicions: string[] = [];

    if (pods.crashloops.length > 0) {
      suspicions.push(`${pods.crashloops.length} pod(s) in CrashLoopBackOff - check logs and resource limits`);
    }

    if (pods.imagePullErrors.length > 0) {
      suspicions.push('Image pull failures detected - verify registry access and image names');
    }

    if (pods.oomKilled.length > 0) {
      suspicions.push('OOM kills detected - increase memory limits or optimize application memory usage');
    }

    if (pods.pending.length > 0) {
      suspicions.push('Pods stuck in pending - check node resources and scheduling constraints');
    }

    if (pvcs.pending > 0) {
      const storageClassIssue = pvcs.errors.some(error => error.includes('no storageclass'));
      if (storageClassIssue) {
        suspicions.push('Missing or invalid StorageClass - create default StorageClass or specify in PVC');
      } else {
        suspicions.push('PVC binding issues - check storage provisioner and available capacity');
      }
    }

    if (routes.probe && routes.probe.code >= 500) {
      suspicions.push('Route backend not responding - check pod readiness and service endpoints');
    }

    // Scale-down analysis
    if (scaleDownAnalysis.isScaleDown) {
      switch (scaleDownAnalysis.verdict) {
        case 'intentional_scale_down':
          suspicions.unshift(`🎯 SCALE-DOWN DETECTED: ${scaleDownAnalysis.deploymentStatus.scaledToZero} deployment(s) intentionally scaled to 0`);
          break;
        case 'node_failure':
          suspicions.unshift('🔴 NODE FAILURE: Scale-down appears to be due to node availability issues');
          break;
        case 'resource_pressure':
          suspicions.unshift('⚠️ RESOURCE PRESSURE: Scale-down may be due to resource constraints');
          break;
        default:
          suspicions.unshift('📉 SCALE-DOWN: Detected scaling activity - verify if intentional');
      }
    }

    return suspicions;
  }

  private determineOverallStatus(
    pods: PodHealthSummary,
    pvcs: PVCHealthSummary,
    routes: RouteHealthSummary,
    events: string[],
    scaleDownAnalysis: ScaleDownAnalysis
  ): 'healthy' | 'degraded' | 'failing' {
    if (scaleDownAnalysis.isScaleDown && scaleDownAnalysis.verdict === 'intentional_scale_down') {
      return 'degraded';
    }

    if (pods.total === 0 && pvcs.total === 0) {
      if (scaleDownAnalysis.isScaleDown) {
        return 'degraded';
      }
      return 'failing';
    }

    if (pods.ready === 0 && pods.total > 0) {
      if (scaleDownAnalysis.isScaleDown && scaleDownAnalysis.deploymentStatus.scaledToZero > 0) {
        return 'degraded';
      }
      return 'failing';
    }

    if (pvcs.failed > 0) {
      return 'failing';
    }

    if (pods.crashloops.length > 0 || pods.imagePullErrors.length > 0) {
      return 'degraded';
    }

    if (pvcs.pending > 0) {
      return 'degraded';
    }

    if (pods.ready < pods.total && pods.total > 0) {
      return 'degraded';
    }

    if (routes.probe && routes.probe.code >= 400) {
      return 'degraded';
    }

    return 'healthy';
  }

  // Helper methods
  private createFailureResult(namespace: string, error: string, startTime: number): EnhancedNamespaceHealthResult {
    return {
      namespace,
      status: 'failing',
      checks: {
        pods: { ready: 0, total: 0, crashloops: [], pending: [], imagePullErrors: [], oomKilled: [] },
        pvcs: { bound: 0, pending: 0, failed: 0, total: 0, errors: [] },
        routes: { total: 0 },
        events: []
      },
      suspicions: [error],
      infrastructureCorrelation: { enabled: false, enhancedSuspicions: [error] },
      human: `Namespace ${namespace} health check failed: ${error}`,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    };
  }

  private isPodStuckCreating(pod: any): boolean {
    const creationTime = new Date(pod.metadata.creationTimestamp).getTime();
    const stuckThreshold = 5 * 60 * 1000;
    return Date.now() - creationTime > stuckThreshold;
  }

  private getPVCPendingReason(pvc: any): string {
    const events = pvc.status?.conditions || [];
    for (const condition of events) {
      if (condition.type === 'Pending') {
        return condition.reason || 'unknown reason';
      }
    }
    return 'no storageclass or provisioner unavailable';
  }

  private async testRouteConnectivity(url: string): Promise<{ url: string; code: number; message: string }> {
    try {
      const https = await import('https');
      const http = await import('http');
      
      return new Promise((resolve) => {
        const isHttps = url.startsWith('https');
        const client = isHttps ? https : http;
        
        const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
          resolve({
            url,
            code: res.statusCode || 0,
            message: res.statusMessage || 'OK'
          });
        });
        
        req.on('error', (error) => {
          resolve({
            url,
            code: 0,
            message: error.message
          });
        });
        
        req.on('timeout', () => {
          req.destroy();
          resolve({
            url,
            code: 0,
            message: 'Connection timeout'
          });
        });
        
        req.end();
      });
    } catch (error) {
      return {
        url,
        code: 0,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }
}

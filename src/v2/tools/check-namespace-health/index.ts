/**
 * Namespace Health Checker v2.0
 * 
 * Comprehensive health analysis based on CLI mapping patterns:
 * - Pod status analysis (running, crashloop, pending)
 * - PVC binding validation
 * - Event correlation and pattern detection
 * - Route/Ingress connectivity testing
 * - Intelligent suspicion generation
 */

import { OcWrapperV2 } from '../../lib/oc-wrapper-v2';
import { nowEpoch } from '../../utils/time.js';

export interface NamespaceHealthInput {
  namespace: string;
  includeIngressTest?: boolean;
  maxLogLinesPerPod?: number;
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

export interface NamespaceHealthResult {
  namespace: string;
  status: 'healthy' | 'degraded' | 'failing';
  checks: {
    pods: PodHealthSummary;
    pvcs: PVCHealthSummary;
    routes: RouteHealthSummary;
    events: string[];
  };
  suspicions: string[];
  human: string;
  timestamp: string;
  duration: number;
}

export class NamespaceHealthChecker {
  private ocWrapper: OcWrapperV2;

  constructor(ocWrapper: OcWrapperV2) {
    this.ocWrapper = ocWrapper;
  }

  /**
   * Analyze scale-down patterns to distinguish from application failures
   */
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
      const readyReplicas = status.readyReplicas || 0;
      
      if (desiredReplicas === 0) {
        analysis.deploymentStatus.scaledToZero++;
        analysis.evidence.push(`Deployment ${name} intentionally scaled to 0 replicas`);
      }
      
      // Check for recent scaling activity (validate date fields; resourceVersion is not a timestamp)
      const candidateTimestamp =
        deployment.metadata?.creationTimestamp ||
        (deployment.status?.conditions || []).find((c: any) => c?.lastUpdateTime)?.lastUpdateTime ||
        (deployment.status?.conditions || []).find((c: any) => c?.lastTransitionTime)?.lastTransitionTime;
      let lastUpdateTime = NaN;
      if (candidateTimestamp) {
        const d = new Date(candidateTimestamp);
        lastUpdateTime = d.getTime();
      }
      const recentThreshold = nowEpoch() - (2 * 60 * 60 * 1000); // Last 2 hours
      
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
      const cutoff = nowEpoch() - (60 * 60 * 1000); // Last hour
      if (isNaN(eventTime)) return false;
      return eventTime > cutoff;
    });

    for (const event of recentEvents) {
      const reason = event.reason;
      const message = event.message;
      const objectKind = event.involvedObject?.kind;
      const objectName = event.involvedObject?.name;
      
      // Look for scale-down related events
      if (reason === 'ScalingReplicaSet' && message.includes('scaled down')) {
        analysis.scaleDownEvents.push(`${objectKind}/${objectName}: ${message}`);
        analysis.evidence.push(`Scale-down event detected: ${message}`);
      }
      
      if (reason === 'Killing' && objectKind === 'Pod') {
        analysis.scaleDownEvents.push(`Pod termination: ${objectName}`);
        analysis.evidence.push(`Pod ${objectName} was terminated`);
      }
      
      // Node-related events that might indicate node scaling
      if (reason.includes('NodeNotReady') || reason.includes('NodeUnavailable')) {
        analysis.evidence.push(`Node issue detected: ${message}`);
      }
    }

    // Determine if this is a scale-down scenario
    analysis.isScaleDown = analysis.deploymentStatus.scaledToZero > 0 || analysis.scaleDownEvents.length > 0;
    
    // Determine the verdict based on evidence
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

  /**
   * Perform comprehensive namespace health check with scale-down detection
   */
  async checkHealth(input: NamespaceHealthInput): Promise<NamespaceHealthResult> {
    const startTime = Date.now();
    const { namespace, includeIngressTest = false } = input;

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
        this.ocWrapper.getDeployments(namespace) // Add deployments for scale-down detection
      ]);

      // Analyze each component
      const podHealth = this.analyzePods(podsData);
      const pvcHealth = this.analyzePVCs(pvcsData);
      const routeHealth = await this.analyzeRoutes(routesData, includeIngressTest);
      const criticalEvents = this.analyzeCriticalEvents(eventsData);
      
      // NEW: Analyze scale-down patterns
      const scaleDownAnalysis = this.analyzeScaleDownPatterns(deploymentsData, eventsData, podHealth);

      // Generate suspicions based on findings (include scale-down awareness)
      const suspicions = this.generateSuspicions(podHealth, pvcHealth, routeHealth, criticalEvents, scaleDownAnalysis);

      // Determine overall health status (consider scale-down scenarios)
      const status = this.determineOverallStatus(podHealth, pvcHealth, routeHealth, criticalEvents, scaleDownAnalysis);

      // Generate human-readable summary (include scale-down context)
      const human = this.generateHumanSummary(namespace, status, podHealth, pvcHealth, routeHealth, suspicions, scaleDownAnalysis);

      const result: NamespaceHealthResult = {
        namespace,
        status,
        checks: {
          pods: podHealth,
          pvcs: pvcHealth,
          routes: routeHealth,
          events: criticalEvents
        },
        suspicions,
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
   * Analyze pod health using CLI mapping patterns
   */
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

  /**
   * Analyze PVC health and binding status
   */
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

  /**
   * Analyze routes and optionally test connectivity
   */
  private async analyzeRoutes(routesData: any, includeConnectivityTest: boolean): Promise<RouteHealthSummary> {
    const routes = routesData.items || [];
    
    const summary: RouteHealthSummary = {
      total: routes.length
    };

    if (includeConnectivityTest && routes.length > 0) {
      // Test the first route for connectivity
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

  /**
   * Extract critical events for correlation
   */
  private analyzeCriticalEvents(eventsData: any): string[] {
    const events = eventsData.items || [];
    const criticalEvents: string[] = [];

    // Focus on recent warning/error events
    const cutoffTime = Date.now() - (10 * 60 * 1000); // Last 10 minutes

    for (const event of events) {
      if (event.type !== 'Normal') {
        const eventTime = new Date(event.lastTimestamp || event.eventTime).getTime();
        
        if (eventTime > cutoffTime) {
          const reason = event.reason;
          const message = event.message;
          const objectKind = event.involvedObject?.kind;
          const objectName = event.involvedObject?.name;
          
          criticalEvents.push(`${reason}: ${objectKind}/${objectName} - ${message}`);
        }
      }
    }

    return criticalEvents.slice(0, 10); // Limit to most recent 10
  }

  /**
   * Generate intelligent suspicions based on patterns (including scale-down detection)
   */
  private generateSuspicions(
    pods: PodHealthSummary, 
    pvcs: PVCHealthSummary, 
    routes: RouteHealthSummary, 
    events: string[],
    scaleDownAnalysis: ScaleDownAnalysis
  ): string[] {
    const suspicions: string[] = [];

    // Pod-related suspicions
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

    // PVC-related suspicions
    if (pvcs.pending > 0) {
      const storageClassIssue = pvcs.errors.some(error => error.includes('no storageclass'));
      if (storageClassIssue) {
        suspicions.push('Missing or invalid StorageClass - create default StorageClass or specify in PVC');
      } else {
        suspicions.push('PVC binding issues - check storage provisioner and available capacity');
      }
    }

    // Network-related suspicions
    if (routes.probe && routes.probe.code >= 500) {
      suspicions.push('Route backend not responding - check pod readiness and service endpoints');
    }

    // Scale-down pattern analysis (PRIORITY - check this first!)
    if (scaleDownAnalysis.isScaleDown) {
      switch (scaleDownAnalysis.verdict) {
        case 'intentional_scale_down':
          suspicions.unshift(`🎯 SCALE-DOWN DETECTED: ${scaleDownAnalysis.deploymentStatus.scaledToZero} deployment(s) intentionally scaled to 0 - not an application failure`);
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
      
      // Add specific scale-down evidence
      if (scaleDownAnalysis.evidence.length > 0) {
        suspicions.push(`Scale-down evidence: ${scaleDownAnalysis.evidence.slice(0, 2).join('; ')}`);
      }
    }

    // Event pattern analysis
    const eventPatterns = this.analyzeEventPatterns(events);
    suspicions.push(...eventPatterns);

    return suspicions;
  }

  /**
   * Determine overall health status (with scale-down awareness)
   */
  private determineOverallStatus(
    pods: PodHealthSummary,
    pvcs: PVCHealthSummary,
    routes: RouteHealthSummary,
    events: string[],
    scaleDownAnalysis: ScaleDownAnalysis
  ): 'healthy' | 'degraded' | 'failing' {
    // Scale-down scenarios should not be considered "failing" if intentional
    if (scaleDownAnalysis.isScaleDown && scaleDownAnalysis.verdict === 'intentional_scale_down') {
      // Intentional scale-down is "degraded" not "failing"
      return 'degraded';
    }

    // Failing conditions
    if (pods.total === 0 && pvcs.total === 0) {
      // If this is a scale-down, it might be intentional
      if (scaleDownAnalysis.isScaleDown) {
        return 'degraded'; // Scale-down scenario
      }
      return 'failing'; // Empty namespace or severe issues
    }

    if (pods.ready === 0 && pods.total > 0) {
      // Check if this is due to scale-down
      if (scaleDownAnalysis.isScaleDown && scaleDownAnalysis.deploymentStatus.scaledToZero > 0) {
        return 'degraded'; // Intentional scale-down
      }
      return 'failing'; // No pods running
    }

    if (pvcs.failed > 0) {
      return 'failing'; // Failed storage
    }

    // Degraded conditions
    if (pods.crashloops.length > 0 || pods.imagePullErrors.length > 0) {
      return 'degraded'; // Application issues
    }

    if (pvcs.pending > 0) {
      return 'degraded'; // Storage issues
    }

    if (pods.ready < pods.total && pods.total > 0) {
      return 'degraded'; // Some pods not ready
    }

    if (routes.probe && routes.probe.code >= 400) {
      return 'degraded'; // Network issues
    }

    return 'healthy';
  }

  /**
   * Generate human-readable summary (with scale-down context)
   */
  private generateHumanSummary(
    namespace: string,
    status: string,
    pods: PodHealthSummary,
    pvcs: PVCHealthSummary,
    routes: RouteHealthSummary,
    suspicions: string[],
    scaleDownAnalysis: ScaleDownAnalysis
  ): string {
    const parts: string[] = [];

    // Lead with scale-down context if detected
    if (scaleDownAnalysis.isScaleDown) {
      switch (scaleDownAnalysis.verdict) {
        case 'intentional_scale_down':
          parts.push(`Namespace ${namespace} appears to be intentionally scaled down (${scaleDownAnalysis.deploymentStatus.scaledToZero}/${scaleDownAnalysis.deploymentStatus.total} deployments at 0 replicas).`);
          break;
        case 'node_failure':
          parts.push(`Namespace ${namespace} is ${status} due to apparent node failure.`);
          break;
        case 'resource_pressure':
          parts.push(`Namespace ${namespace} is ${status}, possibly due to resource pressure.`);
          break;
        default:
          parts.push(`Namespace ${namespace} is ${status} with scale-down activity detected.`);
      }
    } else {
      parts.push(`Namespace ${namespace} is ${status}.`);
    }

    // Pod summary
    if (pods.total > 0) {
      parts.push(`Pods: ${pods.ready}/${pods.total} ready.`);
      
      if (pods.crashloops.length > 0) {
        parts.push(`CrashLoopBackOff: ${pods.crashloops.join(', ')}.`);
      }
      
      if (pods.imagePullErrors.length > 0) {
        parts.push(`Image pull issues: ${pods.imagePullErrors.join(', ')}.`);
      }
    }

    // PVC summary
    if (pvcs.total > 0) {
      parts.push(`Storage: ${pvcs.bound}/${pvcs.total} PVCs bound.`);
      
      if (pvcs.pending > 0) {
        parts.push(`${pvcs.pending} PVC(s) pending.`);
      }
    }

    // Route summary
    if (routes.total > 0) {
      parts.push(`${routes.total} route(s) configured.`);
      
      if (routes.probe) {
        parts.push(`Route test: ${routes.probe.code} ${routes.probe.message}.`);
      }
    }

    // Top suspicion
    if (suspicions.length > 0) {
      parts.push(`Key issue: ${suspicions[0]}`);
    }

    return parts.join(' ');
  }

  // Helper methods

  private createFailureResult(namespace: string, error: string, startTime: number): NamespaceHealthResult {
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
      human: `Namespace ${namespace} health check failed: ${error}`,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    };
  }

  private isPodStuckCreating(pod: any): boolean {
    const creationTime = new Date(pod.metadata.creationTimestamp).getTime();
    const stuckThreshold = 5 * 60 * 1000; // 5 minutes
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
      // Use Node.js built-in fetch (Node 18+) or http module fallback
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

  private analyzeEventPatterns(events: string[]): string[] {
    const patterns: string[] = [];
    
    // Common error patterns
    const imagePullPattern = events.filter(e => e.includes('ImagePull') || e.includes('ErrImagePull'));
    if (imagePullPattern.length > 2) {
      patterns.push('Frequent image pull failures - check registry connectivity');
    }

    const mountPattern = events.filter(e => e.includes('FailedMount') || e.includes('MountVolume'));
    if (mountPattern.length > 0) {
      patterns.push('Volume mount issues detected - verify PVC and storage configuration');
    }

    const schedulingPattern = events.filter(e => e.includes('FailedScheduling'));
    if (schedulingPattern.length > 0) {
      patterns.push('Pod scheduling failures - check node capacity and constraints');
    }

    return patterns;
  }
}

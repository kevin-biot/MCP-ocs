/// <reference path="./mcp-files-shim.d.ts" />
// @ts-ignore: external module provided by MCP-files repo
import { ChromaMemoryManager } from '../../../MCP-files/src/memory-extension.ts';

export interface OCSIncidentMemory {
  sessionId: string;
  timestamp: number;
  userMessage: string;
  assistantResponse: string;
  context: string[];
  tags: string[];
  domain: 'openshift' | 'kubernetes' | 'devops' | 'production';
  environment: 'dev' | 'test' | 'staging' | 'prod';
  severity: 'low' | 'medium' | 'high' | 'critical';
  resourceType?: string;
}

export class MCPOcsMemoryAdapter {
  private memoryManager: ChromaMemoryManager;

  constructor(memoryDir: string) {
    this.memoryManager = new ChromaMemoryManager(memoryDir);
  }

  async initialize(): Promise<void> {
    await this.memoryManager.initialize();
  }

  async storeIncidentMemory(memory: OCSIncidentMemory): Promise<boolean> {
    const mcpMemory = {
      sessionId: memory.sessionId,
      timestamp: memory.timestamp,
      userMessage: memory.userMessage,
      assistantResponse: memory.assistantResponse,
      context: memory.context,
      tags: [
        ...memory.tags,
        `domain:${memory.domain}`,
        `environment:${memory.environment}`,
        `severity:${memory.severity}`,
        `resource:${memory.resourceType || 'unknown'}`
      ]
    };

    return await this.memoryManager.storeConversation(mcpMemory);
  }

  async searchIncidents(
    query: string,
    domainFilter?: 'openshift' | 'kubernetes' | 'devops' | 'production',
    limit: number = 5
  ): Promise<any[]> {
    const results: any[] = await this.memoryManager.searchRelevantMemories(query, undefined, limit);

    if (domainFilter) {
      return results.filter((result: any) =>
        result.metadata.tags?.includes(`domain:${domainFilter}`)
      );
    }

    return results;
  }

  async generateStructuredIncidentResponse(
    query: string,
    sessionId?: string
  ): Promise<{
    summary: string;
    relatedIncidents: any[];
    rootCauseAnalysis: string;
    recommendations: string[];
    severitySummary: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const relevantMemories = await this.memoryManager.searchRelevantMemories(
      query, 
      sessionId, 
      10
    );
    
    const relatedIncidents = relevantMemories.map((result: any) => ({
      sessionId: result.metadata.sessionId,
      timestamp: result.metadata.timestamp,
      summary: `User: ${result.metadata.userMessage}\nAssistant: ${result.metadata.assistantResponse}`,
      tags: result.metadata.tags,
      distance: result.distance
    }));
    
    return {
      summary: `Based on ${relevantMemories.length} similar incidents`,
      relatedIncidents,
      rootCauseAnalysis: this.generateRootCauseAnalysis(relevantMemories),
      recommendations: this.extractRecommendations(relevantMemories),
      severitySummary: this.classifyAggregateSeverity(relevantMemories)
    };
  }
  
  private generateRootCauseAnalysis(memories: any[]): string {
    const text = memories
      .map((m: any) => `${m?.metadata?.userMessage || ''} ${m?.metadata?.assistantResponse || ''}`)
      .join(' ') 
      .toLowerCase();

    if (text.includes('oom') || text.includes('out of memory')) {
      return 'Likely OOM conditions causing restarts; check limits/requests and memory leaks.';
    }
    if (text.includes('crashloop') || text.includes('crashloopbackoff')) {
      return 'Pod restart loop suggests startup/config issues or insufficient resources.';
    }
    if (text.includes('image') || text.includes('pull backoff')) {
      return 'Image pull/configuration problems; verify registry access and image references.';
    }
    if (text.includes('timeout') || text.includes('unreachable')) {
      return 'Network/API timeout symptoms; check service endpoints and cluster networking.';
    }
    if (text.includes('quota') || text.includes('limitexceeded')) {
      return 'Quota or limit exceeded; adjust namespace quotas or workload settings.';
    }
    return 'Common patterns suggest resource allocation or configuration issues.';
  }
  
  private extractRecommendations(memories: any[]): string[] {
    const tags = new Set<string>();
    for (const m of memories as any[]) {
      const mtags = this.normalizeTags(m?.metadata?.tags);
      mtags.forEach((t: string) => tags.add(t));
    }

    const recs = new Set<string>();

    const hasOpenShift = Array.from(tags).some(t => t.startsWith('domain:openshift'));
    const hasK8s = Array.from(tags).some(t => t.startsWith('domain:kubernetes'));
    const hasPod = Array.from(tags).some(t => t.startsWith('resource:pod'));

    if (hasOpenShift && hasPod) {
      recs.add('Check pod logs: oc logs -n <namespace> <pod>');
      recs.add('Describe the pod: oc describe pod -n <namespace> <pod>');
      recs.add('Inspect events: oc get events -A --sort-by=.lastTimestamp');
    }
    if (hasK8s && hasPod) {
      recs.add('Check pod logs: kubectl logs -n <namespace> <pod>');
      recs.add('Describe the pod: kubectl describe pod -n <namespace> <pod>');
      recs.add('Inspect events: kubectl get events -A --sort-by=.lastTimestamp');
    }

    recs.add('Verify resource limits/requests for affected workloads');
    recs.add('Review recent deployments/rollouts for regressions');
    recs.add('Check node health and capacity in the target cluster');

    return Array.from(recs);
  }

  private classifyAggregateSeverity(memories: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const order = ['low', 'medium', 'high', 'critical'] as const;
    let maxIndex = 0;
    for (const m of memories as any[]) {
      const tags: string[] = this.normalizeTags(m?.metadata?.tags);
      for (const t of tags) {
        if (t.startsWith('severity:')) {
          const sev = t.split(':')[1] as 'low'|'medium'|'high'|'critical' | undefined;
          const idx = sev ? order.indexOf(sev) : -1;
          if (idx > maxIndex) maxIndex = idx;
        }
      }
    }
    const safeIndex = Math.max(0, Math.min(maxIndex, order.length - 1));
    const sev: 'low' | 'medium' | 'high' | 'critical' = (order[safeIndex] ?? 'low');
    return sev;
  }

  private normalizeTags(raw: unknown): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter((t) => typeof t === 'string') as string[];
    if (typeof raw === 'string') return raw.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  }

  async isMemoryAvailable(): Promise<boolean> {
    return await this.memoryManager.isAvailable();
  }
}

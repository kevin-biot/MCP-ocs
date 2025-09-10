import { MCPOcsMemoryAdapter } from '../memory/mcp-ocs-memory-adapter.js';
import { UnifiedMemoryAdapter } from '../memory/unified-memory-adapter.js';
import { FEATURE_FLAGS } from '../config/feature-flags.js';

export class ToolMemoryGateway {
  private adapter: MCPOcsMemoryAdapter | UnifiedMemoryAdapter;
  private initialized = false;

  constructor(memoryDir: string = './memory') {
    if (FEATURE_FLAGS.UNIFIED_MEMORY) {
      this.adapter = new UnifiedMemoryAdapter({ memoryDir });
    } else {
      this.adapter = new MCPOcsMemoryAdapter(memoryDir);
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    // @ts-ignore - both adapters expose initialize
    await (this.adapter as any).initialize();
    this.initialized = true;
  }

  async storeToolExecution(
    toolName: string,
    args: any,
    result: any,
    sessionId: string,
    tags: string[] = [],
    domain: 'openshift' | 'kubernetes' | 'devops' | 'production' = 'openshift',
    environment: 'dev' | 'test' | 'staging' | 'prod' = 'prod',
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<boolean> {
    await this.initialize();
    const memory = {
      sessionId,
      timestamp: Date.now(),
      userMessage: `Tool ${toolName} executed with args: ${JSON.stringify(args)}`,
      assistantResponse: typeof result === 'string' ? result : JSON.stringify(result),
      context: [],
      tags: [
        ...tags,
        `tool:${toolName}`,
        `domain:${domain}`,
        `environment:${environment}`,
        `severity:${severity}`
      ],
      domain,
      environment,
      severity
    } as const;

    if (this.adapter instanceof UnifiedMemoryAdapter) {
      await this.adapter.storeToolExecution(toolName, args, result, sessionId, tags, domain, environment, severity);
      return true;
    }
    return await (this.adapter as MCPOcsMemoryAdapter).storeIncidentMemory(memory as any);
  }

  async searchToolIncidents(
    query: string,
    domainFilter?: 'openshift' | 'kubernetes' | 'devops' | 'production',
    limit: number = 5
  ): Promise<any[]> {
    await this.initialize();
    if (this.adapter instanceof UnifiedMemoryAdapter) {
      const results = await this.adapter.searchOperational(query, limit);
      if (domainFilter) {
        return results.filter(r => (r?.memory?.domain || '').toLowerCase() === domainFilter.toLowerCase());
      }
      return results;
    }
    return await (this.adapter as MCPOcsMemoryAdapter).searchIncidents(query, domainFilter, limit);
  }

  async isMemoryAvailable(): Promise<boolean> {
    await this.initialize();
    if (this.adapter instanceof UnifiedMemoryAdapter) {
      return !!(await this.adapter.isAvailable());
    }
    return await (this.adapter as MCPOcsMemoryAdapter).isMemoryAvailable();
  }
}

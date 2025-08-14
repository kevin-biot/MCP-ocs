import { MCPOcsMemoryAdapter } from '../memory/mcp-ocs-memory-adapter';

export class ToolMemoryGateway {
  private adapter: MCPOcsMemoryAdapter;
  private initialized = false;

  constructor(memoryDir: string = './memory') {
    this.adapter = new MCPOcsMemoryAdapter(memoryDir);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.adapter.initialize();
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

    return await this.adapter.storeIncidentMemory(memory as any);
  }

  async searchToolIncidents(
    query: string,
    domainFilter?: 'openshift' | 'kubernetes' | 'devops' | 'production',
    limit: number = 5
  ): Promise<any[]> {
    await this.initialize();
    return await this.adapter.searchIncidents(query, domainFilter, limit);
  }

  async isMemoryAvailable(): Promise<boolean> {
    await this.initialize();
    return await this.adapter.isMemoryAvailable();
  }
}


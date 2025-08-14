// Minimal type shim for external MCP-files import used by the adapter.
declare module '../../../MCP-files/src/memory-extension.ts' {
  export class ChromaMemoryManager {
    constructor(memoryDir: string);
    initialize(): Promise<void>;
    storeConversation(memory: any): Promise<boolean>;
    searchRelevantMemories(
      query: string,
      sessionId?: string,
      limit?: number
    ): Promise<any[]>;
    isAvailable(): Promise<boolean>;
  }
}


// Minimal no-op shim for vector memory manager used by tools
export class VectorMemoryManager {
  constructor() {}

  async storeToolMemory(_toolCall: any, _result: any, _context: any): Promise<string> {
    return `memory_${Date.now()}`;
  }

  async getMemory(_id: string): Promise<any> {
    return null;
  }

  async queryRelevantMemories(_query: string, _tags?: string[], _limit: number = 5): Promise<any[]> {
    return [];
  }

  async cleanupOldMemories(_daysOld: number = 7): Promise<number> {
    return 0;
  }
}


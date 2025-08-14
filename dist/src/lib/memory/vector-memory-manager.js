// Minimal no-op shim for vector memory manager used by tools
export class VectorMemoryManager {
    constructor() { }
    async storeToolMemory(_toolCall, _result, _context) {
        return `memory_${Date.now()}`;
    }
    async getMemory(_id) {
        return null;
    }
    async queryRelevantMemories(_query, _tags, _limit = 5) {
        return [];
    }
    async cleanupOldMemories(_daysOld = 7) {
        return 0;
    }
}

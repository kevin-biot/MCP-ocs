export declare class VectorMemoryManager {
    constructor();
    storeToolMemory(_toolCall: any, _result: any, _context: any): Promise<string>;
    getMemory(_id: string): Promise<any>;
    queryRelevantMemories(_query: string, _tags?: string[], _limit?: number): Promise<any[]>;
    cleanupOldMemories(_daysOld?: number): Promise<number>;
}

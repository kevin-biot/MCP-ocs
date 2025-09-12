export interface McpLikeClient {
    call(tool: string, args: Record<string, any>): Promise<any>;
}
export interface QueueOptions {
    concurrency?: number;
    cancelUsageThreshold?: number;
    timeMs?: number;
}
export declare class OrchestrationQueue {
    private readonly mcp;
    private readonly opts;
    private readonly start;
    private inflight;
    private cancelled;
    constructor(mcp: McpLikeClient, opts?: QueueOptions);
    enqueue(id: string, tool: string, args: Record<string, any>): void;
    wait(ids: string[]): Promise<Record<string, any>>;
    fanout(prefix: string, requests: Array<{
        tool: string;
        args: Record<string, any>;
    }>, onPartial?: (result: any) => void): Promise<any[]>;
    cancel(): void;
    elapsed(): number;
    private exceededTime;
    private reachedCancelThreshold;
}
export declare function pvcTriageOrchestration(mcp: McpLikeClient, sessionId: string, budget: {
    timeMs: number;
    concurrency?: number;
    namespaceLimit?: number;
}, nsFilters?: {
    regex?: string;
    labelSelector?: string;
}): Promise<{
    health?: any;
    nsList?: any;
    triage: any[];
}>;

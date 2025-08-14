export declare class AutoMemorySystem {
    constructor(_sharedMemory?: any);
    initialize(): Promise<void>;
    retrieveRelevantContext(_toolName: string, _args: any): Promise<any[]>;
    captureToolExecution(_record: any): Promise<void>;
}

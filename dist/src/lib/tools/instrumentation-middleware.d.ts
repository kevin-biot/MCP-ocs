export interface PreContext {
    toolId: string;
    opType: string;
    category: string;
    sessionId: string;
    startMs: number;
    startIso: string;
    flags: Record<string, string | number | boolean>;
    allowlisted: boolean;
    redactedArgs: Record<string, unknown>;
}
export declare function inferOpType(category: string): string;
export declare function isAllowlisted(toolId: string): boolean;
export declare function redactArgs(input: unknown): Record<string, unknown>;
export declare function preInstrument(toolId: string, category: string, args: unknown): PreContext | null;
export declare function postInstrument(pre: PreContext | null, resultJson: string): Promise<void>;
export declare function postInstrumentError(pre: PreContext | null, error: unknown): Promise<void>;

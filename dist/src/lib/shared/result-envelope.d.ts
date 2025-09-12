export interface NamespaceError {
    namespace: string;
    error: string;
}
export interface ResultMetadata {
    partial: boolean;
    exhaustedBudget: boolean;
    namespaceErrors?: NamespaceError[];
    signals?: Record<string, any>;
    summary?: string;
    executionTimeMs?: number;
}
export interface ResultEnvelope<T = any> {
    data?: T;
    metadata: ResultMetadata;
}
export declare function makeEnvelope<T>(data: T, meta?: Partial<ResultMetadata>): ResultEnvelope<T>;

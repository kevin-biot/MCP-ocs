export interface MetricsRecordV2 {
    toolId: string;
    opType: string;
    mode: 'json' | 'vector';
    elapsedMs: number;
    outcome: 'ok' | 'error';
    errorSummary: string | null;
    cleanupCheck: boolean;
    anchors: string[];
    timestamp: string;
    sessionId: string;
    flags?: Record<string, string | number | boolean>;
    vector?: {
        tenant?: string;
        database?: string;
        collection?: string;
    };
}
export declare function appendMetricsV2(record: MetricsRecordV2): Promise<void>;
export declare function metricsVectorIdentifiers(): {
    tenant?: string;
    database?: string;
    collection?: string;
};

export declare function createTimeoutSignal(timeoutMs: number): {
    signal: AbortSignal;
    cancel: () => void;
};
export declare function withTimeout<T>(fn: (signal?: AbortSignal) => Promise<T>, timeoutMs: number, label?: string): Promise<T>;

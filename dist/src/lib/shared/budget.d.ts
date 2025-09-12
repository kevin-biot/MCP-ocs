export interface Budget {
    timeMs: number;
    namespaceLimit?: number;
    concurrency?: number;
}
export declare const DEFAULT_BUDGET: Required<Pick<Budget, "timeMs" | "concurrency">> & Pick<Budget, "namespaceLimit">;
export declare const CEILINGS: {
    concurrency: number;
    namespaceLimit: number;
};
export declare function clampBudget(b: Budget): Budget;

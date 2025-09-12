export interface Budget {
  timeMs: number;
  namespaceLimit?: number;
  concurrency?: number;
}

export const DEFAULT_BUDGET: Required<Pick<Budget, "timeMs" | "concurrency">> & Pick<Budget, "namespaceLimit"> = {
  timeMs: 60000,
  concurrency: 6,
  namespaceLimit: 200,
};

export const CEILINGS = {
  concurrency: 10,
  namespaceLimit: 500,
};

export function clampBudget(b: Budget): Budget {
  const timeMs = Math.max(1000, b.timeMs);
  const concurrency = Math.min(CEILINGS.concurrency, Math.max(1, b.concurrency ?? DEFAULT_BUDGET.concurrency));
  const namespaceLimit = b.namespaceLimit
    ? Math.min(CEILINGS.namespaceLimit, Math.max(1, b.namespaceLimit))
    : DEFAULT_BUDGET.namespaceLimit;
  return { timeMs, concurrency, namespaceLimit };
}


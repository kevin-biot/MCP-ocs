export interface McpLikeClient {
  call(tool: string, args: Record<string, any>): Promise<any>;
}

export interface QueueOptions {
  concurrency?: number;
  cancelUsageThreshold?: number; // 0..1 (e.g., 0.7 for 70%)
  timeMs?: number; // total budget for the overall flow
}

export class OrchestrationQueue {
  private readonly start = Date.now();
  private inflight = new Map<string, Promise<any>>();
  private cancelled = false;

  constructor(private readonly mcp: McpLikeClient, private readonly opts: QueueOptions = {}) {}

  enqueue(id: string, tool: string, args: Record<string, any>): void {
    if (this.cancelled) return;
    const p = this.mcp.call(tool, args).catch((e: any) => ({ error: String(e) }));
    this.inflight.set(id, p.finally(() => this.inflight.delete(id)));
  }

  async wait(ids: string[]): Promise<Record<string, any>> {
    const out: Record<string, any> = {};
    for (const id of ids) out[id] = await (this.inflight.get(id) ?? Promise.resolve(undefined));
    return out;
  }

  async fanout(
    prefix: string,
    requests: Array<{ tool: string; args: Record<string, any> }>,
    onPartial?: (result: any) => void
  ): Promise<any[]> {
    const concurrency = Math.max(1, this.opts.concurrency ?? 6);
    const results: any[] = [];
    let index = 0;

    const worker = async (): Promise<void> => {
      while (!this.cancelled) {
        if (this.exceededTime()) { this.cancel(); break; }
        const next = index++;
        if (next >= requests.length) break;
        const req = requests[next]!;
        const { tool, args } = req;
        try {
          const r = await this.mcp.call(tool, args);
          results.push(r);
          if (onPartial) onPartial(r);
        } catch (e: any) {
          results.push({ error: String(e) });
        }
        if (this.reachedCancelThreshold(results)) { this.cancel(); break; }
      }
    };

    await Promise.all(Array.from({ length: Math.min(concurrency, requests.length) }, () => worker()));
    return results;
  }

  cancel(): void { this.cancelled = true; }
  elapsed(): number { return Date.now() - this.start; }

  private exceededTime(): boolean {
    const total = this.opts.timeMs ?? 0;
    if (!total) return false;
    return this.elapsed() > total;
  }

  private reachedCancelThreshold(partials: any[]): boolean {
    const threshold = this.opts.cancelUsageThreshold ?? 0.7;
    const total = this.opts.timeMs ?? 0;
    if (!total) return false;
    return this.elapsed() / total >= threshold;
  }
}

// Helper for a common PVC flow
export async function pvcTriageOrchestration(
  mcp: McpLikeClient,
  sessionId: string,
  budget: { timeMs: number; concurrency?: number; namespaceLimit?: number },
  nsFilters?: { regex?: string; labelSelector?: string }
): Promise<{ health?: any; nsList?: any; triage: any[] }> {
  const queue = new OrchestrationQueue(mcp, {
    timeMs: budget.timeMs,
    concurrency: budget.concurrency ?? 6,
    cancelUsageThreshold: 0.95,
  });

  queue.enqueue("health", "oc_diagnostic_cluster_health", {
    sessionId,
    includeNamespaceAnalysis: true,
    depth: "summary",
    budget: { timeMs: Math.floor(budget.timeMs * 0.3) },
  });

  queue.enqueue("nsList", "oc_read_list_namespaces", {
    sessionId,
    filters: nsFilters ?? { regex: ".*" },
    pagination: { limit: Math.min(500, budget.namespaceLimit ?? 200) },
  });

  const { health, nsList } = await queue.wait(["health", "nsList"]);

  const fromSignals: string[] = health?.signals?.pvcIssues?.namespaces ?? [];
  const fromList: string[] = (nsList?.data?.namespaces ?? nsList?.namespaces ?? [])
    .map((n: any) => (typeof n === "string" ? n : n?.name))
    .filter(Boolean);
  const merged = Array.from(new Set([...fromSignals, ...fromList]));

  const capped = (budget.namespaceLimit && merged.length > budget.namespaceLimit)
    ? merged.slice(0, budget.namespaceLimit)
    : merged;

  const triageRequests = capped.map(ns => ({
    tool: "oc_diagnostic_triage",
    args: {
      sessionId,
      intent: "pvc-binding",
      target: { scope: "namespaces", selector: { names: [ns] } },
      budget: { timeMs: Math.max(3000, Math.floor((budget.timeMs * 0.6) / Math.max(1, capped.length))) },
    },
  }));

  const triage = await queue.fanout("triage", triageRequests);
  return { health, nsList, triage };
}

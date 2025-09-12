export class OrchestrationQueue {
    mcp;
    opts;
    start = Date.now();
    inflight = new Map();
    cancelled = false;
    constructor(mcp, opts = {}) {
        this.mcp = mcp;
        this.opts = opts;
    }
    enqueue(id, tool, args) {
        if (this.cancelled)
            return;
        const p = this.mcp.call(tool, args).catch((e) => ({ error: String(e) }));
        this.inflight.set(id, p.finally(() => this.inflight.delete(id)));
    }
    async wait(ids) {
        const out = {};
        for (const id of ids)
            out[id] = await (this.inflight.get(id) ?? Promise.resolve(undefined));
        return out;
    }
    async fanout(prefix, requests, onPartial) {
        const concurrency = Math.max(1, this.opts.concurrency ?? 6);
        const results = [];
        let index = 0;
        const worker = async () => {
            while (!this.cancelled) {
                if (this.exceededTime()) {
                    this.cancel();
                    break;
                }
                const next = index++;
                if (next >= requests.length)
                    break;
                const req = requests[next];
                const { tool, args } = req;
                try {
                    const r = await this.mcp.call(tool, args);
                    results.push(r);
                    if (onPartial)
                        onPartial(r);
                }
                catch (e) {
                    results.push({ error: String(e) });
                }
                if (this.reachedCancelThreshold(results)) {
                    this.cancel();
                    break;
                }
            }
        };
        await Promise.all(Array.from({ length: Math.min(concurrency, requests.length) }, () => worker()));
        return results;
    }
    cancel() { this.cancelled = true; }
    elapsed() { return Date.now() - this.start; }
    exceededTime() {
        const total = this.opts.timeMs ?? 0;
        if (!total)
            return false;
        return this.elapsed() > total;
    }
    reachedCancelThreshold(partials) {
        const threshold = this.opts.cancelUsageThreshold ?? 0.7;
        const total = this.opts.timeMs ?? 0;
        if (!total)
            return false;
        return this.elapsed() / total >= threshold;
    }
}
// Helper for a common PVC flow
export async function pvcTriageOrchestration(mcp, sessionId, budget, nsFilters) {
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
    const fromSignals = health?.signals?.pvcIssues?.namespaces ?? [];
    const fromList = (nsList?.data?.namespaces ?? nsList?.namespaces ?? [])
        .map((n) => (typeof n === "string" ? n : n?.name))
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

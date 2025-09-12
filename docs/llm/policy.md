# LLM Behavioral Policy (Deterministic, Bounded, Efficient)

## Principles
- Capability-first planning: always query `mcp_capabilities` for target/batch/budget support and cost hints before selecting tools.
- No invented values: never send enum-like or undocumented values (e.g., `namespace: "all"`) unless explicitly documented by the schema.
- Always set budgets: include `timeMs`, `concurrency`, and `namespaceLimit` for multi-namespace operations; respect server ceilings.
- Prefer discover → refine: run coarse cluster discovery and namespace listing in parallel; use signals to focus follow-ups.
- Handle partials: read `ResultEnvelope.metadata.partial` and `exhaustedBudget` to summarize, then propose next steps.
- Cancel on threshold: stop fanout if ≥70% of `timeMs` used or enough high-confidence signals are found.
- Backward compatibility: if a tool requires `namespace` and doesn’t support `target`, enumerate namespaces first.

## Standard Fields
- Target: `scope: "cluster"|"namespaces"`, `selector: "all"|"system"|"user"|{names,labelSelector,regex,sample{size,seed}}`.
- Budget: `timeMs`, `concurrency`, `namespaceLimit`. Defaults: 60000, 6, 200. Ceilings: concurrency 10, namespaceLimit 500.
- ResultEnvelope: `partial`, `exhaustedBudget`, `namespaceErrors[]`, `signals`, `summary`, `executionTimeMs`.

## Planning Flow (PVC Example)
1) Discovery (parallel):
- `oc_diagnostic_cluster_health` with `includeNamespaceAnalysis=true, depth="summary", budget`.
- `oc_read_list_namespaces` with appropriate filters/pagination.
2) Candidate selection: merge namespaces from signals + list; dedupe; cap by `namespaceLimit`.
3) Triage fanout: call `oc_diagnostic_triage(intent:"pvc-binding")` per namespace with `budget.concurrency`.
4) Cancellation: stop remaining fanout when cancel threshold hit or sufficient findings.
5) Summarize partials: report `namespaceErrors`, `partial`, and advise next steps.

## Do/Don’t
- Do: reuse a single `sessionId` across related calls; generate UUID once if missing.
- Do: prefer server-side filtering and pagination; avoid client-side scanning.
- Don’t: guess schema values; don’t exceed ceilings; don’t fan out unbounded per-namespace calls.

## Capability Discovery Checklist
- supportsTarget? supportsBatch? maxConcurrency? rateLimits? expectedLatencyMs? scalesWithNamespaces?
- If `supportsTarget=false`, plan enumeration + per-namespace loop with budgets.

## Partial Handling
- If `partial=true` and `exhaustedBudget=false`: hit a count limit; summarize and suggest rerun with higher `namespaceLimit`.
- If `exhaustedBudget=true`: propose rerun with higher `timeMs` or lower concurrency; preserve findings collected.


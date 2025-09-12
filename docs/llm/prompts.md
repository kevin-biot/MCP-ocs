# Prompt Snippets (Capability-First, Bounded)

## Capability Discovery
```
Call mcp_capabilities for tools: ["oc_diagnostic_cluster_health", "oc_read_list_namespaces", "oc_diagnostic_triage"].
Plan with supportsTarget, maxConcurrency, rateLimits, expectedLatencyMs.
```

## Cluster-wide PVC Triage Plan
```
1) In parallel (budget: {timeMs: 60000, concurrency: 6, namespaceLimit: 200}):
   - oc_diagnostic_cluster_health { includeNamespaceAnalysis: true, depth: "summary", budget }
   - oc_read_list_namespaces { filters: {regex: ".*"}, pagination: {limit: 500} }
2) Merge candidate namespaces from health.signals.pvcIssues.namespaces and list; dedupe and cap by budget.namespaceLimit
3) Fan out oc_diagnostic_triage per namespace with intent: "pvc-binding", passing target {scope: "namespaces", selector: {names: [ns]}}, budget: {timeMs: 5000}
4) Cancel remaining fanout if ≥70% time consumed or enough critical findings detected
5) Summarize partials, include namespaceErrors, advise next steps
```

## Per-Namespace Triage (Legacy Tool)
```
If oc_diagnostic_triage does not support target:
- Enumerate namespaces first via oc_read_list_namespaces
- Loop oc_diagnostic_triage with {intent, namespace} per ns, respecting budget and concurrency
```

## Partial Handling
```
If ResultEnvelope.metadata.exhaustedBudget:
- Summarize partial results and suggest increasing timeMs on rerun
If namespaceErrors present:
- Report RBAC-per-namespace failures and proceed with accessible namespaces
```


# Playbook: Cluster-wide PVC Triage

## Objective
Efficiently detect and triage PVC issues across the cluster using parallel discovery, bounded fanout, and cancellation on signals.

## Inputs
- sessionId: correlation id
- budget: { timeMs: 60000, concurrency: 6, namespaceLimit: 200 }

## Steps
1) Discovery (run in parallel)
- oc_diagnostic_cluster_health { includeNamespaceAnalysis: true, depth: "summary", budget }
- oc_read_list_namespaces { filters: { regex: ".*" }, pagination: { limit: 500 } }

2) Candidate namespaces
- Merge health.signals.pvcIssues.namespaces and the discovered list
- Dedupe and cap with budget.namespaceLimit

3) Fanout triage
- For each candidate ns (bounded by `concurrency`):
  - oc_diagnostic_triage { sessionId, intent: "pvc-binding", target: { scope: "namespaces", selector: { names: [ns] } }, budget: { timeMs: 5000 } }

4) Cancellation
- Cancel remaining fanout when ≥70% of timeMs used or enough critical findings detected

5) Summarize
- Aggregate findings
- Include ResultEnvelope.metadata.partial, exhaustedBudget, namespaceErrors
- Recommend next steps (e.g., rerun with higher timeMs/namespaceLimit or deep dive on impacted namespaces)

## Success Criteria
- Completes within `budget.timeMs` with partials when needed
- ≥60% reduction in triage fanout due to health signals
- Clear summary and actionable next steps


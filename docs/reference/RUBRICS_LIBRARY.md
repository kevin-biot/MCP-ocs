# Comprehensive Rubrics Library

This document provides a context guide for the rubrics plan and how rubrics align with templates in MCP‑ocs.

## Key Features

- Template‑Aligned Approach
  - Each rubric maps to specific diagnostic templates
  - No "one‑shot all rubrics" — incremental development
  - Template + Rubric tested as units before integration

- Organized Library (13 Specialized Rubrics in 3 Categories)
  1) Universal Meta‑Rubrics (ALL templates)
     - triage-priority.v1 — P1/P2/P3 classification with escalation
     - evidence-confidence.v1 — High/Medium/Low decision guidance
     - remediation-safety.v1 — Universal safety gates for automation
  2) Diagnostic Rubrics (Template‑specific)
     - scheduler-predicate.v1 — Pod scheduling failure analysis
     - zone-capacity.v1 — Infrastructure capacity across zones
     - pvc-binding.v1 — Storage binding diagnostics
     - ingress-risk.v1 — Router availability and traffic risk
  3) Intelligence Rubrics (Advanced patterns)
     - operator-impact.v1 — Cascading operator failure analysis
     - noise-filter.v1 — Event aggregation and alert fatigue reduction
     - runbook-fitness.v1 — Automated remediation ranking

## Development Cycle

1. Create Template → 2. Select Rubrics → 3. Unit Testing → 4. Cross‑Model Validation → 5. Memory Storage → 6. Iteration

## Integration Strategy

- Phase 1: Core rubrics with existing templates (ingress, scheduling, infrastructure)
- Phase 2: Specialized rubrics with new templates (zone‑conflict, storage‑binding)
- Phase 3: Advanced intelligence rubrics (event analysis, performance)

## File Organization

```
src/lib/rubrics/
├── core/           # Universal meta-rubrics
├── diagnostic/     # Template-specific rubrics
├── intelligence/   # Advanced pattern rubrics
└── rubric-registry.ts
```

## Memory Integration

- Store successful template–rubric combinations
- Track rubric performance and operator satisfaction
- Learn optimal rubric patterns for specific scenarios

This creates the foundation for incremental, surgical rubric implementation — each template gets developed with its specific rubrics, tested as a unit, then stored in memory for future reference and evolution.

## Current Coverage Snapshot (2025-08-17)

- Integrated core meta-rubrics (via template engine path):
  - triage-priority.v1, evidence-confidence.v1, remediation-safety.v1
- Tools with rubric outputs today: oc_read_get_pods, oc_read_describe, oc_read_logs
- Pending coverage (to be implemented):
  - Diagnostic: oc_diagnostic_cluster_health, oc_diagnostic_namespace_health, oc_diagnostic_pod_health, oc_diagnostic_rca_checklist
  - Memory: memory_search_incidents, memory_store_operational, memory_search_operational, memory_get_stats, memory_search_conversations
  - Core: core_workflow_state, sequential_thinking
- Coverage: 3/14 tools (21%). Target ≥90% before broad release.

## TODOs / Next Up

- ❌ SLO Impact Classification Rubric — MISSING (planned Task 1.4)
  - File(s): `src/lib/rubrics/core/slo-impact.v1.ts` (mapping rubric), optional predictors under `intelligence/`
  - Purpose: map technical failures to SLO risk (impact level, time-to-breach, customer impact)

- Phase 1 — Diagnostic Rubrics
  - cluster-health (guards + mapping) — safety in place (diagnostic.cluster-health.safety.v1)
  - pod-health — safety and confidence in place (diagnostic.pod-health.safety.v1, diagnostic.pod-health.confidence.v1)
  - namespace-health (confidence), rca-checklist (coverage + safety) — pending

- Phase 2 — Memory Rubrics
  - search.confidence (recall/freshness), store.safety (ttl/scope), stats.safety (healthOk), conversations.confidence (restoration)

- Phase 3 — Core Rubrics
  - workflow_state.safety (withinBoundaries), sequential_thinking.safety/mapping (bounded/thoughts/branching)

## Determinism & Goldens

- Golden snapshots (positive/negative) and strict comparator enforce:
  - Determinism envelope (model/fingerprint/temp/top_p/seed)
  - Steps identity/order, required evidence presence, rubric labels, safety allowAuto
  - Cosmetic tolerance for small score deltas (`SCORE_DELTA_TOL`)

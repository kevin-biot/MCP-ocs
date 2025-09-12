# f-016: LLM Policy & Prompts (Behavioral Guardrails)

## Overview

**Type**: Epic - Maintenance  
**Priority**: P1 - High  
**Complexity**: Low  
**Sprint Target**: 3-5 story points  
**GitHub Issue**: TBD - Behavioral Guardrails & Playbooks  

## Summary

Codify deterministic LLM behavior through documented policies, reusable prompt snippets, and capability discovery workflows. Ensures models do not invent schema values, always set budgets, and plan efficient, cancellable tool sequences.

## Dependencies

**Prerequisites**:
- f-013: Platform Contracts (Target, Budget, ResultEnvelope, capabilities)

**Enables**:
- f-017: Orchestration Efficiency (queue uses these policies)
- Consistent usage of f-014/f-015 tools by any agent

## Technical Scope

### Policy (Authoritative Playbook)
- Capability-first: call `mcp_capabilities` before planning; never assume support.
- No invented values: do not pass `"all"` unless schema explicitly allows.
- Always set Budget: include `timeMs`, `concurrency`, `namespaceLimit` on multi-namespace.
- Handle partials: check `ResultEnvelope.metadata.partial` and `exhaustedBudget` to decide next steps.
- Prefer cluster → refine: run coarse cluster scan and namespace list in parallel, then triage.
- Cancel-on-threshold: stop fanout when ≥70% of timeMs used or enough high-confidence signals found.

### Prompt Snippets
1) Capability discovery and planning
```
Step 1: Call mcp_capabilities for [oc_diagnostic_cluster_health, oc_read_list_namespaces, oc_diagnostic_triage].
Step 2: Plan a parallel queue with budgets and concurrency caps.
```

2) Discovery + triage (PVC example)
```
Call oc_diagnostic_cluster_health { includeNamespaceAnalysis: true, depth: "summary", budget }
Call oc_read_list_namespaces { filters, pagination }
Select candidate namespaces; cap via budget.namespaceLimit
Fan out oc_diagnostic_triage (intent: "pvc-binding") per namespace; cancel on threshold
```

3) Partial handling
```
If metadata.exhaustedBudget: summarize partials; recommend rerun with higher timeMs.
If namespaceErrors length > 0: note RBAC gaps, proceed with accessible namespaces.
```

### Artifacts
- `/docs/llm/policy.md`: full policy with examples
- `/docs/llm/prompts.md`: copy-ready snippets
- `/docs/llm/playbooks/pvc-triage.md`: end-to-end example

## Deliverables

1. Policy docs (policy, prompts, playbooks)
2. Example flows using new schemas and budgets
3. Validation checklist for LLM outputs

## References
- `/docs/llm/policy.md`
- `/docs/llm/prompts.md`
- `/docs/llm/playbooks/pvc-triage.md`
- `/docs/schemas/components.json`

## Acceptance Criteria

✅ Policy published and versioned; referenced by f-013/f-017
✅ Prompt kit includes capability discovery, budgets, partial handling, cancel-on-threshold
✅ Example PVC triage playbook uses Target/Budget and avoids "all" unless allowed
✅ Validation checklist adopted in CI for prompt regressions (lint-style)

## Success Metrics

- 0 instances of invented schema values in reviewed transcripts
- ≥80% reduction in indecision loops before first tool call
- ≥50% faster time-to-first-action across PVC flows

---

*Created: 2025-09-12*  
*Status: Ready for Sprint Planning*  
*Previous: f-013 (Platform Contracts)*  
*Next: f-017 (Orchestration Efficiency)*

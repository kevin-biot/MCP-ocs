# f-017: Orchestration Efficiency (Queued, Bounded Execution)

## Overview

**Type**: Epic - Feature  
**Priority**: P1 - High  
**Complexity**: Medium  
**Sprint Target**: 5-8 story points  
**GitHub Issue**: TBD - Queue, Cancellation, Cost Hints  

## Summary

Deliver efficient, parallelizable execution: run independent reads in parallel, fan out namespace triage with bounded concurrency, and cancel when signals are sufficient or budget thresholds are hit. Optionally provide a server-side `mcp_batch`.

## Dependencies

**Prerequisites**:
- f-013: Platform Contracts (Target, Budget, ResultEnvelope)
- f-014: Read/Discovery Tools (namespace enumeration and signals)
- f-016: LLM Policy & Prompts (playbook to guide planning)

## Technical Scope

### Capabilities and Cost Hints
- `mcp_capabilities` extended with: `supportsTarget`, `supportsBatch`, `maxConcurrency`, `rateLimits`, `hints.expectedLatencyMs`, `hints.scalesWithNamespaces`.

### Client Queue (baseline)
- Minimal TS queue that:
  - Enqueues independent calls in parallel (health + ns list)
  - Fans out per-namespace triage with `budget.concurrency`
  - Cancels remaining work when `timeMs` ≥ 70% or signals sufficient
  - Aggregates partial results, preserving `namespaceErrors`

### Optional Server Batch
- `mcp_batch` tool: batch N tool calls with per-item timeouts and bounded concurrency.
- Cancellation: accept `requestId`/`cancellationToken` and stop in-flight work.

### Cost Awareness
- Prefer low-latency reads first; include cost hints in capabilities.
- Apply backpressure when rateLimits approach thresholds.

## Deliverables

1. Client queue utility (`src/lib/orchestration/queue.ts`) with cancellation hooks
2. Optional `mcp_batch` tool and handler
3. Example orchestration for PVC triage implementing the playbook
4. Docs: queue usage, cancel policy, partial handling

## References
- `/docs/llm/policy.md`
- `/docs/llm/prompts.md`
- `/docs/llm/playbooks/pvc-triage.md`
- `/docs/schemas/components.json`

## Acceptance Criteria

✅ Parallel discovery (health + ns) completes faster than serial baseline
✅ Fanout respects `budget.concurrency` and halts on cancel trigger
✅ End-to-end PVC flow meets `Budget.defaults.timeMs` with partials when needed
✅ Works with and without `mcp_batch` (client queue is sufficient)

## Success Metrics

- ≥2x faster median completion time vs serial
- ≥10x speedup in worst-case clusters (fanout bounded + cancel-on-signal)
- Zero hard timeouts when budgets are set; partials returned instead

## Risks & Mitigations

- Server cancellation support varies → provide client-side cancellation as baseline
- Rate limits → honor `rateLimits` and apply jitter/backoff
- Large clusters → enforce Budget ceilings to cap work

---

*Created: 2025-09-12*  
*Status: Ready for Sprint Planning*  
*Previous: f-016 (LLM Policy & Prompts)*  
*Next: Implementation across diagnostics flows*

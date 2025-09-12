# Orchestration Utilities

This module provides a lightweight queue and a ready-to-use PVC triage orchestration flow.

## Components
- `OrchestrationQueue`
  - Parallel `enqueue` + `wait` for independent calls
  - `fanout` with bounded `concurrency`
  - Cancel-on-threshold using time budget consumption
- `pvcTriageOrchestration`
  - Parallel cluster health + namespace list
  - Merge and cap candidate namespaces
  - Per-namespace triage with per-NS budget allocation

## Usage
```ts
import { OrchestrationQueue, pvcTriageOrchestration } from '@/lib/orchestration/queue';

const mcp = /* your MCP-like client with call(tool, args) */

// Parallelize arbitrary reads
const q = new OrchestrationQueue(mcp, { timeMs: 60000, concurrency: 6, cancelUsageThreshold: 0.7 });
q.enqueue('health', 'oc_diagnostic_cluster_health', { sessionId, includeNamespaceAnalysis: true, depth: 'summary', budget: { timeMs: 18000 } });
q.enqueue('ns', 'oc_read_list_namespaces', { sessionId, filters: { regex: '.*' }, pagination: { limit: 500 } });
const { health, ns } = await q.wait(['health', 'ns']);

// PVC triage helper (recommended)
const result = await pvcTriageOrchestration(mcp, sessionId, { timeMs: 60000, concurrency: 6, namespaceLimit: 200 }, { regex: '.*' });
```

## Cancellation Policy
- The queue monitors `elapsed / timeMs` and cancels remaining fanout when it exceeds `cancelUsageThreshold` (default 0.7 as per platform policy; this helper may use 0.95 for completeness in tests).
- You can also call `queue.cancel()` explicitly to stop future work.
- Tools should honor their own `budget` inputs and return `ResultEnvelope.metadata.partial` and `exhaustedBudget` when applicable.

## Notes
- Prefer server-side pagination and filtering; avoid fetching unbounded lists.
- Always set a budget on multi-namespace flows and cap concurrency according to platform ceilings.
- See `/docs/llm/policy.md` and `/docs/llm/playbooks/pvc-triage.md` for the end-to-end behavior contract.


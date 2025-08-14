# MCP-OCS Beta Testing Guide

This guide provides step-by-step validation for the beta toolset, including concrete command sequences, expected outputs, common errors, and tool-specific notes (with an RCA showcase).

Prerequisites
- Node.js >= 18 and npm
- `oc` CLI installed and logged into a test/real OpenShift cluster (`oc whoami` works)
- From repo root: `npm install`
- TS runner available: use `npx tsx` (already in devDependencies)
- Optional: ChromaDB at `127.0.0.1:8000` (memory gracefully degrades if unavailable)

Quick Beta Sanity
- List validated beta tools: `npm run beta:tools` or JSON: `npm run beta:tools -- --json`
- Start beta MCP server (stdio): `npm run start:beta`

Convenience NPM Scripts (Harness)
- Real cluster diagnostics:
  - `npm run itest:real:cluster-health -- [--session s1] [--scope all|system|user] [--strategy auto|events|resourcePressure|none] [--depth summary|detailed] [--max 5] [--focus <ns>]`
  - `npm run itest:real:ns -- --ns <namespace> [--session s1] [--ingress true] [--deep true] [--maxLogs 50]`
  - `npm run itest:real:rca -- --ns <namespace> [--deep true]`
- Read ops and memory harnesses:
  - `npm run itest:beta:get-pods -- <namespace> [labelSelector]`
  - `npm run itest:beta:describe -- <resourceType> <name> [namespace]`
  - `npm run itest:beta:logs -- <namespace> <podName> [container]`
  - `npm run itest:beta:search-incidents -- [query]`
  - `npm run itest:beta:store-incident`
  - `npm run itest:beta:search-operational -- [query]`
  - `npm run itest:beta:workflow-state -- [sessionId]`
  - `npm run itest:beta:memory-stats -- [true|false]`
  - `npm run itest:beta:search-conversations -- [query]`

Tool Map (13 total)
- Diagnostics: `oc_diagnostic_cluster_health`, `oc_diagnostic_namespace_health`, `oc_diagnostic_pod_health`, `oc_diagnostic_rca_checklist`
- Read Ops: `oc_read_get_pods`, `oc_read_describe`, `oc_read_logs`, `memory_search_incidents`
- State/Mem: `memory_store_operational`, `memory_search_operational`, `core_workflow_state`, `memory_get_stats`, `memory_search_conversations`

Notes on Outputs
- All tools return JSON. Focus on key fields: status, counts, summaries, recommendations, and timestamps. Shapes are stable even if values vary with cluster state.
- When Chroma is unavailable, memory search still works over JSON stores; `memory_get_stats` reports `chromaAvailable: false`.

—

Diagnostics

1) oc_diagnostic_cluster_health
- Purpose: High-level cluster health with namespace prioritization and recommendations.
- Command:
  - `npx tsx tests/integration/real/cluster-health-real.ts --session s1 --scope all --strategy auto --depth summary --max 5`
  - Or: `npm run itest:real:cluster-health -- --session s1 --scope all --strategy auto --depth summary --max 5`
- Expected output (example):
  - JSON with: `scope`, `strategy`, `depth`, `analyzedDetailedCount`, `totalNamespaces`, `topNamespaces` (array). Example keys for each top namespace: `{ namespace, status, score, reasons, summary: { pods, pvcs, routes, criticalEvents, suspicions } }`.
- Common errors:
  - Not logged in: `error: You must be logged in to the server` → run `oc login ...`.
  - Slow API: timeouts in `oc` wrapper → rerun or increase `OC_PATH` or reduce `--max`.

2) oc_diagnostic_namespace_health
- Purpose: Deep health for a specific namespace, with optional ingress tests and deeper analysis.
- Command:
  - `npx tsx tests/integration/real/namespace-health-real.ts --ns <namespace> --session s1 --ingress true --deep true --maxLogs 50`
  - Or: `npm run itest:real:ns -- --ns <namespace> --session s1 --ingress true --deep true --maxLogs 50`
- Expected output (example):
  - JSON with: `namespace`, `status` (`healthy`/`degraded`/`failing`), `duration`, `pods`, `pvcs`, `routes`, `criticalEvents`, `suspicionsCount`.
  - If `--deep`, expect more detailed internal checks and potentially slow run (logs collection).
- Common errors:
  - Missing `--ns`: script exits with usage message.
  - Namespace not found: status `error` or suspicions include missing resources → verify namespace name.

3) oc_diagnostic_pod_health
- Purpose: Pod-level health with optional dependency and resource analysis.
- Command (create a small harness and run):
  - Create file `tmp/pod-health.ts`:
    ```ts
    import { DiagnosticToolsV2 } from '../src/tools/diagnostics/index.js';
    import { OpenShiftClient } from '../src/lib/openshift-client.js';
    import { SharedMemoryManager } from '../src/lib/memory/shared-memory.js';
    const oc = new OpenShiftClient({ ocPath: process.env.OC_PATH || 'oc', timeout: 30000 });
    const memory = new SharedMemoryManager({ domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory', enableCompression: true, retentionDays: 7, chromaHost: '127.0.0.1', chromaPort: 8000 });
    const tools = new DiagnosticToolsV2(oc, memory);
    (async () => {
      const out = await (tools as any).enhancedPodHealth({ sessionId: 's1', namespace: process.argv[2], podName: process.argv[3], includeDependencies: true, includeResourceAnalysis: true });
      console.log(out);
    })().catch(e => { console.error(e); process.exit(1); });
    ```
  - Run: `npx tsx tmp/pod-health.ts <namespace> <podName>`
  - Or: `npm run itest:beta:pod-health -- <namespace> <podName>`
- Expected output (example):
  - JSON with: `tool`, `namespace`, `podName`, `health` (issues array), optional `dependencies`, optional `resources`, `recommendations`, and a concise `human` summary.
- Common errors:
  - Pod not found: error in result → verify namespace/pod and permissions.

4) oc_diagnostic_rca_checklist (RCA showcase)
- Purpose: “First 10 Minutes” guided RCA with evidence aggregation and next actions.
- Command:
  - `npx tsx tests/integration/real/rca-real.ts --ns <namespace> --deep true`
- Expected output (example):
  - JSON with: `namespace`, `overallStatus` (`healthy`/`investigate`/`incident`), `rootCause` (string or null), `summary` (bulleted text), `nextActions` (top 3 items).
- Interpreting results:
  - Resource pressure patterns produce root causes like `resource_pressure` or hints in `summary` (e.g., Pending pods, PVC errors, image pull failures).
  - The memory system records the run; follow with memory searches to correlate similar incidents.
- Common errors:
  - API throttling or timeouts: rerun with fewer deep checks (omit `--deep`).

—

Read Operations

5) oc_read_get_pods
- Purpose: List pods in a namespace with optional label selector; stores a snapshot in memory.
- Command (harness):
  - Create `tmp/get-pods.ts`:
    ```ts
    import { ReadOpsTools } from '../src/tools/read-ops/index.js';
    import { OpenShiftClient } from '../src/lib/openshift-client.js';
    import { SharedMemoryManager } from '../src/lib/memory/shared-memory.js';
    const oc = new OpenShiftClient({ ocPath: process.env.OC_PATH || 'oc', timeout: 30000 });
    const memory = new SharedMemoryManager({ domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory', enableCompression: true, retentionDays: 7, chromaHost: '127.0.0.1', chromaPort: 8000 });
    const tools = new ReadOpsTools(oc, memory);
    (async () => { const res = await tools.executeTool('oc_read_get_pods', { namespace: process.argv[2], selector: process.argv[3], sessionId: 's1' }); console.log(res); })();
    ```
  - Run: `npx tsx tmp/get-pods.ts <namespace> [labelSelector]`
  - Or: `npm run itest:beta:get-pods -- <namespace> [labelSelector]`
- Expected output (example):
  - JSON with: `namespace`, `selector`, `totalPods`, `pods` (array with names/status), `summary` counts by status, `timestamp`.
- Common errors:
  - No permission: empty list or forbidden → check RBAC for target namespace.

6) oc_read_describe
- Purpose: `oc describe` of a resource; returns textual description within JSON and stores metadata.
- Command (harness):
  - Create `tmp/describe.ts` similar to above but `executeTool('oc_read_describe', { resourceType, name, namespace, sessionId: 's1' })`.
  - Run: `npx tsx tmp/describe.ts pod <podName> <namespace>`
  - Or: `npm run itest:beta:describe -- pod <podName> <namespace>`
- Expected output (example):
  - JSON with: `resourceType`, `name`, `namespace`, `description` (string), `timestamp`.
- Common errors:
  - Unsupported resourceType or not found → error text in result; verify resource kind/name.

7) oc_read_logs
- Purpose: Retrieve logs from a pod/container with optional `lines`/`since`.
- Command (harness):
  - Create `tmp/logs.ts` and call `executeTool('oc_read_logs', { podName, namespace, container, lines: 100, since: '1h', sessionId: 's1' })`.
  - Run: `npx tsx tmp/logs.ts <namespace> <podName> [container]`
  - Or: `npm run itest:beta:logs -- <namespace> <podName> [container]`
- Expected output (example):
  - JSON with: `podName`, `namespace`, `container`, `lines`, `since`, `logs` (string), `logLines`, `timestamp`.
- Common errors:
  - Previous container logs or init containers: specify correct `container`.
  - Large logs: tool truncates very large responses; see `truncated` flag if present.

8) memory_search_incidents
- Purpose: Search memory for similar incidents using the adapter-backed gateway (domain filter supported).
- Command (harness):
  - Create `tmp/search-incidents.ts` and call `executeTool('memory_search_incidents', { query: 'storage provisioner unreachable', domainFilter: 'openshift', limit: 5, sessionId: 's1' })` via `ReadOpsTools`.
  - Run: `npx tsx tmp/search-incidents.ts`
  - Or: `npm run itest:beta:search-incidents`
- Expected output (example):
  - JSON with: `query`, `limit`, `resultsFound`, `results[]` each with `similarity`/`relevance` (approx.), `incidentId`, `timestamp`.
- Common errors:
  - Cold memory: `resultsFound: 0` initially; populate via diagnostics or `memory_store_operational`.

—

State and Memory

9) memory_store_operational
- Purpose: Persist an incident with symptoms, root cause, and resolution.
- Command (harness):
  - Create `tmp/store-incident.ts`:
    ```ts
    import { StateMgmtTools } from '../src/tools/state-mgmt/index.js';
    import { SharedMemoryManager } from '../src/lib/memory/shared-memory.js';
    const memory = new SharedMemoryManager({ domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory', enableCompression: true, retentionDays: 7, chromaHost: '127.0.0.1', chromaPort: 8000 });
    const tools = new StateMgmtTools(memory, {} as any);
    (async () => {
      const res = await tools.executeTool('memory_store_operational', {
        incidentId: 'demo-rca-1',
        symptoms: ['openshift-monitoring degraded', 'prometheus-k8s Pending'],
        rootCause: 'resource_pressure',
        resolution: 'increased namespace quotas; restarted pods',
        affectedResources: ['namespace/openshift-monitoring'],
        environment: 'prod',
        sessionId: 's1'
      });
      console.log(res);
    })();
    ```
  - Run: `npx tsx tmp/store-incident.ts`
  - Or: `npm run itest:beta:store-incident`
- Expected output (example):
  - JSON with: `operation: 'store_incident'`, `incidentId`, `memoryId`, `status: 'success'`, `timestamp`.

10) memory_search_operational
- Purpose: Vector/text search over operational incidents; cornerstone of “operational memory”.
- Command:
  - After storing incidents, create `tmp/search-operational.ts` and call `executeTool('memory_search_operational', { query: 'resource pressure scheduling failures', limit: 5, sessionId: 's1' })` via `StateMgmtTools`.
  - Run: `npx tsx tmp/search-operational.ts`
  - Or: `npm run itest:beta:search-operational`
- Expected output (example):
  - JSON with: `query`, `limit`, `resultsFound`, `results[]` with `similarity`, `incidentId`, `symptoms[]`, `rootCause`, `resolution`, `timestamp`.
- Common errors:
  - No incidents yet: `resultsFound: 0`; run diagnostics or store incidents first.

11) core_workflow_state
- Purpose: Returns current workflow state for a session (baseline stub for now).
- Command:
  - Create `tmp/workflow-state.ts` and call `executeTool('core_workflow_state', { sessionId: 's1' })` via `StateMgmtTools`.
  - Run: `npx tsx tmp/workflow-state.ts`
  - Or: `npm run itest:beta:workflow-state`
- Expected output (example):
  - JSON with: `sessionId`, `currentState: 'unknown'`, `evidence: []`, `hypotheses: []`, `panicSignals: []`, `note`.

12) memory_get_stats
- Purpose: Memory system health and usage.
- Command:
  - Create `tmp/memory-stats.ts` and call `executeTool('memory_get_stats', { detailed: true })` via `StateMgmtTools`.
  - Run: `npx tsx tmp/memory-stats.ts`
  - Or: `npm run itest:beta:memory-stats`
- Expected output (example):
  - JSON with: `totalConversations`, `totalOperational`, `chromaAvailable` (true/false), `storageUsed`, `lastCleanup`, `namespace`, and `details` when `detailed: true`.
- Common errors:
  - None; if Chroma is down, expect `chromaAvailable: false`.

13) memory_search_conversations
- Purpose: Search conversation memory for relevant prior exchanges.
- Command:
  - Create `tmp/search-conversations.ts` and call `executeTool('memory_search_conversations', { query: 'openshift-monitoring degraded', limit: 5, sessionId: 's1' })` via `StateMgmtTools`.
  - Run: `npx tsx tmp/search-conversations.ts`
  - Or: `npm run itest:beta:search-conversations`
- Expected output (example):
  - JSON with: `query`, `resultsFound`, `results[]` with `similarity`, `relevance`, `sessionId`, `domain`, `userMessage`, `assistantResponse`, `timestamp`, `tags`.

—

Common Error Scenarios and Fixes
- oc not logged in: Any tool that calls `oc` fails; fix with `oc login ...` and ensure correct project context.
- Namespace/resource not found: Verify names; for pods add `-n <ns>` and confirm existence with `oc get`.
- Command timeouts: Reduce scope (`--max`), skip deep checks, or rerun during lower load.
- Large outputs: Some read ops truncate very large payloads to protect MCP; look for a `truncated` indicator.
- Chroma unavailable: Memory still works with JSON; `memory_get_stats` shows `chromaAvailable: false`.

RCA Showcase Workflow (end-to-end)
1) Run namespace health on `openshift-monitoring` with deep analysis:
   - `npx tsx tests/integration/real/namespace-health-real.ts --ns openshift-monitoring --deep true`
2) Run RCA checklist to aggregate evidence and next actions:
   - `npx tsx tests/integration/real/rca-real.ts --ns openshift-monitoring --deep true`
3) Store resolution from the incident:
   - Use `memory_store_operational` with `rootCause: 'resource_pressure'` and `affectedResources: ['namespace/openshift-monitoring']`.
4) Query operational memory to learn from history:
   - `memory_search_operational` with queries like `"resource pressure scheduling failures"` or `"storage provisioner unreachable"`.

Tips
- Use `OC_PATH=/custom/oc npx tsx ...` to point to a non-default `oc`.
- Add `--depth detailed` to cluster health to print detailed namespace sections.
- For repeatable tests, capture outputs to files and diff between runs.

—

Smoke Test Matrix (3–5 minutes)
- Goal: Quick end-to-end validation of diagnostics, memory, and search.
- Prereqs: Logged into a cluster; pick a namespace (e.g., `openshift-monitoring`) and any pod within it.

1) Memory health (quick sanity)
   - `npm run itest:beta:memory-stats -- true`
   - Expect `chromaAvailable` and counts; proceed even if Chroma is false.

2) Pod inventory snapshot
   - `npm run itest:beta:get-pods -- <namespace>`
   - Expect `totalPods` > 0 and a status summary.

3) Namespace health
   - `npm run itest:real:ns -- --ns <namespace> --deep true`
   - Expect JSON with `status`, `pods`, `pvcs`, `routes`, `criticalEvents`.

4) RCA checklist
   - `npm run itest:real:rca -- --ns <namespace> --deep true`
   - Expect `overallStatus`, potential `rootCause`, and `nextActions`.

5) Persist incident (demo entry)
   - `npm run itest:beta:store-incident`
   - Expect `status: "success"`.

6) Operational memory search
   - `npm run itest:beta:search-operational -- "resource pressure scheduling failures"`
   - Expect non-zero `resultsFound` once memory is seeded.

7) Conversation memory search
   - `npm run itest:beta:search-conversations -- "openshift-monitoring degraded"`
   - Expect results referencing prior runs.

8) Optional: Cluster health summary (fast)
   - `npm run itest:real:cluster-health -- --scope all --strategy auto --depth summary --max 3`
   - Expect a prioritized namespace list with scores and summaries.

Suggested validation
- Ensure each step returns valid JSON with the expected top-level fields.
- Verify at least one memory search step returns results (> 0) after seeding.
- Save outputs (`> out.json`) and compare between runs to spot regressions.

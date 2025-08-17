# MCP-ocs Architecture Overview

This document summarizes the current architecture, execution flows, and testing strategy of the MCP‑ocs project from the perspective of the recent Template Engine and Sequential Thinking work.

## Purpose & Scope
- Provide an OpenAI MCP server for OpenShift diagnostics and operations with deterministic, template‑driven troubleshooting.
- Balance speed (bounded, minimal steps) with quality (evidence contracts, memory context) and safety (boundary enforcement, workflow guidance).

## High‑Level Components
- MCP Server Entrypoints
  - `src/index.ts`: Full tool suite entrypoint with Template Engine routing.
  - `src/index-sequential.ts`: Sequential Thinking focused entrypoint with Template Engine support.
- Tooling
  - `UnifiedToolRegistry` registers tool suites and exposes `executeTool`.
  - Read‑only diagnostics in `src/tools/diagnostics`, `src/tools/read-ops`.
  - Workflow/memory helpers under `src/lib/tools`, `src/lib/memory`.
- Template System
  - `TemplateRegistry`: loads JSON templates by `triageTarget`.
  - `TemplateEngine`: builds bounded plans from templates, resolves variables/blocks, evaluates evidence completeness via selectors.
  - Templates in `src/lib/templates/templates/*.json` enforce evidence contracts with `jsonpath|yq|eventsRegex|dsl` selectors.
- Sequential Thinking Orchestrator
  - `EnhancedSequentialThinkingOrchestrator`: plans tool strategies and executes with memory‑aware hints, retries, bounded modes.
- Safety & Guidance
  - `BoundaryEnforcer`: step count, namespace allowlist, timeout filtering.
  - `WorkflowEngine`: panic detection, state guidance, and evidence gating (future integration hooks).
- Memory
  - `SharedMemoryManager`: ChromaDB vector memory + JSON stores for conversations/operational telemetry.
  - `AutoMemorySystem`: captures tool execution traces; `KnowledgeSeedingSystem` supports bootstrapping knowledge.

## Execution Flows
- Direct Tool Call
  - MCP client → `tools/call` → `UnifiedToolRegistry.executeTool()` → underlying OpenShift client invocation.
- Template Path (deterministic)
  - Request includes `triageTarget` → `TemplateRegistry.selectByTarget()` → `TemplateEngine.buildPlan()` → `BoundaryEnforcer.filterSteps()` → Execute steps → `TemplateEngine.evaluateEvidence()` → Return steps + evidence + timing.
- Sequential Thinking Path
  - Request via `sequential_thinking` or bounded shim → Orchestrator plans steps (bounded/first‑step) → Execute with retries → Memory capture.
- Dynamic Discovery (ingress & networking)
  - Ingress: after `oc_read_get_pods` in `openshift-ingress`, auto‑select pending `router-default-*` and substitute `<pendingRouterPod>`.
  - Networking: resolve `<service>` from Route describe; resolve `<backendPod>` via Service selector → `get_pods` (prefer ready pods).

## Determinism & Evidence
- Evidence Contracts
  - Each template defines required evidence keys with selectors: `jsonpath`, `yq`, `eventsRegex` (supports `(?i)`), and `dsl`.
  - `TemplateEngine.evaluateEvidence()` computes completeness and pass/fail against `completenessThreshold`.
- Determinism
  - Plans are bounded by budgets; determinism validated via `scripts/smoke/smoke-template-determinism.mjs` (visual diff of steps + hashes).

## Testing & Tooling
- E2E (real cluster)
  - `scripts/e2e/e2e-template-ingress-pending.mjs` — drives MCP over stdio; supports modes:
    - Basic assertions (3 steps, evidence pass, no 404)
    - Comprehensive (pod discovery, evidence fields, boundary, performance)
    - Perf (per‑step durations with soft threshold)
  - NPM aliases: `e2e:te-ingress:seq`, `e2e:te-ingress:deep`, `e2e:te-ingress:perf`, `e2e:te-ingress:deep:perf`, plus `:mem` variants.
- Hygiene Tests (template robustness)
  - `scripts/e2e/template-hygiene-tester.mjs` — builds plan and fabricates minimal results that satisfy evidence contracts; optional LM Studio prompt.
  - NPM aliases: `template:hygiene:test:*`, `template:hygiene:test:all`.
- Cross‑Model Hygiene (Phase 5 preparation)
  - `scripts/e2e/cross-model-runner.mjs` — runs hygiene tests across multiple models; summarizes PASS/FAIL.
- LM Studio Connector (OpenAI‑compatible)
  - `scripts/e2e/test-harness-connector.js` — POST `/v1/chat/completions`, GET `/v1/models`, supports `LMSTUDIO_MAX_TOKENS`.
  - Models list: `npm run lm:models`.

## Configuration & Environment
- Baseline server start (sequential)
  - `ENABLE_TEMPLATE_ENGINE=true ENABLE_SEQUENTIAL_THINKING=true OC_TIMEOUT_MS=120000 KUBECONFIG="/Users/kevinbrown/AWS-Bootcamp/auth/kubeconfig" npx tsx src/index-sequential.ts`
- Core vars
  - `KUBECONFIG`, `OC_TIMEOUT_MS`.
- Optional memory vars
  - `SHARED_MEMORY_DIR=/Users/kevinbrown/memory/consolidated`, `CHROMA_HOST=127.0.0.1`, `CHROMA_PORT=8000`, `TRANSFORMERS_CACHE=~/.cache/transformers`.
- LM Studio vars
  - `LMSTUDIO_BASE_URL=http://localhost:1234/v1`, `LMSTUDIO_API_KEY=lm-studio`, `LMSTUDIO_MODEL=<model>`, `LMSTUDIO_MAX_TOKENS=512`, `LMSTUDIO_DRY_RUN=true`.

## Key Files (Map)
- Entrypoints: `src/index.ts`, `src/index-sequential.ts`
- Templates: `src/lib/templates/{template-engine.ts,template-registry.ts,templates/*.json}`
- Tools: `src/lib/tools/*`, `src/tools/read-ops/index.ts`
- Memory: `src/lib/memory/*`
- Safety: `src/lib/enforcement/boundary-enforcer.ts`, `src/lib/workflow/workflow-engine.ts`
- E2E/Smoke: `scripts/e2e/*`, `scripts/smoke/*`

## Phase Roadmap (Updated)
- Phase 1 — Memory Stability: COMPLETE
- Phase 2 — E2E Template Engine: COMPLETE
- Phase 4 — Template Hygiene Sweep: IN PROGRESS (ingress complete; crashloop/route/pvc/scheduling selectors hardened; dynamic discovery extended)
- Phase 5 — Cross‑Model Validation: READY (harness scaffolded)

## Next Steps
- Add networking smoke stub to showcase route → service → pod discovery without cluster dependencies.
- Iterate hygiene tests to print per‑target evidence summaries and timing.
- Expand WorkflowEngine hooks to score real evidence and gate risky actions.
- Wire CI to run: basic E2E, hygiene all, and (optionally) cross‑model hygiene in nightly builds.


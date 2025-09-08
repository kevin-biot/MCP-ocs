# Current State Analysis

## Components and Integration Points

- Template Engine
  - Files: `src/lib/templates/template-registry.ts`, `src/lib/templates/template-engine.ts` (engine referenced in server).
  - Activation: In `src/index-sequential.ts`, Template Engine path engages only when `ENABLE_TEMPLATE_ENGINE` is true AND the tool call arguments include `triageTarget`.
  - Inputs: Selected `DiagnosticTemplate` via `TemplateRegistry.selectByTarget(target)`; engine builds a step plan, then server executes steps via registered tools.

- Rubrics
  - Files: `src/lib/rubrics/**` and usage inside `index-sequential.ts` (e.g., `evaluateRubrics(...)`).
  - Coverage: Diagnostic, infrastructure, and intelligence rubrics; support evidence completeness, triage priority, safety gating, and SLO impact hints.

- Tool Registry
  - File: `src/lib/tools/tool-registry.ts`.
  - Capability: Registers suites and single tools; exposes MCP tool list and execution via registry façade.
  - Current suites: diagnostic-v2, read-ops-v2, workflow-v2, infrastructure-v1; 16 total tools registered in sequential entry.

- Server Entry (Sequential)
  - File: `src/index-sequential.ts`.
  - Key logic:
    - Registers tool suites and a `sequential_thinking` tool.
    - Template Engine path in `CallTool` handler when `triageTarget` present.
    - Pre-orchestration shim for Sequential Thinking on bounded diagnostic intent.
    - Post-hook shim for ingress pending (can be swapped to template).
    - Safety boundaries enforced via `BoundaryEnforcer` for template runs.

## Safety Mechanisms

- BoundaryEnforcer
  - Enforces `maxSteps`, `timeoutMs`, and optionally allowed namespaces on template plans.
  - Used directly in `index-sequential.ts` Template Engine path.

- Bounded Execution
  - Template definitions include boundaries (e.g., maxSteps=3, timeoutMs=20000).
  - Server also supports `bounded: true` and `stepBudget` to keep triage tight.

- Read-only Preference
  - Templates use read-ops/diagnostic tools (`oc_read_*`, `oc_diagnostic_*`), which are non-mutating.
  - Any mutating actions remain separate and require explicit tool invocations.

## Evidence and Envelope

- Evidence Completeness
  - `TemplateEngine` supports evaluating evidence completeness against an evidence contract in the template.

- Summaries and Rubrics
  - `index-sequential.ts` constructs a normalized summary using rubrics (priority, confidence, safety) and deterministic envelope metadata (engine version, model fingerprint).

## Gap Summary

- Template Engine engagement requires `triageTarget` in arguments. LLMs won’t naturally supply it, causing an unnatural UX.
- Templates are not visible in MCP tools (by design), so routing must be internal and transparent.
- Current auto-shims help bounded behavior but aren’t a substitute for deterministic, template-driven triage.


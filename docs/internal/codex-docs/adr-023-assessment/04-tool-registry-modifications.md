# Tool Registry Modifications

## Current Pattern
- `UnifiedToolRegistry` registers suites and ad-hoc tools, returning MCP-compatible tool descriptors.
- `src/index-sequential.ts` registers tool suites and an explicit `sequential_thinking` tool, then exposes them through MCP handlers.

## Adding oc_triage
- Register `oc_triage` after suites initialization:
  - Name: `oc_triage`
  - Category: `diagnostic`
  - Version: `v1`
  - Input schema: see `code-samples/oc-triage-tool-definition.ts`
  - Execute: normalize → select template → build bounded plan → execute steps → evaluate rubrics → return TriageEnvelope

## No Breaking Changes
- Existing tools remain visible and unmodified.
- Templates remain invisible; routing is internal to the tool handler.

## Optional Improvement
- Swap existing post-hook for ingress pending (currently runs a mini-plan with sequential thinking) to execute the `ingress-pending` template for consistent envelopes.


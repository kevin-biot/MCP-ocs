# LLM Retest Checklist (MCP + LM Studio)

This runbook helps you rebuild, restart, and validate the MCP server and LM Studio tool-calling setup with consistent environment settings.

## 1) Environment Prep
- Node: ensure v18+ (`node -v`)
- OpenShift auth:
  - `oc whoami` (if it errors → `oc login ...` in the same shell)
- Exports (adjust paths and values as needed):
  - `export KUBECONFIG="/Users/you/path/to/kubeconfig"`
  - `export OC_TIMEOUT_MS=120000`  # increase if you see timeouts
  - Optional memory env: `export SHARED_MEMORY_DIR=./memory` `export CHROMA_HOST=127.0.0.1` `export CHROMA_PORT=8000` `export TRANSFORMERS_CACHE=~/.cache/transformers`

## 2) Clean Build
```bash
npm run clean
npm run build
```

## 3) Quick Self-Check (no cluster required)
- In a shell with the above env, run:
```bash
npx tsx tmp/smoke-sequential-ingress.ts
npx tsx tmp/smoke-sequential-rca.ts
```
- Expected:
  - Ingress smoke prints planned tools including `oc_read_get_pods` (operator + ingress) and `oc_read_describe` (ingresscontroller/default).
  - RCA smoke shows:
    - “Check ingress operator health” → rcaPlanned=false
    - “Multiple apps failing … (unbounded)” → rcaPlanned=true
    - “router pod pending” (bounded) → escalation planned (bounded RCA), rca not in initial steps
    - “Full cluster analysis …” → rcaPlanned=true

## 4) Start MCP Server
- Standard entrypoint:
```bash
OC_TIMEOUT_MS=120000 npx tsx src/index.ts
```
- Sequential entrypoint (recommended for testing):
```bash
ENABLE_SEQUENTIAL_THINKING=true OC_TIMEOUT_MS=120000 npx tsx src/index-sequential.ts
```

## 5) LM Studio Setup
- Model: choose a model with strong tool-calling support
- Settings:
  - Enable tool calling (or strict tool-call mode)
  - If tool-call formatting is flaky, use “Only respond with a tool call …” prompts
- Connection: point LM Studio client to the MCP server process (stdio or your adapter) as per your integration

## 6) Validation Prompts
- Bounded + one step:
  - “Use sequential thinking to investigate API latency in openshift-monitoring. Plan: namespace health (skip ingress), then list Prometheus pods. Bounded mode; execute one step only and reflect. Session: seq-demo-aws.”
- Continue:
  - “Continue the plan for session seq-demo-aws. Stay bounded; execute only the next planned step and reflect.”
- Ingress 503:
  - “Start a bounded, step-by-step plan focused only on ingress troubleshooting. 503s for external users. First check ingress operator (openshift-ingress-operator), then router pods (openshift-ingress), then ingress resources. Execute one step only and reflect. Session: ingress-503-debug.”
- Verify capture:
  - “Search operational memory for recent tool executions in session seq-demo-aws and summarize the last 5 actions.”

## 7) Direct Tool Calls (fallback)
```bash
oc_read_get_pods({ sessionId: "ingress-503-debug", namespace: "openshift-ingress-operator" })
oc_read_get_pods({ sessionId: "ingress-503-debug", namespace: "openshift-ingress" })
oc_read_describe({ sessionId: "ingress-503-debug", resourceType: "ingresscontroller", name: "default", namespace: "openshift-ingress-operator" })
```

## 8) RCA Policy (quick reference)
- Specific requests stay targeted (no RCA by default)
- Complex/unclear + unbounded → comprehensive RCA
- Explicit comprehensive requests → RCA (bounded variant if bounded=true)
- Escalation to RCA when red flags appear (bounded if bounded=true)

## 9) Troubleshooting
- Credentials: run `oc whoami` and `oc login` in the same shell as the MCP server
- Timeouts: bump `OC_TIMEOUT_MS`, use `firstStepOnly=true`
- Tool-calling: enforce strict tool-call mode or use direct tool calls
- Memory indexing: if Chroma is down, JSON fallback still records results; rerun smoke tests


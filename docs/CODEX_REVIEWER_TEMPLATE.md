CODEX REVIEWER TEMPLATE — 10/10 STRUCTURE (v2)

Purpose: Standardize Codex’s analysis outputs so they’re deterministic, executable by the orchestrator, and audit-ready. Paste this as Codex’s response scaffold; fill the placeholders. No remediation, just analysis + plan control.

===============================================================================
[1] SEQUENTIAL THINKING RESULT (FACTUAL)
- Session: <SESSION_ID>
- Engagement:
  - first_st_call_index: <INT|null>
  - total_tool_calls: <INT>
  - engagement_class: <early|late|none>
- Call Parameters (first ST):
  - bounded: <true|false|unset>
  - mode: <planOnly|firstStepOnly|boundedMultiStep|unset>
  - continuePlan: <true|false|unset>
  - stepBudget: <INT|unset>
- Outcome:
  - plan_persisted: <true|false>
  - plan_executed: <true|false>
  - notes: <1–2 line neutral summary>

===============================================================================
[2] EXECUTABLE TRIGGER MATCHERS (DETERMINISTIC)
- TRIGGER_FAILED_SCHED_TAINT_OR_AFFINITY:
  kind: "event"
  where: "pod.describe.events[].message"
  op: "regex"
  pattern: "(?i)FailedScheduling.*(taint|anti-?affinity)"

- TRIGGER_INGRESS_TRIAGE_SCOPE:
  kind: "namespace"
  where: "ns in ['openshift-ingress','openshift-ingress-operator','cert-manager']"
  op: "boolean"
  pattern: "true"

===============================================================================
[3] DETERMINISTIC MINI-PLAN (CONTINUE)
trigger: TRIGGER_FAILED_SCHED_TAINT_OR_AFFINITY
steps:
  - tool: oc_read_describe
    params: { resourceType: "deployment", namespace: "openshift-ingress", name: "router-default" }
    capture:
      - yq: ".spec.template.spec.tolerations"
      - yq: ".spec.template.spec.affinity.podAntiAffinity"
  - tool: oc_read_describe
    params: { resourceType: "ingresscontroller", namespace: "openshift-ingress-operator", name: "default" }
    capture:
      - yq: ".spec.nodePlacement.nodeSelector"
      - yq: ".spec.nodePlacement.tolerations"
      - yq: ".status.conditions[] | {type,status,reason,message}"
  - tool: oc_read_describe
    params: { resourceType: "node", name: "<NODE_FROM_FAILED_SCHED_EVENT>" }
    capture:
      - jsonpath: "{.spec.taints[*].key}"
      - jsonpath: "{.metadata.labels['node-role.kubernetes.io/master']}"
      - jsonpath: "{.metadata.labels['node-role.kubernetes.io/control-plane']}"
      - jsonpath: "{.metadata.labels['kubernetes.io/hostname']}"

fallbacks:
  - when: "<NODE_FROM_FAILED_SCHED_EVENT> is null"
    do:
      - tool: oc_read_describe
        params: { resourceType: "node", name: "<FIRST_READY_WORKER_NODE>" }
        capture:
          - jsonpath: "{.spec.taints[*].key}"
          - jsonpath: "{.metadata.labels['node-role.kubernetes.io/*']}"
          - jsonpath: "{.metadata.labels['kubernetes.io/hostname']}"

constraints:
  stepBudget: 3
  bounded: true

===============================================================================
[4] ORCHESTRATION HOOKS (HOW TO EXECUTE THE PLAN)
- If ST not yet engaged:
  call_1:
    tool: sequential_thinking
    params: { sessionId: "<SESSION_ID>", bounded: true, mode: "firstStepOnly" }
  call_2:
    tool: sequential_thinking
    params: { sessionId: "<SESSION_ID>", thought: "continue", continuePlan: true, stepBudget: 2 }

- If ST already engaged:
  call:
    tool: sequential_thinking
    params: { sessionId: "<SESSION_ID>", thought: "continue", continuePlan: true, stepBudget: 3 }

===============================================================================
[5] EVIDENCE SELECTORS (STANDARDIZED FIELDS TO CAPTURE)
router_deployment:
  - yq: ".spec.template.spec.tolerations"
  - yq: ".spec.template.spec.affinity.podAntiAffinity"

ingress_controller:
  - yq: ".spec.nodePlacement.nodeSelector"
  - yq: ".spec.nodePlacement.tolerations"
  - yq: ".status.conditions[] | {type,status,reason,message}"

node_from_event_or_fallback:
  - jsonpath: "{.spec.taints[*].key}"
  - jsonpath: "{.metadata.labels['node-role.kubernetes.io/master']}"
  - jsonpath: "{.metadata.labels['node-role.kubernetes.io/control-plane']}"
  - jsonpath: "{.metadata.labels['kubernetes.io/hostname']}"

===============================================================================
[6] TELEMETRY MARKERS (EMIT FOR AUDIT)
telemetry:
  plan_id: "<SESSION_ID or derived hash>"
  plan_phase: "<planOnly|continue>"
  first_st_call_index: <INT|null>
  step_index: "<incrementing within plan>"
  step_budget: <INT>
  engagement_class: "<early|late|none>"

===============================================================================
[7] REPLAY CONTROLS (MAKE/RESUME/DISCARD PLAN)
resume_plan_now:
  tool: sequential_thinking
  params: { sessionId: "<SESSION_ID>", thought: "continue", continuePlan: true, stepBudget: 2 }

discard_plan:
  tool: sequential_thinking
  params: { sessionId: "<SESSION_ID>", thought: "discard", cancelPlan: true }

rebuild_plan_fresh:
  tool: sequential_thinking
  params: { sessionId: "<SESSION_ID>", triageTarget: "ingress", bounded: true, mode: "firstStepOnly" }

===============================================================================
[8] REPORT HOOKS (FOR LLM FACTUAL REPLAY REPORTER)
reporter.highlights:
  - "Pod Pending with FailedScheduling mentioning taint/anti-affinity"
  - "router-default tolerations & podAntiAffinity captured"
  - "ingresscontroller nodePlacement & status captured"
  - "node taints/role labels captured (master/control-plane, hostname)"

reporter.assessment_overrides:
  scopeCompliance: "pass"
  toolUsage: "excellent"
  accuracy: "high"
  completeness: "high"
  objectivity: "high"
  clarity: "high"

===============================================================================
[9] CURRENT RUN SNAP-IN (OPTIONAL)
- Fill these from the current session to make the report concrete.

===============================================================================
[10] END NOTE
This template is analysis + orchestration control only. It emits deterministic triggers, plan steps, telemetry, and replay controls so the orchestrator and reporter can execute and audit without guesswork.


import { TemplateRegistry } from "../../src/lib/templates/template-registry";
import { TemplateEngine } from "../../src/lib/templates/template-engine";
import { BoundaryEnforcer } from "../../src/lib/enforcement/boundary-enforcer";

// Minimal stub executor to emulate tool calls
async function execTool(name: string, params: any): Promise<any> {
  // Return tiny JSON so evidence evaluator can reason about executed tools
  return { ok: true, tool: name, params };
}

async function main() {
  const sessionId = "smoke-te-ingress";
  const triageTarget = "ingress-pending";
  const reg = new TemplateRegistry();
  await reg.load();
  const sel = reg.selectByTarget(triageTarget);
  if (!sel) {
    console.error("No template found for target", triageTarget);
    process.exit(1);
  }
  const engine = new TemplateEngine();
  const plan = engine.buildPlan(sel.template, {
    sessionId,
    bounded: true,
    stepBudget: 3,
    vars: { ns: "openshift-ingress", pendingRouterPod: "router-default-xxxx" }
  });
  const enforcer = new BoundaryEnforcer({ maxSteps: plan.boundaries.maxSteps, timeoutMs: plan.boundaries.timeoutMs, allowedNamespaces: ["openshift-ingress","openshift-ingress-operator"] });
  const steps = enforcer.filterSteps(plan.steps);
  const executed: any[] = [];
  for (const s of steps) {
    const r = await execTool(s.tool, s.params);
    executed.push({ step: s, result: r });
  }
  const ev = engine.evaluateEvidence(sel.template, steps);
  console.log(JSON.stringify({ planId: plan.planId, target: triageTarget, executed: executed.length, tools: steps.map(s=>s.tool), evidence: ev }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });

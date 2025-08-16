import { EnhancedSequentialThinkingOrchestrator } from "../../src/lib/tools/sequential-thinking-with-memory.ts";
import { SharedMemoryManager } from "../../src/lib/memory/shared-memory.ts";

const registry = {
  getAllTools() {
    return [
      { name: 'oc_read_get_pods' },
      { name: 'oc_read_describe' },
      { name: 'oc_diagnostic_namespace_health' }
    ] as any;
  },
  async executeTool(name: string, args: any) {
    return JSON.stringify({ ok: true, tool: name, args });
  }
} as any;

async function main() {
  const sessionId = 'smoke-plan-continue';
  const memory = new SharedMemoryManager({ domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory' });
  await memory.initialize();
  const orch = new EnhancedSequentialThinkingOrchestrator(registry, memory);

  // Plan only
  const plan = await orch.handleUserRequest('Ingress triage plan only', sessionId, { mode: 'planOnly', bounded: true, nextThoughtNeeded: true, triageTarget: 'ingress' as any });
  // Resume two steps
  const cont = await orch.handleUserRequest('continue', sessionId, { continuePlan: true, stepBudget: 2, bounded: true });

  // Inspect memory for plan and pointer
  const planMem = await memory.searchOperational(`${sessionId} plan_strategy`, 2);
  const ptrMem = await memory.searchOperational(`plan-pointer-${sessionId}`, 1);

  console.log(JSON.stringify({
    plannedSteps: plan.toolStrategy.steps.length,
    continueExecuted: cont.finalResult?.steps?.length || 0,
    pointerIndex: (ptrMem[0] as any)?.memory?.metadata?.index ?? null,
    telemetryPlan: (planMem[0] as any)?.memory?.metadata || {}
  }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });


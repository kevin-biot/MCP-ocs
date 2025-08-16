import { EnhancedSequentialThinkingOrchestrator } from "../../src/lib/tools/sequential-thinking-with-memory.ts";
import { SharedMemoryManager } from "../../src/lib/memory/shared-memory.ts";

const redFlagMsg = `Warning  FailedScheduling  1m (x5 over 10m)  default-scheduler  0/4 nodes are available: 1 node(s) didn't match pod anti-affinity rules, 3 node(s) had untolerated taint {node-role.kubernetes.io/master: }. preemption: 0/4 nodes are available: 1 node(s) didn't match pod anti-affinity rules, 3 Preemption is not helpful for scheduling. Node: ip-10-0-77-117.eu-west-1.compute.internal`;

const registry = {
  getAllTools() {
    return [
      { name: 'oc_read_get_pods' },
      { name: 'oc_read_describe' }
    ] as any;
  },
  async executeTool(name: string, args: any) {
    // Return red-flag output on first step to trigger mini-plan persistence
    if (name === 'oc_read_get_pods') {
      return redFlagMsg;
    }
    return JSON.stringify({ ok: true, tool: name, args });
  }
} as any;

async function main() {
  const sessionId = 'smoke-redflag-mini-plan';
  const memory = new SharedMemoryManager({ domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory' });
  await memory.initialize();
  const orch = new EnhancedSequentialThinkingOrchestrator(registry, memory);

  const res = await orch.handleUserRequest('Ingress triage bounded', sessionId, { bounded: true, triageTarget: 'ingress' as any, firstStepOnly: true });
  // Search for mini-plan in memory (plan_strategy with mini_plan tag/metadata)
  const plans = await memory.searchOperational(`${sessionId} plan_strategy`, 5);
  const meta = (plans[0] as any)?.memory?.metadata || {};
  console.log(JSON.stringify({ executedSteps: res.finalResult?.steps?.length || 0, miniPlan: meta, hasTrigger: !!meta.trigger }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });


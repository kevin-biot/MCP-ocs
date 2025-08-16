import { EnhancedSequentialThinkingOrchestrator } from "../../src/lib/tools/sequential-thinking-with-memory.ts";
import { SharedMemoryManager } from "../../src/lib/memory/shared-memory.ts";

const registry = {
  getAllTools() {
    return [
      { name: 'oc_read_get_pods' },
      { name: 'oc_read_describe' }
    ] as any;
  },
  async executeTool(name: string, args: any) {
    return JSON.stringify({ ok: true, tool: name, args });
  }
} as any;

async function main() {
  const sessionId = 'smoke-ingress-multistep';
  const memory = new SharedMemoryManager({ domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory' });
  await memory.initialize();
  const orch = new EnhancedSequentialThinkingOrchestrator(registry, memory);

  const res = await orch.handleUserRequest('Ingress triage bounded', sessionId, { bounded: true, triageTarget: 'ingress' as any });

  const steps = res.finalResult?.steps || [];
  const first = steps[0]?.step?.tool;
  const second = steps[1]?.step?.tool;
  const secondParams = steps[1]?.step?.parameters;
  console.log(JSON.stringify({ executed: steps.length, first, second, secondParams }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });


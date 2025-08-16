import { EnhancedSequentialThinkingOrchestrator } from "../src/lib/tools/sequential-thinking-with-memory.ts";
import { SharedMemoryManager } from "../src/lib/memory/shared-memory.ts";

// Minimal registry stub to avoid real oc calls
const registry = {
  getAllTools() {
    return [
      { name: 'oc_read_get_pods' },
      { name: 'oc_read_describe' },
      { name: 'oc_diagnostic_namespace_health' },
    ] as any;
  },
  async executeTool(name: string, args: any) {
    return JSON.stringify({
      success: true,
      tool: name,
      args,
      note: 'stubbed execution for smoke test'
    });
  }
} as any;

async function main() {
  const memory = new SharedMemoryManager({
    domain: 'mcp-ocs',
    namespace: 'default',
    memoryDir: './memory',
  });
  await memory.initialize();

  const orch = new EnhancedSequentialThinkingOrchestrator(registry, memory);
  const session = 'ingress-503-debug';
  const prompt = 'Start a bounded, step-by-step plan focused only on ingress troubleshooting. 503s for external users. First check ingress operator (openshift-ingress-operator), then router pods (openshift-ingress), then ingress resources. Execute one step only and reflect. Session: ingress-503-debug.';

  const res = await orch.handleUserRequest(prompt, session, { bounded: true, firstStepOnly: true });

  const out = {
    plannedTools: res.toolStrategy.steps.map(s => s.tool),
    firstStep: res.toolStrategy.steps[0],
    suggestions: res.suggestions,
    finalSummary: res.finalResult?.summary || res.finalResult?.note || '',
  };
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error('Smoke test failed:', e);
  process.exit(1);
});

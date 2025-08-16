import { EnhancedSequentialThinkingOrchestrator } from "../../src/lib/tools/sequential-thinking-with-memory.ts";
import { SharedMemoryManager } from "../../src/lib/memory/shared-memory.ts";

// Stub registry with controllable responses to trigger red flags
const registry = {
  getAllTools() {
    return [
      { name: 'oc_read_get_pods' },
      { name: 'oc_read_describe' },
      { name: 'oc_diagnostic_rca_checklist' },
    ] as any;
  },
  async executeTool(name: string, args: any) {
    if (name === 'oc_read_get_pods' && String(args?.namespace).includes('ingress') && args?.injectPending) {
      return JSON.stringify({ status: 'degraded', pods: [{ name: 'router-abc', status: 'Pending' }] });
    }
    return JSON.stringify({ success: true, tool: name, args });
  }
} as any;

async function runCase(label: string, prompt: string, opts: { bounded: boolean; firstStepOnly?: boolean }, injectPending?: boolean) {
  const memory = new SharedMemoryManager({ domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory' });
  await memory.initialize();
  const orch = new EnhancedSequentialThinkingOrchestrator(registry, memory);
  // small hack to make first oc_read_get_pods show pending when desired
  (registry as any).executeTool = async (name: string, args: any) => {
    if (name === 'oc_read_get_pods' && injectPending && String(args?.namespace).includes('ingress')) {
      return JSON.stringify({ status: 'degraded', pods: [{ name: 'router-abc', status: 'Pending' }] });
    }
    return JSON.stringify({ success: true, tool: name, args });
  };

  const res = await orch.handleUserRequest(prompt, `rca-${label}`, opts);
  const planned = res.toolStrategy.steps.map(s => s.tool);
  const rcaPlanned = planned.includes('oc_diagnostic_rca_checklist');
  const rcaStep = res.toolStrategy.steps.find(s => s.tool === 'oc_diagnostic_rca_checklist');
  console.log(JSON.stringify({ label, bounded: opts.bounded, planned, rcaPlanned, rcaParams: rcaStep?.parameters, suggestions: res.suggestions.slice(0,3) }, null, 2));
}

async function main() {
  await runCase('specific_no_rca', 'Check ingress operator health', { bounded: true, firstStepOnly: true });
  await runCase('multiple_apps_unbounded', 'Multiple applications failing across namespaces; we don\'t know why', { bounded: false, firstStepOnly: true });
  await runCase('router_pending_escalate', 'router pod pending in openshift-ingress namespace', { bounded: true, firstStepOnly: true }, true);
  await runCase('full_cluster', 'Do a full cluster analysis and provide a complete incident report', { bounded: false, firstStepOnly: true });
}

main().catch(e => { console.error(e); process.exit(1); });


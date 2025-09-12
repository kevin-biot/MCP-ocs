// Smoke test using built JS to observe sequential defaults
import { EnhancedSequentialThinkingOrchestrator } from '../dist/src/lib/tools/sequential-thinking-with-memory.js';
import { SharedMemoryManager } from '../dist/src/lib/memory/shared-memory.js';
import { createSessionId } from '../dist/src/utils/session.js';

const registry = {
  getAllTools() {
    return [
      { name: 'oc_read_get_pods' },
      { name: 'oc_read_describe' },
      { name: 'oc_diagnostic_rca_checklist' },
    ];
  },
  async executeTool(name, args) {
    // Just echo to validate that placeholder guard and session injection work
    return JSON.stringify({ ok: true, name, args });
  },
};

async function main() {
  const memory = new SharedMemoryManager({ domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory' });
  await memory.initialize();
  const orch = new EnhancedSequentialThinkingOrchestrator(registry, memory);
  const session = createSessionId('smoke');

  // Call without specifying mode/stepBudget to exercise defaults
  const res = await orch.handleUserRequest('triage ingress instability', session, {});
  const out = {
    modeObserved: 'boundedMultiStep (in orchestrator default path)',
    plannedSteps: res.toolStrategy?.steps?.length,
    firstTwoTools: res.toolStrategy?.steps?.slice(0,2)?.map(s => s.tool),
    finalSummary: res.finalResult?.summary || res.finalResult?.note || ''
  };
  console.log(JSON.stringify(out, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });


import { EnhancedSequentialThinkingOrchestrator } from '@/lib/tools/sequential-thinking-with-memory.js';
import { UnifiedToolRegistry } from '@/lib/tools/tool-registry.js';

describe('EnhancedSequentialThinkingOrchestrator - basic', () => {
  it('generates a strategy and executes with mocks', async () => {
    const mockRegistry: any = {
      getAllTools: jest.fn().mockReturnValue([
        { name: 'oc_diagnostic_cluster_health' },
        { name: 'oc_diagnostic_namespace_health' },
        { name: 'oc_diagnostic_rca_checklist' },
        { name: 'oc_diagnostic_pod_health' },
        { name: 'oc_read_get_pods' },
      ]),
      executeTool: jest.fn().mockResolvedValue(JSON.stringify({ success: true })),
    } as Partial<UnifiedToolRegistry> as any;

    const mockMemory: any = {
      searchOperational: jest.fn().mockResolvedValue([
        { memory: { symptoms: ['monitoring alerts'], diagnosticSteps: ['cluster_health', 'namespace_health'] } },
        { memory: { symptoms: ['pod crash'], diagnosticSteps: ['pod_health'] } },
      ]),
      storeOperational: jest.fn().mockResolvedValue('ok'),
    };

    const orchestrator = new EnhancedSequentialThinkingOrchestrator(mockRegistry, mockMemory);
    const res = await orchestrator.handleUserRequest('monitoring issue with timeouts', 'test-session');

    expect(res.success).toBe(true);
    expect(res.toolStrategy.steps.length).toBeGreaterThan(0);
    expect(mockRegistry.executeTool).toHaveBeenCalled();
  });
});

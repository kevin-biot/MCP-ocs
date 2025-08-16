import { EnhancedSequentialThinkingOrchestrator } from '@/lib/tools/sequential-thinking-with-memory.js';
import { UnifiedToolRegistry } from '@/lib/tools/tool-registry.js';

describe('Sequential thinking integration (light)', () => {
  it('handles network-reset-like errors with retries (mock)', async () => {
    const execSeq = [
      Promise.reject(new Error('ECONNRESET: network reset')),
      Promise.resolve(JSON.stringify({ success: true })),
    ];

    const mockRegistry: any = {
      getAllTools: jest.fn().mockReturnValue([
        { name: 'oc_diagnostic_cluster_health' },
      ]),
      executeTool: jest.fn().mockImplementation(() => execSeq.shift()!),
    } as Partial<UnifiedToolRegistry> as any;

    const mockMemory: any = {
      searchOperational: jest.fn().mockResolvedValue([]),
      storeOperational: jest.fn().mockResolvedValue('ok'),
    };

    const orch = new EnhancedSequentialThinkingOrchestrator(mockRegistry, mockMemory);
    const out = await orch.handleUserRequest('cluster health check', 's');
    expect(out.success).toBe(true);
  });
});

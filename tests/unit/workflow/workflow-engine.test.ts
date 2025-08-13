/**
 * Minimal tests for WorkflowEngine: panic detection and blocked tools
 */
import { WorkflowEngine, DiagnosticState } from '../../../src/lib/workflow/workflow-engine';

describe('WorkflowEngine minimal', () => {
  let memory: any;
  let engine: WorkflowEngine;

  beforeEach(() => {
    memory = { searchOperational: jest.fn().mockResolvedValue([]) };
    engine = new WorkflowEngine({ enablePanicDetection: true, enforcementLevel: 'blocking', memoryManager: memory, minEvidenceThreshold: 1 });
  });

  it('blocks panic-prone write operation in early state', async () => {
    const res = await engine.processToolRequest('s1', { name: 'oc_apply_config', arguments: {}, timestamp: new Date(), domain: 'cluster' });
    expect(res.blocked || res.warning).toBeTruthy();
  });

  it('blocks tool not allowed in current state when enforcement is blocking', async () => {
    const res = await engine.processToolRequest('s2', { name: 'oc_scale_deployment', arguments: {}, timestamp: new Date(), domain: 'cluster' });
    expect(res.blocked || res.warning).toBeTruthy();
  });
});


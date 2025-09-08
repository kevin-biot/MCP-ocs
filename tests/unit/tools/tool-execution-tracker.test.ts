/**
 * Unit tests for ToolExecutionTracker
 */

import { ToolExecutionTracker } from '../../../src/lib/tools/tool-execution-tracker';

describe('ToolExecutionTracker', () => {
  const toolCall = {
    toolName: 'test_tool',
    sessionId: 'sess-123',
    arguments: { a: 1 },
  } as any;

  let memoryManager: any;
  let tracker: ToolExecutionTracker;

  beforeEach(() => {
    memoryManager = {
      storeToolMemory: jest.fn().mockResolvedValue('mem-1'),
      getMemory: jest.fn().mockResolvedValue({ id: 'mem-1', data: 'stored' }),
      queryRelevantMemories: jest.fn().mockResolvedValue([{ id: 'rel-1' }]),
      cleanupOldMemories: jest.fn().mockResolvedValue(3),
    };
    tracker = new ToolExecutionTracker(memoryManager);
  });

  it('executes successfully, stores memory, and records history', async () => {
    const execFn = jest.fn().mockResolvedValue({ success: true, data: 42, timestamp: Date.now() });
    const result = await tracker.executeWithMemory(toolCall, execFn, { ctx: true });

    expect(result).toMatchObject({ success: true, data: 42 });
    expect(memoryManager.storeToolMemory).toHaveBeenCalledTimes(1);
    const args = memoryManager.storeToolMemory.mock.calls[0];
    // storeToolMemory(toolCall, result, context)
    expect(args[0]).toBe(toolCall);
    expect(args[1]).toMatchObject({ success: true });
    expect(args[2]).toEqual({ ctx: true });

    const recent = tracker.getRecentExecutions(1);
    expect(recent).toHaveLength(1);
    const first = recent[0]!;
    expect(first.status).toBe('completed');
    expect(first.memoryId).toBe('mem-1');
    expect(first.duration!).toBeGreaterThanOrEqual(0);
  });

  it('records failure, stores error memory, and rethrows', async () => {
    const execFn = jest.fn().mockRejectedValue(new Error('boom'));
    await expect(tracker.executeWithMemory(toolCall, execFn, { ctx: 'x' })).rejects.toThrow('boom');

    // storeToolMemory should be called with error result (success: false)
    expect(memoryManager.storeToolMemory).toHaveBeenCalledTimes(1);
    const args = memoryManager.storeToolMemory.mock.calls[0];
    expect(args[1]).toMatchObject({ success: false });

    const recent = tracker.getRecentExecutions(1);
    expect(recent).toHaveLength(1);
    const first = recent[0]!;
    expect(first.status).toBe('failed');
    expect(first.memoryId).toBe('mem-1');
  });

  it('retrieves execution by id and fetches its memory', async () => {
    const execFn = jest.fn().mockResolvedValue({ success: true, data: 'ok', timestamp: Date.now() });
    await tracker.executeWithMemory(toolCall, execFn);
    const [exec] = tracker.getRecentExecutions(1);
    const mem = await tracker.getExecutionMemory(exec!.id);
    expect(memoryManager.getMemory).toHaveBeenCalledWith('mem-1');
    expect(mem).toEqual({ id: 'mem-1', data: 'stored' });
  });

  it('returns null memory when execution or memoryId is missing', async () => {
    const missing = await tracker.getExecutionMemory('nope');
    expect(missing).toBeNull();
  });

  it('queries relevant memories via memory manager', async () => {
    const res = await tracker.queryRelevantMemories('query', ['t1'], 2);
    expect(memoryManager.queryRelevantMemories).toHaveBeenCalledWith('query', ['t1'], 2);
    expect(res).toEqual([{ id: 'rel-1' }]);
  });

  it('cleans up old executions and aggregates memory cleanup count', async () => {
    // create two old records by injecting into the internal map via a run then adjusting timestamp
    const execFn = jest.fn().mockResolvedValue({ success: true, data: 'x', timestamp: Date.now() });
    await tracker.executeWithMemory(toolCall, execFn);
    await tracker.executeWithMemory({ ...toolCall, toolName: 'another' }, execFn);

    const recents = tracker.getRecentExecutions(10);
    // Force them old
    const cutoff = Date.now() - 10 * 24 * 60 * 60 * 1000; // 10 days
    for (const r of recents) {
      (r as any).timestamp = cutoff - 1000;
    }

    // Now cleanup 7 days old, should delete 2 local + add 3 from memory manager mock
    const deleted = await tracker.cleanupOldExecutions(7);
    expect(deleted).toBeGreaterThanOrEqual(3); // includes memory cleanup
    expect(memoryManager.cleanupOldMemories).toHaveBeenCalledWith(7);
  });
});

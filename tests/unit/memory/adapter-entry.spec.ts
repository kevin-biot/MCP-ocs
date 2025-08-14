import { describe, it, expect, beforeEach } from '@jest/globals';
import { createOcsAdapter } from '@/lib/memory/adapter-entry';
import {
  initializeMock,
  storeConversationMock,
} from '../../mocks/memory-extension';

describe('createOcsAdapter helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes and returns a working adapter', async () => {
    const adapter = await createOcsAdapter('./memory');
    expect(initializeMock).toHaveBeenCalled();

    await adapter.storeIncidentMemory({
      sessionId: 's-x',
      timestamp: Date.now(),
      userMessage: 'u',
      assistantResponse: 'a',
      context: [],
      tags: [],
      domain: 'openshift',
      environment: 'dev',
      severity: 'low'
    } as any);
    expect(storeConversationMock).toHaveBeenCalled();
  });
});


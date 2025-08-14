import { describe, it, expect, beforeEach } from '@jest/globals';
import { runAdapterDemo } from './adapter-usage-example';
import { initializeMock, storeConversationMock, searchRelevantMemoriesMock } from '../../mocks/memory-extension';
describe('Adapter Usage Example (mocked)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('runs demo without errors and triggers expected calls', async () => {
        // Prepare search to return one item for structured response
        searchRelevantMemoriesMock.mockResolvedValueOnce([
            { metadata: { sessionId: 'example-session', timestamp: Date.now(), userMessage: 'u', assistantResponse: 'a', tags: [] }, distance: 0.1 }
        ]);
        await expect(runAdapterDemo()).resolves.toBeUndefined();
        expect(initializeMock).toHaveBeenCalled();
        expect(storeConversationMock).toHaveBeenCalled();
        expect(searchRelevantMemoriesMock).toHaveBeenCalled();
    });
});

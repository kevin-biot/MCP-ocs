import { jest } from '@jest/globals';
export const initializeMock = jest.fn(async () => { });
export const storeConversationMock = jest.fn(async (_) => true);
export const searchRelevantMemoriesMock = jest.fn(async (_q, _s, _l) => []);
export const isAvailableMock = jest.fn(async () => true);
export class ChromaMemoryManager {
    memoryDir;
    constructor(memoryDir) {
        this.memoryDir = memoryDir;
    }
    initialize = initializeMock;
    storeConversation = storeConversationMock;
    searchRelevantMemories = searchRelevantMemoriesMock;
    isAvailable = isAvailableMock;
}

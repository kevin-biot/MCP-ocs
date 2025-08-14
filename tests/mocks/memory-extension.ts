import { jest } from '@jest/globals';

export const initializeMock = jest.fn(async () => {});
export const storeConversationMock = jest.fn(async (_: any) => true);
export const searchRelevantMemoriesMock = jest.fn(async (_q?: string, _s?: string, _l?: number) => [] as any[]);
export const isAvailableMock = jest.fn(async () => true);

export class ChromaMemoryManager {
  memoryDir: string;
  constructor(memoryDir: string) {
    this.memoryDir = memoryDir;
  }
  initialize = initializeMock;
  storeConversation = storeConversationMock;
  searchRelevantMemories = searchRelevantMemoriesMock;
  isAvailable = isAvailableMock;
}


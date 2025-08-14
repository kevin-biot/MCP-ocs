declare module '../../../MCP-files/src/memory-extension.ts' {
  export const initializeMock: any;
  export const storeConversationMock: any;
  export const searchRelevantMemoriesMock: any;
  export const isAvailableMock: any;

  export class ChromaMemoryManager {
    constructor(memoryDir: string);
    initialize: any;
    storeConversation: any;
    searchRelevantMemories: any;
    isAvailable: any;
  }
}


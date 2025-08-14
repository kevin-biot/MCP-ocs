export declare const initializeMock: import("jest-mock").Mock<() => Promise<void>>;
export declare const storeConversationMock: import("jest-mock").Mock<(_: any) => Promise<boolean>>;
export declare const searchRelevantMemoriesMock: import("jest-mock").Mock<(_q?: string, _s?: string, _l?: number) => Promise<any[]>>;
export declare const isAvailableMock: import("jest-mock").Mock<() => Promise<boolean>>;
export declare class ChromaMemoryManager {
    memoryDir: string;
    constructor(memoryDir: string);
    initialize: import("jest-mock").Mock<() => Promise<void>>;
    storeConversation: import("jest-mock").Mock<(_: any) => Promise<boolean>>;
    searchRelevantMemories: import("jest-mock").Mock<(_q?: string, _s?: string, _l?: number) => Promise<any[]>>;
    isAvailable: import("jest-mock").Mock<() => Promise<boolean>>;
}

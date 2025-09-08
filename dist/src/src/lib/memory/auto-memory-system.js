// Minimal no-op shim to satisfy existing imports during rebuild
export class AutoMemorySystem {
    constructor(_sharedMemory) { }
    async initialize() { }
    async retrieveRelevantContext(_toolName, _args) {
        return [];
    }
    async captureToolExecution(_record) { }
}

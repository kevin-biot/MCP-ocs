// Minimal no-op shim to satisfy existing imports during rebuild
export class AutoMemorySystem {
  constructor(_sharedMemory?: any) {}

  async initialize(): Promise<void> {}

  async retrieveRelevantContext(_toolName: string, _args: any): Promise<any[]> {
    return [];
  }

  async captureToolExecution(_record: any): Promise<void> {}
}


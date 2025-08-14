// Declare external tool modules so index.ts can compile without building tool sources
declare module './tools/memory/knowledge-seeding-tool-v2.js' {
  export class KnowledgeSeedingTool {
    constructor(...args: any[]);
  }
  export class KnowledgeToolsSuite {
    constructor(...args: any[]);
    getMCPTools(): any[];
  }
}

declare module './tools/memory/knowledge-seeding-tool.js' {
  export class KnowledgeSeedingTool {
    constructor(...args: any[]);
  }
  export class KnowledgeToolsSuite {
    constructor(...args: any[]);
    getMCPTools(): any[];
  }
}


/**
 * Minimal Knowledge Seeding Tool (v2) for tests
 * Provides a thin wrapper over KnowledgeSeedingSystem with a suite exposing a tool.
 */

import type { StandardTool } from '../../lib/tools/tool-registry.js';
import { KnowledgeSeedingSystem } from '../../lib/memory/knowledge-seeding-system.js';

export class KnowledgeSeedingTool {
  constructor(private system: KnowledgeSeedingSystem) {}

  async execute(args: any): Promise<string> {
    try {
      const op = args?.operation || 'seed';
      if (op === 'quick_seed') {
        const id = await (this.system as any).quickSeed(args?.templateType, args?.templateArgs || []);
        return JSON.stringify({ success: true, memoryId: id });
      }
      if (op === 'seed') {
        const id = await (this.system as any).seedKnowledge(args?.title, args?.content, args?.sourceClass);
        return JSON.stringify({ success: true, memoryId: id });
      }
      if (op === 'search') {
        const results = await (this.system as any).searchKnowledge(args?.searchQuery || '', args?.limit || 5);
        return JSON.stringify({ success: true, resultCount: results?.length || 0, results });
      }
      if (op === 'stats') {
        const stats = await (this.system as any).getKnowledgeStats();
        return JSON.stringify({ success: true, bySourceClass: stats });
      }
      return JSON.stringify({ success: false, error: `Unknown operation: ${op}` });
    } catch (error) {
      return JSON.stringify({ success: false, error: (error as Error).message });
    }
  }
}

export class KnowledgeToolsSuite {
  constructor(private tool: KnowledgeSeedingTool) {}

  getTools(): StandardTool[] {
    return [
      {
        name: 'knowledge_seed',
        fullName: 'knowledge_seed',
        description: 'Seed and search knowledge (engineer patterns)',
        inputSchema: { type: 'object' },
        execute: (args: any) => this.tool.execute(args),
        category: 'knowledge',
        version: 'v2',
        metadata: { experimental: true }
      } as any
    ];
  }
}


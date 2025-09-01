/**
 * Sequential Thinking Types (memory-enhanced)
 */

import type { UnifiedToolRegistry } from './tool-registry.js';
import type { SharedMemoryManager, MemorySearchResult } from '../memory/shared-memory.js';

export interface SequentialThinkingContext {
  sessionId: string;
  userInput: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  previousResults?: any[];
  toolRegistry: UnifiedToolRegistry;
  memoryManager: SharedMemoryManager;
  contextHistory?: any[];
  // Hints/flags
  bounded?: boolean; // If true, avoid expensive cluster-wide sweeps
  firstStepOnly?: boolean; // If true, execute only first planned step
}

export interface ToolStrategy {
  steps: ToolStep[];
  estimatedSteps: number;
  rationale: string;
  confidenceScore: number;
}

export interface ToolStep {
  sequenceNumber: number;
  tool: string;
  parameters: any;
  rationale: string;
  dependencies?: string[];
  memoryContext?: Array<{ problem: string; solutionPath: string; timestamp?: number; tags?: string[] }> | undefined;
}

export interface SequentialThinkingResult {
  success: boolean;
  toolStrategy: ToolStrategy;
  reasoningTrace: ThoughtProcess[];
  finalResult?: any;
  error?: string;
  networkResetDetected?: boolean;
  suggestions?: string[];
}

export interface ThoughtProcess {
  thoughtNumber: number;
  thought: string;
  timestamp: Date;
  nextThoughtNeeded: boolean;
  totalThoughts?: number;
  needsMoreThoughts?: boolean;
  memoryContext?: Array<{ problem: string; solutionPath: string; timestamp?: number; tags?: string[] }> | undefined;
}

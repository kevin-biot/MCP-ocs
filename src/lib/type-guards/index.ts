// Type Guard Library for Safe Type Narrowing
import type { OperationalMemory } from '../memory/shared-memory.js';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isOperationalMemory(data: unknown): data is OperationalMemory {
  if (!isRecord(data)) return false;
  return typeof data.incidentId === 'string'
    && typeof data.domain === 'string'
    && typeof data.timestamp === 'number'
    && Array.isArray(data.symptoms)
    && Array.isArray(data.affectedResources)
    && Array.isArray(data.diagnosticSteps)
    && Array.isArray(data.tags)
    && (data.environment === 'dev' || data.environment === 'test' || data.environment === 'staging' || data.environment === 'prod');
}

export function hasErrorCode(error: unknown): error is { code: string | number } {
  return isRecord(error) && (typeof (error as any).code === 'string' || typeof (error as any).code === 'number');
}

export function hasErrorStderr(error: unknown): error is { stderr: string } {
  return isRecord(error) && typeof (error as any).stderr === 'string';
}

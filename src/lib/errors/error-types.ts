// Canonical error hierarchy and utilities for MCP-ocs

export type ErrorKind =
  | 'ValidationError'
  | 'ToolExecutionError'
  | 'MemoryError'
  | 'TimeoutError'
  | 'NotFoundError'
  | 'ExternalCommandError'
  | 'AppError';

export interface ErrorOptions {
  cause?: unknown;
  details?: Record<string, unknown>;
  statusCode?: number;
}

export class AppError extends Error {
  kind: ErrorKind;
  statusCode: number;
  details?: Record<string, unknown>;

  constructor(kind: ErrorKind, message: string, options: ErrorOptions = {}) {
    super(message, { cause: options.cause as any });
    this.name = kind;
    this.kind = kind;
    this.statusCode = options.statusCode ?? mapKindToStatus(kind);
    if (typeof options.details !== 'undefined') {
      this.details = options.details as Record<string, unknown>;
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, options: ErrorOptions = {}) {
    super('ValidationError', message, { ...options, statusCode: options.statusCode ?? 400 });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, options: ErrorOptions = {}) {
    super('NotFoundError', message, { ...options, statusCode: options.statusCode ?? 404 });
  }
}

export class TimeoutError extends AppError {
  constructor(message: string, options: ErrorOptions = {}) {
    super('TimeoutError', message, { ...options, statusCode: options.statusCode ?? 408 });
  }
}

export class ToolExecutionError extends AppError {
  constructor(message: string, options: ErrorOptions = {}) {
    super('ToolExecutionError', message, { ...options, statusCode: options.statusCode ?? 500 });
  }
}

// Specialized wrapper for triage execution failures that preserves ToolExecutionError semantics
export class TriageExecutionError extends ToolExecutionError {
  constructor(message: string, options: ErrorOptions = {}) {
    super(message, options);
    this.name = 'TriageExecutionError';
  }
}

export class MemoryError extends AppError {
  constructor(message: string, options: ErrorOptions = {}) {
    super('MemoryError', message, { ...options, statusCode: options.statusCode ?? 500 });
  }
}

export class ExternalCommandError extends AppError {
  constructor(message: string, options: ErrorOptions = {}) {
    super('ExternalCommandError', message, { ...options, statusCode: options.statusCode ?? 502 });
  }
}

export function mapKindToStatus(kind: ErrorKind): number {
  switch (kind) {
    case 'ValidationError': return 400;
    case 'NotFoundError': return 404;
    case 'TimeoutError': return 408;
    case 'ExternalCommandError': return 502;
    case 'ToolExecutionError':
    case 'MemoryError':
    case 'AppError':
    default:
      return 500;
  }
}

export function serializeError(err: unknown): { type: string; message: string; statusCode: number; details?: Record<string, unknown>; cause?: string } {
  if (err instanceof AppError) {
    const out: { type: string; message: string; statusCode: number; details?: Record<string, unknown>; cause?: string } = {
      type: err.kind,
      message: err.message,
      statusCode: err.statusCode,
    };
    if (typeof err.details !== 'undefined') out.details = err.details;
    const causeMsg = err.cause ? String((err.cause as any)?.message ?? err.cause) : undefined;
    if (typeof causeMsg !== 'undefined') out.cause = causeMsg;
    return out;
  }
  if (err instanceof Error) {
    const out: { type: string; message: string; statusCode: number; details?: Record<string, unknown>; cause?: string } = {
      type: err.name || 'Error',
      message: err.message,
      statusCode: 500,
    };
    const cause = (err as any).cause ? String((err as any).cause) : undefined;
    if (typeof cause !== 'undefined') out.cause = cause;
    return out;
  }
  return { type: 'UnknownError', message: String(err), statusCode: 500 };
}

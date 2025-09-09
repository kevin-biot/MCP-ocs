// Canonical error hierarchy and utilities for MCP-ocs
export class AppError extends Error {
    kind;
    statusCode;
    details;
    constructor(kind, message, options = {}) {
        super(message, { cause: options.cause });
        this.name = kind;
        this.kind = kind;
        this.statusCode = options.statusCode ?? mapKindToStatus(kind);
        if (typeof options.details !== 'undefined') {
            this.details = options.details;
        }
    }
}
export class ValidationError extends AppError {
    constructor(message, options = {}) {
        super('ValidationError', message, { ...options, statusCode: options.statusCode ?? 400 });
    }
}
export class NotFoundError extends AppError {
    constructor(message, options = {}) {
        super('NotFoundError', message, { ...options, statusCode: options.statusCode ?? 404 });
    }
}
export class TimeoutError extends AppError {
    constructor(message, options = {}) {
        super('TimeoutError', message, { ...options, statusCode: options.statusCode ?? 408 });
    }
}
export class ToolExecutionError extends AppError {
    constructor(message, options = {}) {
        super('ToolExecutionError', message, { ...options, statusCode: options.statusCode ?? 500 });
    }
}
// Specialized wrapper for triage execution failures that preserves ToolExecutionError semantics
export class TriageExecutionError extends ToolExecutionError {
    constructor(message, options = {}) {
        super(message, options);
        this.name = 'TriageExecutionError';
    }
}
export class MemoryError extends AppError {
    constructor(message, options = {}) {
        super('MemoryError', message, { ...options, statusCode: options.statusCode ?? 500 });
    }
}
export class ExternalCommandError extends AppError {
    constructor(message, options = {}) {
        super('ExternalCommandError', message, { ...options, statusCode: options.statusCode ?? 502 });
    }
}
export function mapKindToStatus(kind) {
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
export function serializeError(err) {
    if (err instanceof AppError) {
        const out = {
            type: err.kind,
            message: err.message,
            statusCode: err.statusCode,
        };
        if (typeof err.details !== 'undefined')
            out.details = err.details;
        const causeMsg = err.cause ? String(err.cause?.message ?? err.cause) : undefined;
        if (typeof causeMsg !== 'undefined')
            out.cause = causeMsg;
        return out;
    }
    if (err instanceof Error) {
        const out = {
            type: err.name || 'Error',
            message: err.message,
            statusCode: 500,
        };
        const cause = err.cause ? String(err.cause) : undefined;
        if (typeof cause !== 'undefined')
            out.cause = cause;
        return out;
    }
    return { type: 'UnknownError', message: String(err), statusCode: 500 };
}

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
        this.details = options.details;
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
        return {
            type: err.kind,
            message: err.message,
            statusCode: err.statusCode,
            details: err.details,
            cause: err.cause ? String(err.cause?.message ?? err.cause) : undefined,
        };
    }
    if (err instanceof Error) {
        return { type: err.name || 'Error', message: err.message, statusCode: 500, cause: err.cause ? String(err.cause) : undefined };
    }
    return { type: 'UnknownError', message: String(err), statusCode: 500 };
}

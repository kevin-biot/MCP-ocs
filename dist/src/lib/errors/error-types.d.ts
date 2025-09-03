export type ErrorKind = 'ValidationError' | 'ToolExecutionError' | 'MemoryError' | 'TimeoutError' | 'NotFoundError' | 'ExternalCommandError' | 'AppError';
export interface ErrorOptions {
    cause?: unknown;
    details?: Record<string, unknown>;
    statusCode?: number;
}
export declare class AppError extends Error {
    kind: ErrorKind;
    statusCode: number;
    details?: Record<string, unknown>;
    constructor(kind: ErrorKind, message: string, options?: ErrorOptions);
}
export declare class ValidationError extends AppError {
    constructor(message: string, options?: ErrorOptions);
}
export declare class NotFoundError extends AppError {
    constructor(message: string, options?: ErrorOptions);
}
export declare class TimeoutError extends AppError {
    constructor(message: string, options?: ErrorOptions);
}
export declare class ToolExecutionError extends AppError {
    constructor(message: string, options?: ErrorOptions);
}
export declare class MemoryError extends AppError {
    constructor(message: string, options?: ErrorOptions);
}
export declare class ExternalCommandError extends AppError {
    constructor(message: string, options?: ErrorOptions);
}
export declare function mapKindToStatus(kind: ErrorKind): number;
export declare function serializeError(err: unknown): {
    type: string;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
    cause?: string;
};

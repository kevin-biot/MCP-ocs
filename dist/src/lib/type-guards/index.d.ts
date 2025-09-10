import type { OperationalMemory } from '../memory/shared-memory.js';
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function isOperationalMemory(data: unknown): data is OperationalMemory;
export declare function hasErrorCode(error: unknown): error is {
    code: string | number;
};
export declare function hasErrorStderr(error: unknown): error is {
    stderr: string;
};

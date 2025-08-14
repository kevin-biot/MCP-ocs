import { MCPOcsMemoryAdapter } from './mcp-ocs-memory-adapter';
/**
 * Convenience helper to create and initialize the OCS memory adapter.
 * Keeps integration simple and non-invasive.
 */
export declare function createOcsAdapter(memoryDir: string): Promise<MCPOcsMemoryAdapter>;

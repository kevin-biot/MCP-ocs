import { MCPOcsMemoryAdapter } from './mcp-ocs-memory-adapter.js';
/**
 * Convenience helper to create and initialize the OCS memory adapter.
 * Keeps integration simple and non-invasive.
 */
export async function createOcsAdapter(memoryDir) {
    const adapter = new MCPOcsMemoryAdapter(memoryDir);
    await adapter.initialize();
    return adapter;
}

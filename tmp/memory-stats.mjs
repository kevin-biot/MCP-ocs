import { StateMgmtTools } from '../dist/src/tools/state-mgmt/index.js';
import { SharedMemoryManager } from '../dist/src/lib/memory/shared-memory.js';

// Quick one-off stats run (detailed=true)
const memory = new SharedMemoryManager({
  domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory',
  enableCompression: true, retentionDays: 7,
  chromaHost: process.env.CHROMA_HOST || '127.0.0.1',
  chromaPort: process.env.CHROMA_PORT ? Number(process.env.CHROMA_PORT) : 8000
});
await memory.initialize();
const tools = new StateMgmtTools(memory, /** @type {any} */ ({}));
const res = await tools.executeTool('memory_get_stats', { detailed: true });
console.log(res);

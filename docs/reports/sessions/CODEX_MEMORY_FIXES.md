# CODEX: Fix ChromaDB Import Errors and Update for Shared Memory

## 🎯 **URGENT FIXES NEEDED**

### **Issue 1: Remove Old ChromaDB Client Imports**

**File: `src/lib/memory/shared-memory.ts`**

**REMOVE these lines:**
```typescript
import { ChromaClient } from 'chromadb';
import { DefaultEmbeddingFunction } from '@chroma-core/default-embed';
```

**REPLACE with:**
```typescript
// Removed chromadb client - using direct REST API calls via mcp-files-memory-extension.ts
```

### **Issue 2: Update Shared Memory to Use New Architecture**

**The shared-memory.ts file needs to delegate to the working mcp-files-memory-extension.ts instead of using ChromaDB client directly.**

**Key Changes Needed:**

1. **Remove ChromaClient usage** - use ChromaMemoryManager from mcp-files-memory-extension.ts
2. **Update imports** - remove chromadb and @chroma-core/default-embed
3. **Use shared memory paths** - point to /Users/kevinbrown/memory/consolidated
4. **Delegate vector operations** - let mcp-files-memory-extension.ts handle ChromaDB REST calls

### **Example Fix:**

```typescript
// OLD (BROKEN):
import { ChromaClient } from 'chromadb';
private chromaClient: ChromaClient;

// NEW (WORKING):
import { ChromaMemoryManager } from './mcp-files-memory-extension';
private memoryManager: ChromaMemoryManager;

// OLD (BROKEN):
this.chromaClient = new ChromaClient({ host: '127.0.0.1', port: 8000 });

// NEW (WORKING):
this.memoryManager = new ChromaMemoryManager('/Users/kevinbrown/memory/consolidated');
await this.memoryManager.initialize();
```

### **Issue 3: Dependencies**

**Make sure these are installed:**
```bash
npm install @xenova/transformers node-fetch@3
```

**Make sure this is REMOVED:**
```bash
npm uninstall chromadb
```

### **Issue 4: Update Memory Paths**

**Update all memory managers to use shared paths:**
- **memoryDir**: `/Users/kevinbrown/memory/consolidated`
- **chromaDB path**: `/Users/kevinbrown/memory/shared-chromadb`

### **Priority Order:**
1. **Fix import errors** in shared-memory.ts (removes test failures)
2. **Update to use ChromaMemoryManager** delegation pattern
3. **Update memory paths** to use shared directories
4. **Test the system** with shared memory

### **Expected Result:**
- ✅ Tests run without import errors
- ✅ Memory operations use shared /Users/kevinbrown/memory/consolidated
- ✅ All MCP servers can access the same memories
- ✅ Vector search works with client-side embeddings

### **Files to Update:**
- `src/lib/memory/shared-memory.ts` (main fixes)
- `src/lib/memory/mcp-files-adapter.ts` (path updates)
- Any other files importing 'chromadb' package

**The working implementation is already in `mcp-files-memory-extension.ts` - just need to use it instead of the broken ChromaDB client approach!**

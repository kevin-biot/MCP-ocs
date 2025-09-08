# Phased Strategy: MCP-ocs Memory System Rebuild

## 🎯 **Core Principles**
- **Token-resilient**: Each phase is self-contained and resumable
- **Stability-first**: Never touch working MCP-files code  
- **Division of labor**: Clear separation between Claude and Codex tasks
- **Checkpoint-driven**: Save progress at each milestone

---

## 📋 **Phase 1: Foundation Cleanup (15 minutes)**
*Token cost: LOW | Codex-friendly: YES*

### **Objective**: Remove broken custom implementations and create clean slate

### **Codex Tasks**:
```bash
# Navigate to target
cd /Users/kevinbrown/MCP-ocs

# Remove broken custom implementations (these files are causing compilation errors)
echo "🗑️ Removing broken memory implementations..."
rm -f src/lib/memory/chroma-memory.ts
rm -f src/lib/memory/memory-manager.ts  
rm -f src/lib/memory/chromadb-client-robust.ts
rm -f src/lib/memory/vector-memory-manager.ts
rm -f src/lib/memory/vector-store.ts
rm -f src/lib/memory/auto-memory-system.ts
rm -f src/lib/memory/knowledge-seeding-system.ts

# Create backups of working files
echo "📋 Creating backups of current working files..."
cp src/lib/memory/shared-memory.ts src/lib/memory/shared-memory.ts.backup
cp src/lib/memory/mcp-files-adapter.ts src/lib/memory/mcp-files-adapter.ts.backup

# Verify cleanup
echo "🔍 Verifying cleanup..."
ls -la src/lib/memory/

echo "✅ Phase 1 Complete: Cleanup done, backups created"
```

### **Success Criteria**:
- [ ] All broken files removed
- [ ] Working files backed up
- [ ] Directory is clean
- [ ] TypeScript compilation errors reduced

### **Checkpoint 1**: Report file removal count and any unexpected issues

---

## 📋 **Phase 2: Implement Simple Adapter (15 minutes)**
*Token cost: LOW | Codex-friendly: YES*

### **Objective**: Create simple adapter using Qwen's FINAL stability-first design

### **Codex Tasks**:
```typescript
// Create EXACTLY this file: /Users/kevinbrown/MCP-ocs/src/lib/memory/mcp-ocs-memory-adapter.ts
// Use Qwen's FINAL simple adapter pattern (from latest message)
// Direct import from MCP-files with domain extensions
```

### **Key Implementation Points**:
- **Single file solution** - no complex layers
- **Direct ChromaMemoryManager import** from MCP-files
- **Domain-specific interface** (OCSIncidentMemory)
- **Extension methods** for incident response generation

### **Success Criteria**:
- [ ] Single adapter file created
- [ ] Direct MCP-files import works
- [ ] TypeScript compiles cleanly
- [ ] Domain interfaces defined

### **Checkpoint 2**: Report adapter creation and import validation

---

## 📋 **Phase 3: Test Infrastructure (15 minutes)**
*Token cost: LOW | Codex-friendly: YES*

### **Objective**: Update tests to use new adapter with proper mocking

### **Codex Tasks**:
```bash
# Update test files to mock MCP-files dependency
# Run compilation tests  
npm run build
npm run test -- --testPathPattern=memory --passWithNoTests
```

### **Success Criteria**:
- [ ] Tests run without crashing
- [ ] Mocks work correctly
- [ ] No import errors

### **Checkpoint 3**: Report test execution results

---

## 📋 **Phase 4: Basic Integration (10 minutes)**
*Token cost: LOW | Codex-friendly: YES*

### **Objective**: Integrate adapter with main MCP-ocs codebase

### **Codex Tasks**:
- Update main exports
- Create basic usage example
- Verify initialization works

### **Success Criteria**:
- [ ] Adapter integrates cleanly
- [ ] Basic functionality works
- [ ] No runtime errors

### **Checkpoint 4**: Report integration status

---

## 📋 **Phase 5: Domain Intelligence Extensions (30 minutes)**
*Token cost: HIGH | Codex-friendly: PARTIAL*

### **Objective**: Add Red Hat engineer-specific functionality

### **Claude Tasks** (Strategy):
- Design incident response structure
- Define domain tagging strategy  
- Create workflow requirements

### **Codex Tasks** (Implementation):
- Implement structured response methods
- Add domain filtering logic
- Create severity classification

### **Success Criteria**:
- [ ] Domain intelligence working
- [ ] Structured incident responses  
- [ ] Production-ready for Red Hat engineers

### **Checkpoint 5**: Final integration test and handoff

---

## 🚨 **Emergency Protocols**

### **Token Timeout Recovery**:
1. Check `metrics/phase_status.txt` for current state
2. Review last checkpoint in artifacts
3. Continue with Codex for mechanical tasks
4. Resume Claude for strategic decisions

### **Integration Failure**:
1. Revert to last working checkpoint
2. Use direct MCP-files import as fallback
3. Simplify requirements if needed
4. Document lessons learned

---

## 📊 **Progress Tracking**

Update `metrics/phase_status.txt` after each checkpoint:
- Mark current phase as "In Progress" 
- Update "Last Updated" timestamp
- Note any blockers or issues
- Set "Next Action" for continuation

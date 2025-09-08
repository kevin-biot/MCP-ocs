#!/usr/bin/env bash
set -euo pipefail

# --- Configuration ---
TARGET_ROOT="/Users/kevinbrown/MCP-ocs"   # write-enabled repo
SOURCE_ROOT="/Users/kevinbrown/MCP-files" # read-only reference

echo "🚀 Setting up Codex environment for MCP-ocs memory rebuild..."

# --- Sanity checks ---
[ -d "$TARGET_ROOT" ] || { echo "❌ ERROR: Target repo not found: $TARGET_ROOT" >&2; exit 1; }
[ -d "$SOURCE_ROOT" ] || { echo "❌ ERROR: Source repo not found: $SOURCE_ROOT" >&2; exit 1; }

echo "✅ Both repositories found"

# --- Create folders (isolated from existing docs) ---
mkdir -p "$TARGET_ROOT/codex-docs" \
         "$TARGET_ROOT/scripts/codex" \
         "$TARGET_ROOT/metrics"

echo "✅ Directory structure created"

# --- Backup any existing guardrails before overwriting ---
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
if [ -f "$TARGET_ROOT/codex.md" ]; then
  cp "$TARGET_ROOT/codex.md" "$TARGET_ROOT/codex.md.bak.$TIMESTAMP"
  echo "📋 Backed up existing TARGET codex.md"
fi
if [ -f "$SOURCE_ROOT/codex.md" ]; then
  cp "$SOURCE_ROOT/codex.md" "$SOURCE_ROOT/codex.md.bak.$TIMESTAMP"
  echo "📋 Backed up existing SOURCE codex.md"
fi

# --- Guardrails: TARGET (write-enabled) ---
cat > "$TARGET_ROOT/codex.md" <<'EOF'
# Codex Guardrails — MCP-ocs (TARGET, write-enabled)

## 🎯 Mission
Rebuild MCP-ocs memory system using proven MCP-files foundation while maintaining stability.

## 📁 Scope
- **Allowed (read/write)**: `src/lib/memory/**`, `tests/unit/memory/**`, `codex-docs/**`, `scripts/codex/**`, `metrics/**`
- **Allowed (limited)**: `src/index.ts` (exports only), `package.json` (dependency updates only with approval)
- **Forbidden**: `dist/**`, `node_modules/**`, `organization-phase2-backup-*/**`, `logs/**`, any MCP-files modifications

## 🛡️ Safety Rules
- **MUST** request approval before executing ANY shell commands
- **MUST** request approval before modifying `package.json` or running `npm install`
- **MUST** follow `codex-task-strategy.md` and `codex-docs/memory_rebuild_plan.md` strictly, one phase at a time
- **MUST** stop at every **Checkpoint** and report status before proceeding
- **MUST** create minimal, reviewable diffs
- **MUST** backup files before major changes

## 📋 Key Reference Files
- **Strategy**: `codex-task-strategy.md` (main implementation guide)
- **Plan**: `codex-docs/memory_rebuild_plan.md` (detailed phases)
- **Status**: `metrics/phase_status.txt` (progress tracking)

## 📊 Reporting Requirements
- Update `metrics/phase_status.txt` after each checkpoint
- If tests run, update `metrics/coverage.txt` with `TOTAL NN%`
- Produce concise status report at end of each phase
- Log any errors or unexpected behavior immediately

## 🚫 Prohibited Actions
- Network calls or external API access
- Modifying working MCP-files code
- Installing new dependencies without approval
- Running tests that require ChromaDB server
- Making changes outside approved scope
EOF

# --- Guardrails: SOURCE (read-only) ---
cat > "$SOURCE_ROOT/codex.md" <<'EOF'
# Codex Guardrails — MCP-files (SOURCE, read-only)

## 🎯 Purpose
Provide stable reference implementation for MCP-ocs memory rebuild.

## 📁 Scope
- **Allowed (read-only)**: `src/memory-extension.ts`, `src/**`, `tests/**`, documentation
- **Purpose**: Extract patterns, interfaces, and proven implementation details

## 🛡️ Strict Rules
- **ABSOLUTELY NO** file modifications
- **ABSOLUTELY NO** command execution
- **Read-only reference** for understanding proven patterns
- Output **summaries only** - do not inline entire files unless explicitly requested

## 📋 Expected Outputs
- Interface definitions and type signatures
- Key method signatures and patterns
- Configuration and setup patterns
- Error handling approaches

## ⚠️ Critical Warning
This repository contains **STABLE, PRODUCTION CODE** that must never be modified.
Any changes here will break the working MCP-files system that Claude relies on.
EOF

# --- Phase Status Tracking ---
cat > "$TARGET_ROOT/metrics/phase_status.txt" <<'EOF'
# MCP-ocs Memory Rebuild Status
Phase 1: Foundation Cleanup     [ ] Not Started [X] Ready [ ] In Progress [ ] Complete
Phase 2: Implement Adapter      [ ] Not Started [ ] Ready [ ] In Progress [ ] Complete  
Phase 3: Test Infrastructure    [ ] Not Started [ ] Ready [ ] In Progress [ ] Complete
Phase 4: Basic Integration      [ ] Not Started [ ] Ready [ ] In Progress [ ] Complete
Phase 5: Domain Extensions      [ ] Not Started [ ] Ready [ ] In Progress [ ] Complete

Last Updated: $(date)
Current Phase: 1
Next Action: Execute Phase 1 cleanup script
EOF

# --- Enhanced Phase Strategy Plan ---
cat > "$TARGET_ROOT/codex-docs/memory_rebuild_plan.md" <<'EOF'
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
EOF

# --- Codex execution script for Phase 1 ---
cat > "$TARGET_ROOT/scripts/codex/phase1_cleanup.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Executing Phase 1: Foundation Cleanup"
cd /Users/kevinbrown/MCP-ocs

# Track files before cleanup
echo "📊 Before cleanup:"
find src/lib/memory -name "*.ts" | wc -l | xargs echo "Total TypeScript files:"

# Remove broken implementations
echo "🗑️ Removing broken memory implementations..."
REMOVED_COUNT=0

for file in \
  "src/lib/memory/chroma-memory.ts" \
  "src/lib/memory/memory-manager.ts" \
  "src/lib/memory/chromadb-client-robust.ts" \
  "src/lib/memory/vector-memory-manager.ts" \
  "src/lib/memory/vector-store.ts" \
  "src/lib/memory/auto-memory-system.ts" \
  "src/lib/memory/knowledge-seeding-system.ts"; do
  
  if [ -f "$file" ]; then
    echo "  Removing: $file"
    rm -f "$file"
    ((REMOVED_COUNT++))
  else
    echo "  Not found: $file (already clean)"
  fi
done

# Create backups
echo "📋 Creating backups..."
BACKUP_COUNT=0
for file in \
  "src/lib/memory/shared-memory.ts" \
  "src/lib/memory/mcp-files-adapter.ts"; do
  
  if [ -f "$file" ]; then
    cp "$file" "$file.backup"
    echo "  Backed up: $file"
    ((BACKUP_COUNT++))
  else
    echo "  Warning: $file not found for backup"
  fi
done

# Final verification
echo "📊 After cleanup:"
find src/lib/memory -name "*.ts" | wc -l | xargs echo "Total TypeScript files:"
echo "📊 Backup files created:"
find src/lib/memory -name "*.backup" | wc -l | xargs echo "Total backup files:"

# Update status
echo "📋 Updating phase status..."
sed -i.bak 's/Phase 1: Foundation Cleanup.*\[ \] Not Started \[X\] Ready \[ \] In Progress \[ \] Complete/Phase 1: Foundation Cleanup     [ ] Not Started [ ] Ready [ ] In Progress [X] Complete/' metrics/phase_status.txt
sed -i.bak "s/Last Updated:.*/Last Updated: $(date)/" metrics/phase_status.txt
sed -i.bak 's/Current Phase: 1/Current Phase: 2/' metrics/phase_status.txt
sed -i.bak 's/Next Action: Execute Phase 1 cleanup script/Next Action: Begin Phase 2 adapter implementation/' metrics/phase_status.txt

echo "✅ Phase 1 Complete!"
echo "📊 Removed $REMOVED_COUNT broken files"
echo "📊 Created $BACKUP_COUNT backup files"
echo "🎯 Ready for Phase 2: Implement Adapter"
EOF

chmod +x "$TARGET_ROOT/scripts/codex/phase1_cleanup.sh"

echo "🎉 Codex environment setup complete!"
echo ""
echo "📋 Summary:"
echo "  ✅ Guardrails created for both repositories"
echo "  ✅ Directory structure established"
echo "  ✅ Phase strategy documented"
echo "  ✅ Execution scripts prepared"
echo "  ✅ Status tracking initialized"
echo ""
echo "🚀 Ready to begin Phase 1 with Codex!"
echo "📁 Key files created:"
echo "  - $TARGET_ROOT/codex.md (TARGET repo guardrails)"
echo "  - $SOURCE_ROOT/codex.md (SOURCE repo guardrails)"
echo "  - $TARGET_ROOT/codex-task-strategy.md (Main strategy guide)"
echo "  - $TARGET_ROOT/codex-docs/memory_rebuild_plan.md (Detailed phases)"
echo "  - $TARGET_ROOT/metrics/phase_status.txt (Progress tracking)"
echo "  - $TARGET_ROOT/scripts/codex/phase1_cleanup.sh (Executable script)"
echo ""
echo "📖 For Codex: Read codex-task-strategy.md first, then follow the phase plan!"

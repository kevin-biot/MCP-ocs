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

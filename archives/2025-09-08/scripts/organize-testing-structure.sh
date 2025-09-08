#!/bin/bash

# Organize MCP-OCS Testing Structure
echo "🧹 Organizing MCP-OCS Testing Structure"
echo "======================================="

# 1. Create proper documentation structure
echo "📁 Creating documentation structure..."
mkdir -p docs/testing/strategy
mkdir -p docs/testing/reports  
mkdir -p docs/testing/procedures

# 2. Create scripts organization
echo "📁 Creating scripts organization..."
mkdir -p scripts/testing/fixes
mkdir -p scripts/testing/analysis
mkdir -p scripts/testing/utilities

# 3. Move scattered test scripts to organized locations
echo "🔄 Moving test scripts to organized locations..."

# Move fix scripts
mv comprehensive-test-fix.sh scripts/testing/fixes/ 2>/dev/null || true
mv diagnose-test-issues.sh scripts/testing/analysis/ 2>/dev/null || true
mv final-jest-fix.sh scripts/testing/fixes/ 2>/dev/null || true
mv final-test-fix.sh scripts/testing/fixes/ 2>/dev/null || true
mv fix-build-errors.sh scripts/testing/fixes/ 2>/dev/null || true
mv fix-extensions.sh scripts/testing/fixes/ 2>/dev/null || true
mv fix-specific-test-issues.sh scripts/testing/fixes/ 2>/dev/null || true
mv fix-syntax-errors.sh scripts/testing/fixes/ 2>/dev/null || true
mv fix-test-imports.sh scripts/testing/fixes/ 2>/dev/null || true
mv quick-final-fix.sh scripts/testing/fixes/ 2>/dev/null || true
mv quick-method-fix.sh scripts/testing/fixes/ 2>/dev/null || true

# Move setup and utility scripts
mv setup-and-test-regression.sh scripts/testing/utilities/ 2>/dev/null || true
mv setup-granular-testing.sh scripts/testing/utilities/ 2>/dev/null || true

echo "✅ File organization complete!"

# 4. Create testing documentation index
cat > docs/testing/README.md << 'EOF'
# MCP-OCS Testing Documentation

## 📋 Current Status
- **Jest Errors**: Reduced from 51 → 0 ✅
- **Passing Tests**: 2/5 test suites ✅
- **Current Issue**: TypeScript import configuration

## 📁 Documentation Structure

### Strategy Documents
- [`strategy/roadmap.md`](strategy/roadmap.md) - 5-phase testing evolution plan
- [`strategy/current-state.md`](strategy/current-state.md) - Current testing state checkpoint
- [`strategy/standards.md`](strategy/standards.md) - Testing conventions and standards

### Reports
- [`reports/`](reports/) - Historical testing reports and checkpoints

### Procedures
- [`procedures/running-tests.md`](procedures/running-tests.md) - How to run tests
- [`procedures/troubleshooting.md`](procedures/troubleshooting.md) - Common issues and fixes

## 🚀 Quick Start

### Run All Tests
```bash
npm run test:unit
```

### Run Enhanced Analysis
```bash
scripts/test/dual-mode/enhanced-clean.sh
```

### Individual Test Debugging
```bash
npm run test:unit -- tests/unit/basic.test.ts --verbose
```

## 🔧 Test Scripts Organization

### Fix Scripts
Located in `scripts/testing/fixes/` - Scripts that attempt to fix specific testing issues

### Analysis Scripts  
Located in `scripts/testing/analysis/` - Scripts that diagnose and analyze test problems

### Utilities
Located in `scripts/testing/utilities/` - General testing setup and utility scripts

## 📊 Current Test Results

| Test Suite | Status | Issues |
|------------|--------|---------|
| environment.test.ts | ✅ Passing | None |
| basic.test.ts | ✅ Passing | None |
| openshift-client.test.ts | ❌ Failing | Import resolution |
| structured-logger.test.ts | ❌ Failing | Import resolution |
| schema.test.ts | ❌ Failing | Import resolution |

## 🎯 Next Steps

1. Fix TypeScript import configuration
2. Get all 5 test suites passing  
3. Expand test coverage per roadmap
4. Implement integration testing

---
Last Updated: August 13, 2025
EOF

echo "📄 Created testing documentation index"

# 5. Show new structure
echo ""
echo "📁 New Organized Structure:"
echo "==========================="
echo "docs/testing/"
tree docs/testing/ 2>/dev/null || ls -la docs/testing/

echo ""
echo "scripts/testing/"
tree scripts/testing/ 2>/dev/null || ls -la scripts/testing/

echo ""
echo "✅ Organization complete! Repository is now properly structured."
echo "📋 Next: Create strategy documents and commit organized structure."

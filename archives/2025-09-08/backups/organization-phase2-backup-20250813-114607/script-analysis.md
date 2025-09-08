# MCP-ocs Script Analysis and Organization Plan

## Current State
You have 50+ shell scripts in your root directory that need to be organized into the clean structure:

```
scripts/
├── build/
├── test/
├── deploy/
├── dev/
├── utils/
└── ci/
```

## Script Functions and Organization Recommendations

### Build Scripts (should go to `scripts/build/`)
Based on your file names, these appear to be build-related:

1. `build-fix.sh` - Build fix script
2. `build-status.sh` - Build status check  
3. `build-with-critical-fix.sh` - Build with critical fix
4. `final-build.sh` - Final build process
5. `final-build-and-commit.sh` - Final build and commit
6. `final-build-check.sh` - Final build check
7. `final-build-test.sh` - Final build test
8. `quick-build.sh` - Quick build script  
9. `quick-build-and-test.sh` - Quick build and test
10. `quick-build-test.sh` - Quick build test
11. `simple-build-fix.sh` - Simple build fix
12. `simple-build-test.sh` - Simple build test
13. `test-build.sh` - Build test (could be moved to test)
14. `validate-and-build.sh` - Validate and build

### Test Scripts (should go to `scripts/test/`)
1. `quick-test.sh` - Quick test script
2. `final-test.sh` - Final test process  
3. `test-aws-integration.mjs` - AWS integration test (JS, not shell)
4. `test-aws-openshift.sh` - AWS OpenShift test
5. `test-diagnostic-suite.js` - Diagnostic suite test (JS, not shell)
6. `test-enhanced-memory.mjs` - Enhanced memory test (JS, not shell)
7. `test-fixes.sh` - Test fixes script
8. `test-http-server.mjs` - HTTP server test (JS, not shell)
9. `test-implementation-check.sh` - Implementation check test
10. `test-imports.sh` - Import validation test  
11. `test-knowledge-seeding.mjs` - Knowledge seeding test (JS, not shell)
12. `test-mcp-client.mjs` - MCP client test (JS, not shell)
13. `test-mcp-protocol.sh` - MCP protocol test
14. `test-mcp-stdio.mjs` - MCP stdio test (JS, not shell)
15. `test-memory-functions.mjs` - Memory functions test (JS, not shell)
16. `test-v2-api.sh` - V2 API test
17. `validate-comprehensive.mjs` - Comprehensive validation (JS, not shell)
18. `validate-phase-2a1.sh` - Phase 2A1 validation
19. `validate-real-scenario.sh` - Real scenario validation  
20. `validate-tool-accuracy.sh` - Tool accuracy validation
21. `validate-v2-tools.sh` - V2 tools validation

### Commit/Deployment Scripts (should go to `scripts/utils/`)
1. `commit-critical-fix.sh` - Critical fix commit
2. `commit-docs-cleanup.sh` - Docs cleanup commit  
3. `commit-knowledge-seeding-v0.3.1.sh` - Knowledge seeding commit
4. `commit-knowledge-seeding.sh` - Knowledge seeding commit
5. `commit-mcp-development-guide.sh` - MCP development guide commit
6. `commit-production-enhanced.sh` - Production enhanced commit
7. `commit-production.sh` - Production commit
8. `commit-scale-down-enhancement.sh` - Scale-down enhancement commit
9. `commit-skeleton.sh` - Skeleton commit

### Utility Scripts (should go to `scripts/utils/`)
1. `check-chromadb.mjs` - ChromaDB check (JS, not shell)
2. `check-production-status.sh` - Production status check
3. `check-status.sh` - Status check  
4. `cleanup-docs.sh` - Docs cleanup
5. `cleanup-scripts.sh` - Script cleanup (should be removed)
6. `cleanup-tests.sh` - Test cleanup
7. `debug-chroma-api.sh` - ChromaDB API debug
8. `debug-chroma-connection.sh` - ChromaDB connection debug
9. `diagnostic-suite-ready.js` - Diagnostic suite (JS, not shell)
10. `execute-validated-commit.sh` - Validated commit execution
11. `execute-cleanup.sh` - Cleanup execution (should be removed)
12. `final-fix.sh` - Final fix script
13. `fix-and-test-chroma.sh` - Chroma fix and test
14. `fix-build-and-verify.sh` - Build fix and verify
15. `fix-build.sh` - Build fix
16. `git-init-commands.md` - Git init commands (not shell)
17. `github-setup.md` - GitHub setup (not shell)
18. `install-test-deps.sh` - Install test dependencies
19. `make-scripts-executable.sh` - Make scripts executable (should be removed)
20. `quick-chroma-test.sh` - Quick Chroma test
21. `quick-error-fix.sh` - Quick error fix
22. `quick-fix-typescript.sh` - Quick TypeScript fix
23. `run-diagnostic-test.js` - Diagnostic test (JS, not shell)
24. `setup-manual-integration.sh` - Manual integration setup
25. `setup-minimal-testing.sh` - Minimal testing setup
26. `setup-scripts.sh` - Script setup (should be removed)
27. `victory-test.sh` - Victory test script

### Other Scripts (should be removed or handled differently)
1. `build-and-test-scale-down.sh` - Scale-down build and test
2. `build-and-test-v2.sh` - V2 build and test  
3. `complete-success-test.sh` - Complete success test
4. `comprehensive-fix.sh` - Comprehensive fix
5. `comprehensive-validation.sh` - Comprehensive validation (JS)
6. `create-structure.sh` - Structure creation
7. `final-compilation-fixes.md` - Compilation fixes (not shell)
8. `fix-directory-structure.md` - Directory structure fix (not shell)
9. `mcp-server.mjs` - MCP server (JS, not shell)
10. `ocs-cluster-cost-optimization-report.md` - Cost report (not shell)
11. `ocs-cost-optimization-summary.md` - Cost summary (not shell)
12. `ocs-technical-optimization-report.md` - Technical report (not shell)

## MV COMMANDS FOR ORGANIZATION

Here are the specific mv commands you should run to organize your scripts:

### Build Scripts:
```bash
mv build-fix.sh scripts/build/
mv build-status.sh scripts/build/
mv build-with-critical-fix.sh scripts/build/
mv final-build.sh scripts/build/
mv final-build-and-commit.sh scripts/build/
mv final-build-check.sh scripts/build/
mv final-build-test.sh scripts/build/
mv quick-build.sh scripts/build/
mv quick-build-and-test.sh scripts/build/
mv quick-build-test.sh scripts/build/
mv simple-build-fix.sh scripts/build/
mv simple-build-test.sh scripts/build/
mv test-build.sh scripts/build/
mv validate-and-build.sh scripts/build/
```

### Test Scripts:
```bash
mv quick-test.sh scripts/test/
mv final-test.sh scripts/test/
mv test-aws-openshift.sh scripts/test/
mv test-implementation-check.sh scripts/test/
mv test-imports.sh scripts/test/
mv test-mcp-protocol.sh scripts/test/
mv test-v2-api.sh scripts/test/
mv validate-phase-2a1.sh scripts/test/
mv validate-real-scenario.sh scripts/test/
mv validate-tool-accuracy.sh scripts/test/
mv validate-v2-tools.sh scripts/test/
```

### Commit/Deployment Scripts:
```bash
mv commit-critical-fix.sh scripts/utils/
mv commit-docs-cleanup.sh scripts/utils/
mv commit-knowledge-seeding-v0.3.1.sh scripts/utils/
mv commit-knowledge-seeding.sh scripts/utils/
mv commit-mcp-development-guide.sh scripts/utils/
mv commit-production-enhanced.sh scripts/utils/
mv commit-production.sh scripts/utils/
mv commit-scale-down-enhancement.sh scripts/utils/
mv commit-skeleton.sh scripts/utils/
```

### Utility Scripts:
```bash
mv check-production-status.sh scripts/utils/
mv check-status.sh scripts/utils/
mv cleanup-docs.sh scripts/utils/
mv cleanup-scripts.sh scripts/utils/
mv cleanup-tests.sh scripts/utils/
mv debug-chroma-api.sh scripts/utils/
mv debug-chroma-connection.sh scripts/utils/
mv execute-validated-commit.sh scripts/utils/
mv final-fix.sh scripts/utils/
mv fix-and-test-chroma.sh scripts/utils/
mv fix-build-and-verify.sh scripts/utils/
mv fix-build.sh scripts/utils/
mv install-test-deps.sh scripts/utils/
mv make-scripts-executable.sh scripts/utils/
mv quick-chroma-test.sh scripts/utils/
mv quick-error-fix.sh scripts/utils/
mv quick-fix-typescript.sh scripts/utils/
mv setup-manual-integration.sh scripts/utils/
mv setup-minimal-testing.sh scripts/utils/
mv setup-scripts.sh scripts/utils/
mv victory-test.sh scripts/utils/
```

### Remove Temporary Scripts:
```bash
rm comprehensive-cleanup.sh execute-cleanup.sh final-cleanup.sh run-cleanup-manual.sh run-script-cleanup.sh complete-cleanup-report.sh final-script-organization.sh real-final-cleanup.sh
```

## NOTES:

1. **JS files** (ending in .mjs) are not shell scripts and should not be moved to the scripts directory - they're separate language files
2. **MD files** (ending in .md) are documentation and should not be moved to scripts directory
3. **Some files** like `build-and-test-scale-down.sh` should be moved to build directory, but you already have the right pattern established

This organization will give you:
- 15-20 clean, well-documented scripts instead of 50+ scattered files
- Logical grouping (Build, Test, Utils)
- Consistent naming and structure  
- Maintained functionality for all features
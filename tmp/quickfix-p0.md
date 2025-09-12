# Quick Bug Fix - P0 Issues #40-42

**Role**: DEVELOPER  
**Context**: Fix 3 P0 reliability issues quickly  

## Setup:
```bash
cd /Users/kevinbrown/MCP-ocs
git checkout release/v0.9.0-beta
git pull origin release/v0.9.0-beta
# Work directly on beta branch - no feature branch
```

## Fixes Needed:

### Issue #40 - Session ID Management
- Create `src/utils/session.ts`: `createSessionId()` using `nowEpoch()` + random
- Fix `src/lib/tools/tool-registry.ts`: inject sessionId when missing
- Remove `Date.now()` from `src/tools/read-ops/index.ts`

### Issue #41 - Tool Execution Cap  
- Add execution counter to `src/lib/tools/tool-registry.ts`
- Stop after 10 tools, return error + call `postInstrumentError`

### Issue #42 - Placeholder Validation
- Add validator to catch `<unresolved>` placeholders
- Block execution, return error with guidance

## Test:
```bash
npm test
npm run build
```

## Done:
```bash
git add .
git commit -m "Fix P0 issues #40-42: session ID, execution cap, placeholder validation"
git push origin release/v0.9.0-beta
```

---
**Execute**: `codex apply /Users/kevinbrown/MCP-ocs/tmp/quickfix-p0.md`
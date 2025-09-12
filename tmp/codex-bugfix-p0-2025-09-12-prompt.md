# CODEX CLI Bug Fix Prompt – P0 Reliability Issues

**Role**: DEVELOPER  
**Session Context**: `/Users/kevinbrown/MCP-ocs/tmp/session-context-bugfix-2025-09-12.md`  
**GitHub Issues**: #40, #41, #42 (P0 priority)  
**Duration**: 2-3 hours focused implementation  

## GIT WORKFLOW - MANDATORY:
```bash
cd /Users/kevinbrown/MCP-ocs
git checkout release/v0.9.0-beta
git pull origin release/v0.9.0-beta  
git checkout -b feature/bugfix-p0-reliability-2025-09-12
```

## CONTEXT REVIEW REQUIRED:
1. Read session context: `cat /Users/kevinbrown/MCP-ocs/tmp/session-context-bugfix-2025-09-12.md`
2. Review GitHub issue specs: `cat /Users/kevinbrown/MCP-ocs/tmp/gh-issues-f012-bugfix-2025-09-12.md`
3. Current branch status: `git branch` (confirm on feature branch)

## P0 IMPLEMENTATION SEQUENCE:

### TASK 1: P0 Issue #40 - Centralize Session ID Management
**GitHub**: https://github.com/kevin-biot/MCP-ocs/issues/40

**Implementation**:
- Create `src/utils/session.ts`: `createSessionId(seed?)` using `nowEpoch()` + short random suffix
- Modify `src/lib/tools/tool-registry.ts` (executeTool): inject sessionId when missing
- Update `src/tools/read-ops/index.ts`: remove `Date.now()` fallback

**Unit Test**: Missing sessionId → auto-generated format `sess-<epoch>-<short>`

### TASK 2: P0 Issue #41 - Global Tool Execution Cap  
**GitHub**: https://github.com/kevin-biot/MCP-ocs/issues/41

**Implementation**:
- Modify `src/lib/tools/tool-registry.ts`: per-request counter, abort after N tools
- Add structured error + `postInstrumentError` call
- Optional env var: `TOOL_MAX_EXEC_PER_REQUEST`

**Unit Test**: Executing > cap tools returns error, stops execution, calls postInstrumentError

### TASK 3: P0 Issue #42 - Universal Placeholder Validation
**GitHub**: https://github.com/kevin-biot/MCP-ocs/issues/42

**Implementation**:
- Create `src/lib/tools/tool-args-validator.ts`: detect placeholders `/^<[^>]+>$/`
- Integrate in `src/lib/tools/tool-registry.ts` (pre-exec): validation + structured error
- Block execution on unresolved placeholders

**Unit Test**: `oc_read_describe` with name `"<pod>"` fails fast, returns guidance

## VALIDATION REQUIREMENTS:

### Jest Testing:
```bash
# After each task implementation
npm test -- --testNamePattern="session|execution|placeholder" --verbose
```

### Build Validation:
```bash
npm run build
npm run test
```

### LM Studio Validation:
- Run original diagnostic prompts against fixes
- Log results to: `tmp/session-validation-$(date +%s).md`
- Document any unexpected behaviors

## COMPLIANCE REQUIREMENTS:

### D-009 Policy:
- Use `nowEpoch()`/`nowIso()` from `src/utils/time.ts` (no `Date.now()`)
- stderr-only logging in libs
- Maintain existing instrumentation patterns

### Surgical Changes:
- Minimal modifications per GitHub spec
- Preserve existing MCP protocol patterns
- No unrelated refactors

## SUCCESS CRITERIA:

✅ All P0 issues (#40, #41, #42) resolved  
✅ Unit tests pass for each fix  
✅ Build succeeds without errors  
✅ LM Studio validation confirms functionality  
✅ No regression in existing behavior  

## COMPLETION HANDOFF:

1. **Git Status**: Commit all changes to feature branch
2. **Test Results**: Document in `tmp/p0-bugfix-test-results-$(date +%s).md`
3. **Validation Log**: Complete LM Studio validation in tmp file
4. **Ready for Review**: Feature branch ready for merge to release/v0.9.0-beta

## EMERGENCY ESCALATION:
If any task fails or creates regression: Stop, document issue in tmp/, escalate to ARCHITECT role.

---

**EXECUTE WITH**: `codex apply /Users/kevinbrown/MCP-ocs/tmp/codex-bugfix-p0-2025-09-12-prompt.md`
# CODEX Role Prompts - F-012 Coverage Sprint

**Date**: 2025-09-12  
**Sprint**: f-012-coverage-100-existing-tools  
**Process**: v3.3.2  

## CODEX Kickoff Prompt (DEVELOPER Phase)

The complete CODEX kickoff prompt is stored in the artifacts and includes:

### Key Components
- **Mission**: 95-100% test coverage for F-011 middleware and diagnostic tools
- **Process v3.3.2**: AI executor documentation requirements
- **Quality Standards**: MCP protocol + D-009 compliance
- **Git Workflow**: Daily feature branch from beta9 with EOD merge back
- **Role Templates**: Explicit dev→test→review transition protocol
- **Safety Guardrails**: Zero-stdout, type safety, async patterns
- **Evidence Requirements**: Coverage reports, performance validation, integration testing

### Sprint Phases (2-3 hours total)
1. **Phase 1 (60-90 min)**: Middleware coverage (instrumentation, metrics, vector writers)
2. **Phase 2 (45-60 min)**: Collections coverage (unified adapter, stats, CLI)
3. **Phase 3 (45-75 min)**: Tool integration coverage (diagnostic + read-ops tools)

### Technical Context
- **Branch Strategy**: `f-012-coverage-daily-2025-09-12` from `release/v0.9.0-beta9`
- **Foundation**: F-011 proven patterns and middleware
- **Testing Framework**: Jest with coverage reporting
- **Environment**: Local Chroma integration with mocking strategies

## Cross-Session Continuity

### Documentation Requirements
- Maintain `execution-log-codex.md` with timestamps and evidence
- Document all phase completions with coverage metrics
- Record any mid-flight corrections or scope adjustments
- Prepare evidence package for TESTER role handoff

### Quality Gates
- 95-100% coverage in target files
- Zero MCP protocol violations
- Performance bounds maintained (<400ms pre-search)
- All tests pass with no compilation errors

## Role Transition Preparation

### DEVELOPER → TESTER Handoff
- Complete execution log with evidence anchors
- Test coverage reports (95%+ target files)
- Performance validation data
- Integration test results
- Safety constraint verification

---

**Prompt Status**: READY FOR CODEX EXECUTION  
**Next Phase**: DEVELOPER phase execution with systematic test development

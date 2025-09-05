# Review-Prompt-Lib: Weekly Quality Process 1.0

## Overview
Systematic quality review library that provides **stable, repeatable reviews** with **historical deduplication** to prevent backlog chaos.

## Core Problem Solved
- Traditional reviews create "lossy" backlogs - can't reproduce the same review logic
- Weekly quality sweeps create duplicate backlog items for the same issues
- Quality trends become impossible to track without consistent review methodology

## Solution: Review-Prompt-Lib
- **Stable review prompts** ensure consistent, comparable results over time
- **Historical fingerprint tracking** prevents duplicate backlog items
- **Human-AI partnership** model for systematic quality engineering
- **Integration with existing sprint-management** process

## Directory Structure
```
review-prompt-lib/
├── domains/                        # Review domain templates
│   ├── async-correctness/          # First implementation (ready)
│   ├── api-contracts/              # TODO: Next domain
│   └── trust-boundaries/           # TODO: Third domain
├── scripts/                        # Automation (TODO)
└── weekly-sweep-process.md         # Human-AI workflow (TODO)
```

## How It Works

### Weekly Sweep Process
1. **Run stable review prompt** against codebase using LLM
2. **Generate finding fingerprints** for each issue discovered
3. **Compare against historical registry** to prevent duplicates
4. **Execute backlog actions**: CREATE (new) | SKIP (existing) | RESOLVE (gone)
5. **Update registry and backlog** coherently

### Finding Fingerprint System
Each finding gets a unique, stable identifier:
```
"async-correctness:src/auth.ts:45:unawaited-promise"
```

This ensures **one finding = one backlog task (forever)** - no duplicates possible.

## Domain: async-correctness (READY)

### Files Created:
- ✅ `review-prompt-v1.0.md` - Stable LLM prompt for consistent async reviews
- ✅ `domain-specification.yaml` - Structured metadata and configuration  
- ✅ `severity-criteria.json` - P0-P3 classification rules and context modifiers
- ✅ `historical/finding-registry.json` - Deduplication tracking (empty, ready for first run)

### Integration:
- **Backlog Domain**: d-005-async-correctness
- **Task Prefix**: ASYNC-XXX
- **File Patterns**: src/**/*.ts (excludes tests)
- **Categories**: unawaited-promise, missing-timeout, race-condition, promise-pattern, error-propagation

## Next Steps

### Immediate (Complete MVP):
1. **Create processing scripts** - Automation for weekly sweeps
2. **Test first run** - Validate against MCP-ocs codebase
3. **Add 2 more domains** - api-contracts, trust-boundaries

### Future Enhancement:
1. **Weekly sweep automation** - Scheduled quality reviews
2. **Dashboard integration** - Trend visualization  
3. **CI/CD hooks** - Quality gates in pipeline
4. **Additional domains** - Security, performance, documentation

## Usage (When Complete)

### Manual Weekly Sweep:
```bash
# Run async-correctness review
cd /Users/kevinbrown/MCP-ocs
./sprint-management/review-prompt-lib/scripts/run-weekly-sweep.sh async-correctness

# Review findings and update backlog
./sprint-management/review-prompt-lib/scripts/process-findings.js async-correctness
```

### Integration with 3.2 Daily Process:
Quality intelligence from weekly sweeps feeds into daily sprint prompts, providing context about known issues in files being modified.

## Benefits

1. **No Backlog Duplicates** - Historical tracking prevents chaos
2. **Quality Trends** - Week-over-week improvement visibility
3. **Systematic Coverage** - All domains get consistent review
4. **Human-AI Partnership** - Leverages both human judgment and AI systematic execution
5. **Process Integration** - Enhances existing 3.2 workflow without disruption

---

**Status**: async-correctness domain READY FOR TESTING
**Next**: Create automation scripts and test first review run
**Timeline**: ~2 hours to complete working Review Process 1.0 MVP

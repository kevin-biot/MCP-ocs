# REPOSITORY STRUCTURE & PATH CONTEXT ANALYSIS

## REPO LOCATION
Repository Path: `/Users/kevinbrown/MCP-ocs`
This is the root directory for all paths mentioned below.

## KEY DIRECTORY STRUCTURE
```
/Users/kevinbrown/MCP-ocs/
├── src/
│   ├── lib/
│   │   ├── templates/
│   │   │   ├── template-engine.ts         # Template execution engine
│   │   │   ├── templates/                 # JSON template files (NOT .ts files!)
│   │   │   │   ├── cluster-health.json    # TASK-001 target file
│   │   │   │   ├── ingress-pending.json   # Pattern source file
│   │   │   └── blocks/                    # Reusable template blocks
│   │   └── memory/                        # Memory system (ChromaDB + JSON)
│   └── tools/                              # MCP tools implementation
├── docs/
│   ├── architecture/
│   │   ├── ADR-STATUS-DYNAMIC.md          # ADR implementation tracking
│   │   ├── ADR-014-.md                   # Deterministic Template Engine ADR
│   │   └── ADR-.md                        # Other architecture decisions
│   └── development/
│       ├── CODEX_TRANSITION.md            # State transition document
│       └── IMPLEMENTATION_PROGRESS_LEDGER.md
├── sprint-management/                      # NEW sprint structure
│   ├── tasks-current.md                   # Master task list (source of truth)
│   ├── active-tasks/                      # Daily generated files
│   │   ├── role-context-developer-YYYY-MM-DD.md
│   │   ├── role-context-tester-YYYY-MM-DD.md
│   │   └── role-context-reviewer-YYYY-MM-DD.md
│   └── completion-logs/                   # Session outputs
│       ├── dev-completion-log-YYYY-MM-DD.md
│       └── test-completion-log-YYYY-MM-DD.md
├── scripts/
│   ├── setup-sprint-day-interactive.sh    # Creates daily role files
│   ├── setup-sprint-day-enhanced.sh       # Enhanced with AI integration
│   └── e2e/
│       ├── check-readiness.sh             # Environment validation
│       └── run-parity-suite.sh            # Determinism testing
├── artifacts/                              # Test outputs (being cleaned)
│   ├── archive/                           # Old test results
│   └── sprint-hygiene/                    # Current sprint artifacts
└── .env.parity                            # Environment configuration
```

## CRITICAL PATH MAPPINGS

### 1. STANDUP PROCESS FLOW PATHS
```bash
# Claude reads these files during standup:
INPUT:  /Users/kevinbrown/MCP-ocs/docs/architecture/ADR-STATUS-DYNAMIC.md
INPUT:  /Users/kevinbrown/MCP-ocs/sprint-management/tasks-current.md  
INPUT:  /Users/kevinbrown/MCP-ocs/sprint-management/completion-logs/*-$(date -d yesterday +%Y-%m-%d).md
OUTPUT: Recommendations for task prioritization
```

### 2. SCRIPT GENERATION PATHS
```bash
# Interactive script reads and writes:
READ:   /Users/kevinbrown/MCP-ocs/sprint-management/tasks-current.md
WRITE:  /Users/kevinbrown/MCP-ocs/sprint-management/active-tasks/role-context-developer-$(date +%Y-%m-%d).md
WRITE:  /Users/kevinbrown/MCP-ocs/sprint-management/active-tasks/task-status-$(date +%Y-%m-%d).md
```

### 3. CODEX EXECUTION PATHS
```bash
# Codex reads context and modifies:
READ:   /Users/kevinbrown/MCP-ocs/sprint-management/active-tasks/role-context-developer-*.md
MODIFY: /Users/kevinbrown/MCP-ocs/src/lib/templates/templates/cluster-health.json
MODIFY: /Users/kevinbrown/MCP-ocs/src/lib/templates/templates/monitoring-template.json
WRITE:  /Users/kevinbrown/MCP-ocs/sprint-management/completion-logs/dev-completion-log-*.md
```

### TEMPLATE FILE CLARIFICATION
IMPORTANT: The templates are JSON files, not TypeScript:

❌ INCORRECT: src/lib/templates/cluster-health-template.ts (doesn't exist)
✅ CORRECT: src/lib/templates/templates/cluster-health.json (actual file)

The task descriptions may reference ".ts files" but the actual implementation is JSON-based templates with a TypeScript engine (template-engine.ts) that processes them.

## MEMORY SYSTEM PATHS
```bash
# ChromaDB vector storage location:
/Users/kevinbrown/MCP-ocs/.memory/chroma/

# JSON fallback storage:
/Users/kevinbrown/MCP-ocs/.memory/sessions/

# Process memory retrieval:
Memory ID: "standup-process-memory-v2"
Tags: ["standup-process", "v2", "automation", "adr-integration"]
```

## REVIEW FOCUS AREAS WITH PATHS

### Path Dependencies:
1. **User Path Changes**: If `/Users/kevinbrown/` changes to different user, paths would need to be updated
2. **Cross-Platform Compatibility**: Paths may not work on Windows systems without modification
3. **Relative vs Absolute Paths**: The system currently uses absolute paths which could be problematic in different environments

### File Existence Validation:
1. **Script Validation**: Scripts should check if paths exist before reading/writing
2. **Fallback Handling**: What happens when expected files like completion logs are missing?
3. **Template Availability**: Template files should be validated to ensure they exist before processing

### Permission Issues:
1. **Write Permissions**: Codex should have write permissions to template files and completion logs
2. **Directory Access**: Scripts need execute permissions on all relevant directories
3. **Memory System Access**: The memory system should be properly configured for read/write operations

### Git Integration Paths:
```bash
git add sprint-management/completion-logs/dev-completion-log-$(date +%Y-%m-%d).md
git add src/lib/templates/templates/cluster-health.json
git commit -m "feat(templates): implement TASK-001 dynamic resource selection"
```

## KEY FINDINGS

### Template System Architecture
The system uses a JSON-based template engine with:
- `src/lib/templates/template-engine.ts` - Main execution engine
- `src/lib/templates/templates/` - JSON template files (not TypeScript)
- Template files like `cluster-health.json` and `ingress-pending.json` are the actual implementations

### Sprint Management Process
The repository has a comprehensive sprint management system:
- `sprint-management/tasks-current.md` - Master task list
- `sprint-management/active-tasks/` - Daily generated role context files
- `sprint-management/completion-logs/` - Session output records

### ADR Integration
The system maintains an up-to-date ADR status tracking:
- `docs/architecture/ADR-STATUS-DYNAMIC.md` - Current implementation state
- `docs/architecture/ADR-014-deterministic-template-engine.md` - Template engine ADR

### Memory System
The system has a robust memory management approach:
- `src/lib/memory/` - Core memory components
- `memory/` directory with actual session data
- Memory tools that integrate with tool execution

### TASK-001 Context
For the specific task of implementing dynamic resource selection in cluster-health.json:
- Target file: `/Users/kevinbrown/MCP-ocs/src/lib/templates/templates/cluster-health.json`
- Pattern source: `/Users/kevinbrown/MCP-ocs/src/lib/templates/templates/ingress-pending.json`
- Template engine: `/Users/kevinbrown/MCP-ocs/src/lib/templates/template-engine.ts`
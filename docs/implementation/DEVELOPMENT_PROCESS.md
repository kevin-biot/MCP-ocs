# MCP-ocs Development Process Framework

**Version:** 1.0  
**Date:** August 10, 2025  
**Status:** Active  

## 🎯 **Purpose**

This document defines a structured, architecture-first development methodology for AI-assisted software development. It addresses the critical challenge of maintaining context continuity across chat sessions while enforcing architectural discipline and decision documentation.

## 🏗️ **The Context Challenge**

Traditional AI-assisted development struggles with:
- **Context Loss** across new chat sessions
- **Architecture Drift** without systematic decision tracking
- **Memory Fragmentation** scattered across tools and conversations
- **"Where Are We?"** confusion in complex, multi-component projects
- **Inconsistent Decision Making** without architectural review

## 🧭 **Multi-Layer Context System**

MCP-ocs leverages a four-layer context architecture:

```
┌─────────────────────────────────┐
│   New Chat Session             │ ← Start with zero context
├─────────────────────────────────┤
│   Git Repository               │ ← Current code state, commit history, branches
├─────────────────────────────────┤  
│   ADRs (Architecture Decisions)│ ← Documented decisions, rationale, trade-offs
├─────────────────────────────────┤
│   MCP Memory System            │ ← Conversation history, patterns, solutions
└─────────────────────────────────┘
```

## 📋 **Phase 1: Context Reconstruction Protocol**

Every new chat session **MUST** start with this structured approach:

### **1.1 Repository State Check**
```bash
# Run these commands before starting development discussion
cd /Users/kevinbrown/MCP-ocs
git status
git branch --show-current
git log --oneline -5
find . -name "*.md" -exec grep -l "TODO\|FIXME\|BUG" {} \;
```

**Template:**
```markdown
## Repository State
- **Current Branch:** [branch_name]
- **Recent Commits:** [last 3-5 commits with descriptions]
- **Outstanding Issues:** [TODOs, FIXMEs, known bugs]
- **Active Development Areas:** [which components being worked on]
```

### **1.2 ADR Review**
```markdown
## ADR Status Review
1. **Read Relevant ADRs:** docs/architecture/ADR-*.md
2. **Current ADRs:**
   - ADR-001: OpenShift vs Kubernetes API Client Decision
   - ADR-002: GitOps Integration Strategy  
   - ADR-003: Memory Storage and Retrieval Patterns
   - ADR-004: Tool Namespace Management
   - ADR-005: Workflow State Machine Design

3. **ADR Relevance:** [which ADRs apply to current work]
4. **ADR Gaps:** [decisions needed that lack ADRs]
```

### **1.3 Memory Context Search**
```markdown
## Memory Context Retrieval
1. **Search Terms:** [relevant technical terms for current focus]
2. **Previous Solutions:** [similar problems solved before]
3. **Technical Patterns:** [reusable approaches identified]
4. **Lessons Learned:** [what worked/didn't work previously]
```

### **1.4 Current Focus Definition**
```markdown
## Session Focus
- **Problem Statement:** [what specific problem are we solving?]
- **Architectural Layer:** [which layer/component does this impact?]
- **Decision Points:** [what choices need architectural guidance?]
- **Success Criteria:** [how do we know we're done?]
```

## 🏛️ **Phase 2: Architecture-First Decision Making**

### **2.1 The ADR-First Rule**
**Before writing any significant code:**

1. **Problem Definition** - What exactly are we solving?
2. **Architectural Impact Assessment** - Which layers/components affected?
3. **Decision Points Identification** - What choices need architectural guidance?
4. **ADR Requirement Check** - Does this need formal documentation?
5. **Implementation Approach** - High-level design before implementation details

### **2.2 Decision Gates Checklist**

```markdown
## Before Writing Code Checklist

**Gate 1: Problem Definition**
- [ ] Clear problem statement written
- [ ] Success criteria defined and measurable
- [ ] Scope boundaries established and documented

**Gate 2: Architectural Review**
- [ ] Existing ADRs reviewed for relevance and consistency
- [ ] Architectural impact assessed (performance, security, maintainability)
- [ ] Design alternatives considered and documented
- [ ] Trade-offs explicitly identified

**Gate 3: Implementation Planning**
- [ ] High-level design complete and reviewed
- [ ] Dependencies identified and validated
- [ ] Testing strategy defined
- [ ] Rollback/migration plan considered

**Gate 4: Documentation**
- [ ] ADR created/updated if decision is significant
- [ ] Implementation notes captured for future reference
- [ ] Context stored in MCP memory with proper tags
```

### **2.3 ADR Creation Criteria**

Create an ADR when:
- **Architectural Impact:** Decision affects multiple components or layers
- **Long-term Consequences:** Choice has lasting implications (>6 months)
- **Trade-offs Present:** Multiple viable alternatives exist
- **Team Alignment Needed:** Decision requires stakeholder consensus
- **Complexity Justification:** Non-obvious choice requiring rationale

## 📤 **Phase 3: Structured Context Handoff**

At the end of each development session:

### **3.1 Session Summary Template**
```markdown
## Session Handoff - [Date]

### **Accomplished This Session:**
- [What was completed]
- [Decisions made]
- [Code written/modified]
- [ADRs created/updated]

### **Current State:**
- **Git Status:** [branch, commits, pending changes]
- **Next Immediate Actions:** [what needs to happen next]
- **Blocking Issues:** [dependencies or decisions needed]

### **Architectural Decisions Made:**
- [Decision 1]: [rationale]
- [Decision 2]: [rationale]
- [ADRs Updated]: [list of ADRs modified]

### **Context for Next Session:**
- **Focus Area:** [what to work on next]
- **Required Knowledge:** [what context will be needed]
- **Memory Tags:** [how to search for this work later]
```

### **3.2 Memory Storage Protocol**
```typescript
// Store structured project context
{
  sessionType: 'architecture' | 'implementation' | 'review' | 'debugging',
  projectPhase: 'design' | 'development' | 'testing' | 'deployment',
  component: 'router' | 'memory' | 'openshift' | 'atlassian' | 'prometheus',
  architecturalDecisions: string[],
  implementationNotes: string[],
  nextActions: string[],
  adrReferences: string[],
  gitCommitHashes: string[]
}
```

## 📝 **Session Type Templates**

### **Template A: New Development Session**
```markdown
# MCP-ocs Development Session - [Date]

## Context Reconstruction
1. **Repository Check**: 
   - Current branch: [branch]
   - Recent commits: [commit hashes and messages]
   - Active files: [modified files]

2. **ADR Review**: 
   - Relevant ADRs: [list]
   - Architectural constraints: [key decisions]
   - Decision gaps: [needed ADRs]

3. **Memory Search**: 
   - Search terms: [technical keywords]
   - Related conversations: [session IDs]
   - Previous solutions: [patterns found]

4. **Sprint/Phase**: [current development phase]

## Current Focus
- **Problem**: [specific issue or feature]
- **Scope**: [which components/layers involved]
- **Architectural Questions**: [decisions needed before coding]

## Session Goals
- [ ] Define architecture for [specific area]
- [ ] Create/update ADR if needed
- [ ] Implement basic structure
- [ ] Update documentation
- [ ] Store context for next session
```

### **Template B: Architecture Review Session**
```markdown
# Architecture Review Session - [Date]

## Pre-Implementation Review
1. **Proposed Changes**: [what we want to build]
2. **ADR Implications**: [which ADRs are affected]
3. **Design Alternatives**: [options considered]
4. **Decision Rationale**: [why this approach]

## Architecture Validation
- [ ] Consistency with existing ADRs
- [ ] Impact on other components assessed
- [ ] Performance implications considered
- [ ] Security considerations reviewed
- [ ] Deployment implications understood

## Decision Documentation
- [ ] Create new ADR if needed
- [ ] Update existing ADRs
- [ ] Document trade-offs made
- [ ] Store decision rationale in memory
```

### **Template C: Debugging/Issue Resolution Session**
```markdown
# Issue Resolution Session - [Date]

## Problem Analysis
1. **Issue Description**: [what's broken/not working]
2. **Symptoms Observed**: [specific behaviors]
3. **Affected Components**: [which parts of system]
4. **Reproduction Steps**: [how to recreate issue]

## Context Research
1. **Memory Search**: [search for similar issues]
2. **Previous Solutions**: [what worked before]
3. **ADR Review**: [architectural constraints to consider]

## Resolution Approach
- [ ] Root cause identified
- [ ] Fix approach defined
- [ ] Testing strategy planned
- [ ] Impact assessment completed

## Documentation
- [ ] Solution documented in memory
- [ ] Update relevant ADRs if architectural
- [ ] Create issue/resolution pattern for reuse
```

## 🔧 **Automation Tools**

### **Context Reconstruction Script**
```bash
#!/bin/bash
# docs/scripts/chat-context-init.sh

echo "=== MCP-ocs Development Context ==="
echo

echo "1. REPOSITORY STATE:"
git status --short
echo "Current branch: $(git branch --show-current)"
echo "Recent commits:"
git log --oneline -5
echo

echo "2. ADR STATUS:"
echo "Available ADRs:"
ls -la docs/architecture/ADR-*.md | sed 's/.*ADR-/ADR-/'
echo

echo "3. ACTIVE ISSUES:"
echo "TODOs and FIXMEs found in:"
find . -name "*.md" -o -name "*.ts" -o -name "*.js" | xargs grep -l "TODO\|FIXME\|BUG" 2>/dev/null || echo "None found"
echo

echo "4. MEMORY SEARCH SUGGESTIONS:"
echo "For current development context, search memory for:"
echo "- Recent architectural decisions"
echo "- Similar implementation patterns"  
echo "- Previous debugging sessions"
echo "- Component-specific solutions"
echo

echo "5. READY FOR NEW CHAT SESSION"
echo "Use appropriate session template from docs/DEVELOPMENT_PROCESS.md"
```

### **ADR Creation Helper**
```bash
#!/bin/bash
# docs/scripts/create-adr.sh

if [ $# -ne 2 ]; then
    echo "Usage: $0 <adr_number> <title>"
    echo "Example: $0 006 'Database Connection Pooling Strategy'"
    exit 1
fi

ADR_NUM=$(printf "%03d" $1)
TITLE="$2"
FILENAME="docs/architecture/ADR-$ADR_NUM-$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g').md"

cat > "$FILENAME" << EOF
# ADR-$ADR_NUM: $TITLE

**Status:** Draft  
**Date:** $(date +"%B %d, %Y")  
**Decision Makers:** [Name], [Role]

## Context

[Describe the situation and problem that requires a decision]

## Decision

[State the decision that was made]

## Rationale

### Benefits:
- [Benefit 1]
- [Benefit 2]

### Costs:
- [Cost 1]  
- [Cost 2]

### Risks:
- [Risk 1]
- [Risk 2]

## Implementation

[Describe how the decision will be implemented]

## Consequences

[Describe the expected outcomes and impacts]

## Review Date

[When this decision should be reviewed - typically 3-6 months]
EOF

echo "Created ADR: $FILENAME"
echo "Please edit the template and update status to 'Accepted' when complete"
```

## 🎯 **Success Metrics**

### **Process Effectiveness:**
- **Context Recovery Time:** <5 minutes to reconstruct session context
- **Decision Documentation:** 100% of significant decisions have ADRs
- **Memory Utilization:** Previous solutions found and reused 80% of time
- **Architecture Consistency:** Zero conflicts with existing ADRs

### **Development Quality:**
- **Rework Reduction:** Decreased code changes due to architectural conflicts
- **Knowledge Retention:** Team members can continue each other's work
- **Decision Traceability:** All architectural choices have documented rationale
- **Onboarding Efficiency:** New team members productive within 2 sessions

## 🔄 **Process Evolution**

### **Monthly Review:**
- **Template Effectiveness:** Are session templates being used and helpful?
- **ADR Quality:** Are decisions well-documented and followed?
- **Memory Patterns:** What knowledge is being captured and reused?
- **Process Friction:** Where are developers experiencing resistance?

### **Quarterly Assessment:**
- **Architectural Debt:** How well are we maintaining architectural integrity?
- **Knowledge Accumulation:** Is institutional knowledge growing effectively?
- **Team Adoption:** How well is the team following the process?
- **Tool Integration:** Are our automation tools saving time and reducing errors?

## 🚀 **Getting Started**

### **Immediate Actions:**
1. **Create Session Templates** (see Phase 4 below)
2. **Set up Context Scripts** (see Phase 4 below)
3. **Establish Memory Tagging Strategy** (see Phase 4 below)
4. **Create ADR Templates** (see Phase 4 below)
5. **Train Team on Process** (documentation and practice sessions)

### **First Session Setup:**
1. Run `docs/scripts/chat-context-init.sh`
2. Choose appropriate session template
3. Follow context reconstruction protocol
4. Begin architecture-first development
5. End with structured handoff

## 📚 **Related Documentation**

- **ADR Repository:** `docs/architecture/ADR-*.md`
- **Session Templates:** `docs/templates/`
- **Automation Scripts:** `docs/scripts/`
- **Memory Tagging Guide:** `docs/MEMORY_TAGGING.md`
- **ADR Creation Guide:** `docs/ADR_GUIDE.md`

---

**This process framework transforms AI-assisted development from ad-hoc conversations into a systematic, architecture-driven methodology that maintains context, enforces decisions, and builds institutional knowledge.**

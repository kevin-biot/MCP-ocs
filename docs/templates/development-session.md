# New Development Session Template

**Date:** [Current Date]  
**Session Type:** Development  
**Component Focus:** [router/memory/openshift/atlassian/prometheus]

## 🔍 **Context Reconstruction**

### 1. Repository State Check
```bash
# Run before starting development discussion
cd /Users/kevinbrown/MCP-ocs
git status
git branch --show-current  
git log --oneline -5
```

**Current State:**
- **Branch:** [current_branch_name]
- **Recent Commits:** 
  - [commit_hash]: [commit_message]
  - [commit_hash]: [commit_message]
  - [commit_hash]: [commit_message]
- **Modified Files:** [list any uncommitted changes]
- **Outstanding Issues:** [any TODOs, FIXMEs found]

### 2. ADR Review
**Relevant ADRs for this session:**
- [ ] ADR-001: OpenShift vs Kubernetes API Client Decision
- [ ] ADR-002: GitOps Integration Strategy
- [ ] ADR-003: Memory Storage and Retrieval Patterns  
- [ ] ADR-004: Tool Namespace Management
- [ ] ADR-005: Workflow State Machine Design

**Key Architectural Constraints:**
- [constraint_1]: [from which ADR]
- [constraint_2]: [from which ADR]

**ADR Gaps Identified:**
- [decision_needed]: [brief description]

### 3. Memory Context Search
**Search terms for this session:** [relevant technical keywords]

**MCP Memory Search Results:**
- **Previous Solutions:** [similar problems solved before]
- **Technical Patterns:** [reusable approaches identified]  
- **Lessons Learned:** [what worked/didn't work previously]

### 4. Current Focus Definition
- **Problem Statement:** [what specific problem are we solving?]
- **Architectural Layer:** [which layer/component does this impact?]
- **Decision Points:** [what choices need architectural guidance?]
- **Success Criteria:** [how do we know we're done?]

## 🎯 **Session Goals**

### Primary Objectives:
- [ ] [main_goal_1]
- [ ] [main_goal_2]  
- [ ] [main_goal_3]

### Architecture Tasks:
- [ ] Define architecture for [specific area]
- [ ] Create/update ADR if significant decisions needed
- [ ] Validate consistency with existing ADRs
- [ ] Document trade-offs and rationale

### Implementation Tasks:
- [ ] Implement basic structure/skeleton
- [ ] Write unit tests for core functionality
- [ ] Update documentation
- [ ] Integration with existing components

### Documentation Tasks:
- [ ] Update relevant README files
- [ ] Store context in MCP memory with proper tags
- [ ] Prepare handoff notes for next session

## 🛠️ **Decision Gates Checklist**

**Before Writing Code:**

### Gate 1: Problem Definition
- [ ] Clear problem statement written
- [ ] Success criteria defined and measurable
- [ ] Scope boundaries established and documented

### Gate 2: Architectural Review  
- [ ] Existing ADRs reviewed for relevance and consistency
- [ ] Architectural impact assessed (performance, security, maintainability)
- [ ] Design alternatives considered and documented
- [ ] Trade-offs explicitly identified

### Gate 3: Implementation Planning
- [ ] High-level design complete and reviewed
- [ ] Dependencies identified and validated
- [ ] Testing strategy defined
- [ ] Rollback/migration plan considered

### Gate 4: Documentation
- [ ] ADR created/updated if decision is significant
- [ ] Implementation notes captured for future reference
- [ ] Context stored in MCP memory with proper tags

## 📝 **Development Notes**

### Architecture Decisions Made:
- [decision_1]: [rationale]
- [decision_2]: [rationale]

### Implementation Approach:
- [approach_description]
- [key_technical_details]

### Challenges Encountered:
- [challenge_1]: [how_addressed]
- [challenge_2]: [how_addressed]

## 📤 **Session Handoff**

### Accomplished This Session:
- [what_was_completed]
- [decisions_made]
- [code_written_modified]
- [adrs_created_updated]

### Current State:
- **Git Status:** [branch, commits, pending changes]
- **Next Immediate Actions:** [what needs to happen next]
- **Blocking Issues:** [dependencies or decisions needed]

### Context for Next Session:
- **Focus Area:** [what to work on next]
- **Required Knowledge:** [what context will be needed]
- **Memory Tags:** [how to search for this work later]

### Memory Storage:
```typescript
{
  sessionType: 'development',
  projectPhase: '[design/development/testing/deployment]',
  component: '[component_name]',
  architecturalDecisions: ['[decision_1]', '[decision_2]'],
  implementationNotes: ['[note_1]', '[note_2]'],
  nextActions: ['[action_1]', '[action_2]'],
  adrReferences: ['[adr_id_1]', '[adr_id_2]'],
  gitCommitHashes: ['[commit_hash_1]', '[commit_hash_2]']
}
```

---

**Template Usage:** Copy this template at the start of each development session, fill in the context reconstruction section, and update throughout the session.

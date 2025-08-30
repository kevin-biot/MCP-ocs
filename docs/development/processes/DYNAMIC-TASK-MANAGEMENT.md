# Dynamic Task Management System

**Purpose**: Real-time task tracking with automated status updates and file rotation  
**Context**: Codex-friendly task management with human oversight

---

## 📋 Task File Architecture

### **File Structure**
```
project-root/
├── tasks.md                          # Current active tasks (human priorities)
├── task-status.md                    # Real-time progress (AI updates)
├── task-changelog.md                 # All task state changes (audit trail)
├── tasks/
│   ├── active/
│   │   ├── tasks-2025-W34.md         # Current week's tasks
│   │   └── task-status-2025-W34.md   # Current week's status
│   ├── completed/
│   │   ├── tasks-2025-W33.md         # Previous completed sprints
│   │   └── task-status-2025-W33.md
│   └── archive/
│       └── task-changelog-2025-W33.md # Historical change logs
```

### **Task Lifecycle States**
```typescript
enum TaskStatus {
  PLANNED = 'planned',        // Human created, not started
  READY = 'ready',           // Dependencies met, ready for work
  IN_PROGRESS = 'in_progress', // Codex actively working
  BLOCKED = 'blocked',       // Waiting for dependency/decision
  UNDER_REVIEW = 'under_review', // Completed, awaiting validation
  COMPLETED = 'completed',   // Validated and done
  DEFERRED = 'deferred',     // Moved to future sprint
  CANCELLED = 'cancelled'    // No longer needed
}
```

---

## 🤖 Codex Update Interface

### **tasks.md Format (Human-Owned)**
```markdown
# Active Tasks - Week 34, 2025

## 🎯 Sprint Goals
- **Primary Objective**: Implement rubrics framework foundation
- **Success Criteria**: ADR-015 complete, rubric engine operational
- **Time Budget**: 16 hours over 4 days

## 📋 Task List

### 🚀 High Priority
- [ ] **TASK-001**: Create rubric definition language
  - **Effort**: 4h
  - **Dependencies**: ADR-015 approval
  - **Acceptance**: TypeScript interfaces, validation, tests
  
- [ ] **TASK-002**: Implement rubric registry system
  - **Effort**: 6h
  - **Dependencies**: TASK-001
  - **Acceptance**: Registry class, CRUD operations, persistence

### 🎯 Medium Priority  
- [ ] **TASK-003**: Template-rubric integration
  - **Effort**: 4h
  - **Dependencies**: TASK-002
  - **Acceptance**: Templates execute rubrics, evidence validation

## 🚨 Blockers
- None currently identified

---
**Last Updated**: 2025-08-21 09:00 by Human
**Total Estimated Effort**: 14h
**Sprint Status**: Active
```

### **task-status.md Format (AI-Owned)**
```markdown
# Task Status - Real-Time Updates

**Last Updated**: 2025-08-21 14:23:45 by Codex  
**Session**: codex-session-2025-08-21-14:00  
**Active Tasks**: 2  
**Completed**: 1  

## 🔄 Current Activity
**Active Task**: TASK-002 (Implement rubric registry system)  
**Status**: IN_PROGRESS (60% complete)  
**Started**: 13:45  
**ETA**: 15:30  
**Last Action**: Created RubricRegistry class, implementing CRUD methods

## 📊 Task Progress

### ✅ COMPLETED
- **TASK-001**: Create rubric definition language
  - **Status**: COMPLETED ✅
  - **Started**: 2025-08-21 09:15
  - **Completed**: 2025-08-21 12:30
  - **Actual Effort**: 3.25h (Est: 4h)
  - **Files Modified**: `src/lib/rubrics/types.ts`, `src/lib/rubrics/validation.ts`
  - **Commits**: 3 commits (def-lang-base, validation-rules, tests-added)
  - **Notes**: TypeScript interfaces complete, validation working, 95% test coverage

### 🚧 IN_PROGRESS
- **TASK-002**: Implement rubric registry system
  - **Status**: IN_PROGRESS (60% complete)
  - **Started**: 2025-08-21 13:45
  - **Progress**: Registry class created, implementing CRUD operations
  - **Current Work**: Adding persistence layer with JSON fallback
  - **Files Modified**: `src/lib/rubrics/registry.ts`
  - **Commits**: 1 commit (registry-foundation)
  - **Next Steps**: Complete persistence, add error handling, write tests
  - **Blockers**: None
  - **ETA**: 15:30 (1.75h remaining)

### 📋 READY
- **TASK-003**: Template-rubric integration
  - **Status**: READY (dependencies met)
  - **Dependencies**: TASK-002 (nearly complete)
  - **Estimated Start**: 15:45
  - **Effort**: 4h
  - **Notes**: Ready to begin once TASK-002 completes

## 📈 Progress Metrics
- **Sprint Progress**: 23% complete (3.25h / 14h)
- **Velocity**: 0.81h/hour (slightly ahead of estimate)
- **Quality Score**: 95% (test coverage, commit quality)
- **Blocker Time**: 0% (no blocked time this sprint)

## 🔄 Recent Changes (Last 2 hours)
- 14:23 - TASK-002: Added persistence layer interface
- 14:15 - TASK-002: Implemented registry CRUD operations  
- 13:58 - TASK-002: Created RubricRegistry base class
- 13:45 - TASK-002: Started implementation
- 12:30 - TASK-001: Completed and validated ✅

---
**Auto-Generated**: This file is automatically updated by Codex during execution
**Human Review**: Evening wrap validates progress and quality
```

### **task-changelog.md Format (Audit Trail)**
```markdown
# Task Changelog - All State Changes

**Purpose**: Complete audit trail of all task state transitions  
**Maintained By**: AI (automated logging)  
**Retention**: 90 days active, then archived

## 2025-08-21 Changes

### 14:23:45 - TASK-002 Progress Update
- **Task**: TASK-002 (Implement rubric registry system)
- **Change**: Status update + progress increment
- **Previous**: IN_PROGRESS (40%)
- **Current**: IN_PROGRESS (60%)
- **Details**: Added persistence layer interface, implementing JSON fallback
- **Files**: Modified `src/lib/rubrics/registry.ts`
- **Session**: codex-session-2025-08-21-14:00

### 12:30:15 - TASK-001 Completion
- **Task**: TASK-001 (Create rubric definition language)
- **Change**: COMPLETED ✅
- **Previous**: IN_PROGRESS (90%)
- **Current**: COMPLETED
- **Details**: TypeScript interfaces complete, validation working, tests pass
- **Files**: `src/lib/rubrics/types.ts`, `src/lib/rubrics/validation.ts`
- **Actual Effort**: 3.25h (Under estimate by 0.75h)
- **Quality Score**: 95% test coverage
- **Session**: codex-session-2025-08-21-09:00

### 09:15:30 - TASK-001 Started
- **Task**: TASK-001 (Create rubric definition language)
- **Change**: PLANNED → IN_PROGRESS
- **Details**: Beginning implementation of TypeScript interfaces
- **Session**: codex-session-2025-08-21-09:00

## 2025-08-20 Changes
[Previous day's changes...]

---
**Retention Policy**: 90 days in active changelog, then moved to archive
**Access**: Human review during evening wrap, searchable for patterns
```

---

## 🔄 Automated Task Management

### **Codex Update Protocol**
```typescript
interface CodexTaskUpdate {
  // Required for every update
  taskId: string;              // TASK-001, TASK-002, etc.
  timestamp: string;           // ISO timestamp
  sessionId: string;           // Current execution session
  
  // Status change
  previousStatus?: TaskStatus;
  newStatus: TaskStatus;
  progressPercent?: number;    // 0-100 for in-progress tasks
  
  // Work details
  workDescription: string;     // What was accomplished
  filesModified: string[];     // Changed files
  commitsCreated: string[];    // Git commit hashes
  
  // Effort tracking
  timeSpent?: number;          // Minutes spent this update
  estimatedRemaining?: number; // Minutes remaining
  
  // Issues and notes
  blockers?: string[];         // Current blocking issues
  decisions?: string[];        // Decisions made during work
  nextSteps?: string[];        // Planned next actions
}

class CodexTaskManager {
  async updateTaskStatus(update: CodexTaskUpdate): Promise<void> {
    // 1. Update task-status.md with current progress
    await this.updateActiveStatus(update);
    
    // 2. Log change to task-changelog.md
    await this.logTaskChange(update);
    
    // 3. Check for sprint completion triggers
    await this.checkSprintCompletion();
    
    // 4. Auto-commit changes with structured message
    await this.commitTaskUpdate(update);
  }
  
  async checkSprintCompletion(): Promise<void> {
    const tasks = await this.parseActiveTasks();
    const allComplete = tasks.every(task => 
      task.status === 'completed' || task.status === 'deferred'
    );
    
    if (allComplete) {
      await this.triggerSprintRotation();
    }
  }
}
```

### **Sprint Rotation System**
```typescript
interface SprintRotation {
  trigger: 'All tasks completed' | 'End of week' | 'Manual rotation';
  
  actions: [
    'Archive current tasks/ files to completed/',
    'Generate sprint-status summary',
    'Create new tasks.md from backlog',
    'Reset task-status.md for new sprint',
    'Initialize new task-changelog.md'
  ];
}

// Automatic file rotation when sprint completes
async function rotateSprint(weekNumber: string): Promise<void> {
  // 1. Archive current sprint
  await moveFile('tasks.md', `tasks/completed/tasks-${weekNumber}.md`);
  await moveFile('task-status.md', `tasks/completed/task-status-${weekNumber}.md`);
  await moveFile('task-changelog.md', `tasks/archive/task-changelog-${weekNumber}.md`);
  
  // 2. Generate sprint summary
  await generateSprintSummary(weekNumber);
  
  // 3. Create new sprint files
  await createNewTasksFromBacklog();
  await initializeTaskStatus();
  await initializeTaskChangelog();
  
  // 4. Commit rotation with summary
  await commitSprintRotation(weekNumber);
}
```

---

## 🎯 Integration with Daily Workflow

### **Morning Planning Enhancement**
```markdown
AI READS:
1. tasks.md (human priorities and new tasks)
2. task-status.md (current progress and blockers)
3. task-changelog.md (recent patterns and velocity)
4. Previous session-handoff (context from last session)

AI GENERATES daily-session-brief WITH:
- Tasks ready for execution (status = READY)
- Continuation work (status = IN_PROGRESS)
- Estimated time based on historical velocity
- Potential blockers and mitigation strategies
```

### **Execution Session Enhancement**
```markdown
CODEX CONTINUOUS UPDATES:
- Every 15-30 minutes: Update progress percentage
- Every file save: Log modified files
- Every commit: Record commit hash and description
- Every blocker: Document issue and attempted solutions
- Every decision: Capture choice and rationale

AUTOMATED QUALITY GATES:
- Progress updates trigger test runs
- File modifications trigger linting/formatting
- Major progress milestones trigger human notifications
- Blocker detection triggers escalation protocols
```

### **Evening Wrap Enhancement**
```markdown
HUMAN VALIDATION WITH ENHANCED DATA:
- Review actual vs estimated effort (velocity tracking)
- Validate quality of completed work (test coverage, etc.)
- Approve task status changes and completion claims
- Identify patterns in blockers or efficiency issues
- Adjust next-day priorities based on progress data
```

---

## 📊 Metrics and Analytics

### **Velocity Tracking**
```typescript
interface VelocityMetrics {
  estimatedHours: number;      // Original task estimates
  actualHours: number;         // Time actually spent
  velocityRatio: number;       // actual/estimated (>1 = slower, <1 = faster)
  completionRate: number;      // % of planned tasks completed
  qualityScore: number;        // Test coverage, review pass rate
  blockerTime: number;         // Time spent blocked vs productive
}
```

### **Pattern Recognition**
```markdown
AI ANALYTICS ON task-changelog.md:
- Task types that consistently run over/under estimate
- Common blockers and their resolution patterns
- Most productive times of day and session lengths
- Quality correlation with velocity (faster = worse quality?)
- Optimal task sizing for consistent completion
```

---

## 🚀 Implementation Roadmap

### **Phase 1: Basic Status Tracking (Week 1)**
- Create task-status.md format and update protocol
- Implement Codex update interface for progress tracking
- Add basic changelog logging for audit trail

### **Phase 2: Advanced Analytics (Week 2)**
- Add velocity tracking and metrics calculation
- Implement pattern recognition in changelog analysis
- Create automated sprint completion detection

### **Phase 3: Full Automation (Week 3)**
- Build sprint rotation system with file archiving
- Add intelligent task prioritization based on velocity
- Integrate with morning briefing and evening wrap

### **Phase 4: Optimization (Week 4)**
- Machine learning for effort estimation improvement
- Predictive blocker detection based on patterns
- Advanced analytics dashboard for team performance

---

## 🎯 Success Criteria

### **Task Management Quality**
- **Real-time Visibility**: Always know current status without asking
- **Accurate Estimates**: Velocity tracking improves estimate accuracy to ±20%
- **Blocker Resolution**: Average blocker resolution time <30 minutes
- **Sprint Completion**: 80%+ of planned tasks completed each sprint

### **Process Efficiency**
- **Human Overhead**: <5 minutes daily for task status validation
- **Context Preservation**: Zero task context loss between sessions
- **Progress Transparency**: Stakeholders can check progress anytime
- **Historical Learning**: Velocity and patterns improve sprint planning

This system creates **continuous task visibility** where Codex autonomously tracks progress while humans focus on strategic decisions and quality validation!

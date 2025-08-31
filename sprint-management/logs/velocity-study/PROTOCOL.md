# AI Development Velocity Study Protocol v1.1

## Study Objective
Quantify story point calibration and code productivity for 100% AI-assisted development by measuring human coordination time, AI execution velocity, and lines of code generation across different task types during one-week sprint execution.

## Study Setup (One-Time)

### 1. Create Velocity Tracking Infrastructure
```bash
# Directories already created:
# sprint-management/logs/velocity-study/
# sprint-management/analysis/velocity-data/

# Initialize daily study log file (run each day)
echo "timestamp,event_type,task_id,story_points_traditional,story_points_ai_adjusted,notes" > sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv

# Initialize daily LOC tracking
touch sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log
```

### 2. Task Categories for Classification

**Category A: Pure Cognitive Tasks**
- Code analysis, architectural design, documentation
- Expected AI advantage: 3-5x traditional velocity
- LOC expectation: High algorithmic code generation

**Category B: Integration/Environmental Tasks**  
- Cluster diagnostics, system configuration, tool coordination
- Expected AI advantage: 1-2x (limited by environmental dependencies)
- LOC expectation: Mixed implementation and configuration code

**Category C: Validation/Coordination Tasks**
- Human review, testing, decision-making, handoffs
- Expected AI advantage: <1x (human-constrained)
- LOC expectation: Minimal direct code generation

## Daily Protocol Steps

### STEP 1: Session Start (Human)
```bash
# Log session start
echo "$(date -Iseconds),SESSION_START,,,," >> sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv

# Record git baseline for LOC measurement
git rev-parse HEAD > sprint-management/logs/velocity-study/git-baseline-$(date +%Y-%m-%d).txt
```

### STEP 2: Task Selection & Estimation (Human)
1. Review available tasks from `sprint-management/tasks-current.md`
2. Assign traditional story points (1,2,3,5,8)
3. Assign AI-adjusted story points based on task category
4. Log task assignment:
```bash
echo "$(date -Iseconds),TASK_ASSIGNED,TASK-001,5,3,Category-A-Pure-Cognitive" >> sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv
```

### STEP 3: AI Handoff (Human to AI)
1. Create role context file with task details
2. Log handoff completion:
```bash
echo "$(date -Iseconds),AI_HANDOFF,TASK-001,,," >> sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv
```

### STEP 4: AI Execution Phase (Codex - 100% Code Generation)
- AI logs work start when beginning task execution
- AI creates completion log with deliverables
- AI commits code/documentation with descriptive messages
- **LOC Generation**: All code creation happens here

### STEP 5: Multi-AI Review Process
#### STEP 5A: Codex Self-Review & Testing
- Codex reviews own code and generates tests
- Commits test code and any corrections

#### STEP 5B: External AI Review (Claude/ChatGPT/Qwen)
- Human initiates review process with other AI models
- Reviewers validate code quality, architecture, security
- Log review stages:
```bash
echo "$(date -Iseconds),AI_REVIEW_START,TASK-001,,,CLAUDE-REVIEW" >> sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv
echo "$(date -Iseconds),AI_REVIEW_COMPLETE,TASK-001,,,REVIEW-PASSED" >> sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv
```

### STEP 6: Human Validation (Human)
```bash
# Log validation start
echo "$(date -Iseconds),VALIDATION_START,TASK-001,,," >> sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv

# After review completion
echo "$(date -Iseconds),TASK_COMPLETE,TASK-001,,,STATUS-ACCEPTED" >> sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv
```

## Lines of Code Tracking Protocol

### Daily LOC Measurement Commands
```bash
# Overall LOC changes
git diff --stat $(cat sprint-management/logs/velocity-study/git-baseline-$(date +%Y-%m-%d).txt) | tee -a sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log

# Category breakdown
echo "=== Implementation Code ===" >> sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log
git diff --stat $(cat sprint-management/logs/velocity-study/git-baseline-$(date +%Y-%m-%d).txt) -- "*.ts" "*.js" "*.py" >> sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log

echo "=== Test Code ===" >> sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log
git diff --stat $(cat sprint-management/logs/velocity-study/git-baseline-$(date +%Y-%m-%d).txt) -- "*test*" "*spec*" "test/*" >> sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log

echo "=== Configuration/Documentation ===" >> sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log
git diff --stat $(cat sprint-management/logs/velocity-study/git-baseline-$(date +%Y-%m-%d).txt) -- "*.md" "*.json" "*.yaml" "*.yml" >> sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log
```

### Three-Stage LOC Classification
1. **Created Lines**: Raw Codex code generation (from git diff)
2. **Tested Lines**: Lines with corresponding test coverage (analyze test files)
3. **Reviewed Lines**: Lines that passed multi-AI review process (final committed state)

## Data Collection Framework

### Primary Metrics
- Story Points per Wall-Clock Hour by category
- Lines of Code per Hour (total and by type)
- Human coordination time vs. AI execution time
- Multi-AI review efficiency (review time per line)
- Quality correlation between review stages

### Advanced LOC Analysis
- Algorithmic code vs. boilerplate generation rates
- Test coverage generation velocity
- Review cycle impact on code regeneration
- Consensus rates between AI reviewers

## End-of-Week Analysis Protocol

### Extract Timing Data
1. Parse CSV logs to calculate phase durations
2. Cross-reference with git commit timestamps
3. Analyze LOC generation patterns by task category
4. Calculate productivity ratios (LOC/hour, Story Points/hour)

### Calculate Key Metrics
- **Velocity Metrics**: Story Points and LOC per wall-clock hour
- **Quality Metrics**: Review pass rates, test coverage ratios
- **Efficiency Metrics**: Human coordination overhead vs. AI execution time
- **Consistency Metrics**: AI reviewer agreement rates

### Generate Report
Document findings in `sprint-management/analysis/velocity-study-week1-results.md`

### Process Improvement Curve Analysis
**Added based on lessons learned from 40K LOC initial development experience:**

1. **Issues Found per KLOC Over Time**
   - Track review findings density across weekly cycles
   - Calculate defect discovery rate trend (should decrease as guardrails improve)
   - Measure quality improvement trajectory

2. **Review Finding Actionability Rate**
   - Percentage of review findings that become implemented improvements
   - Track conversion rate from review analysis to sprint backlog items
   - Measure review process effectiveness vs. activity theater

3. **Process Enhancement Discoveries**
   - Document tooling improvements identified through reviews (e.g., knip integration)
   - Track systematic guardrail enhancements derived from review findings
   - Measure compound productivity gains from process improvements

4. **Technical Debt Reduction Trajectory**
   - Compare technical debt discovery rate between weeks
   - Measure defect escape rate (issues found after multi-AI review completion)
   - Validate that v3 process reduces technical debt generation vs. initial code burst approach

**Improvement Curve Success Indicators:**
- Decreasing issues per KLOC over time
- Sustained high actionability rate (>60% of findings become implemented improvements)
- Regular process enhancement discoveries leading to systematic improvements
- Measurable reduction in technical debt accumulation

## Success Criteria
- Minimum 15 completed tasks across categories
- LOC generation data for each task category
- Multi-AI review effectiveness measurements
- Quantified AI development productivity baseline
- Story point calibration recommendations for 100% AI development

## Industry Comparison Framework
- Traditional developer productivity: ~10-50 LOC/day (varies by complexity)
- Traditional story point velocity: 2-8 points/day per developer
- AI-generated code quality vs. human-written code review cycles

## Measurement Limitations & Acknowledging Approximation
- LOC metrics favor verbose solutions over elegant ones
- Review quality depends on AI model capabilities and prompting
- Environmental constraints may artificially limit AI productivity
- Single-week sample size provides directional rather than definitive data
- Human coordination overhead varies with familiarity

**Protocol Philosophy**: Provides structured approximation of AI development productivity within rational measurement constraints, enabling data-driven iteration of development processes.

## Implementation Notes
- Maintains existing sprint-management workflow integration
- Adds LOC tracking without significant overhead
- Enables comparison between different AI models as development agents
- Creates baseline for future AI development process optimization

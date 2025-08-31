# Daily Velocity Study Template v1.1 - [DATE]

## Copy and customize this template for each day of the study

### Pre-Session Setup
```bash
# 1. Initialize today's CSV log file
echo "timestamp,event_type,task_id,story_points_traditional,story_points_ai_adjusted,notes" > sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv

# 2. Initialize LOC tracking
touch sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log

# 3. Verify git branch and status
git branch --show-current
git status
```

### Daily Protocol Execution

#### STEP 1: Session Start
```bash
# Log session start
echo "$(date -Iseconds),SESSION_START,,,," >> sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv

# Record git baseline for LOC measurement
git rev-parse HEAD > sprint-management/logs/velocity-study/git-baseline-$(date +%Y-%m-%d).txt
```

#### STEP 2: Task Selection
**Task Selected**: [Fill in task ID/description]
**Category**: [A-Cognitive / B-Environmental / C-Coordination]
**Traditional Story Points**: [1,2,3,5,8]
**AI-Adjusted Story Points**: [1,2,3,5,8]

```bash
# Example - customize with your actual values:
echo "$(date -Iseconds),TASK_ASSIGNED,TASK-001,5,3,Category-A-Documentation-Analysis" >> sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv
```

#### STEP 3: AI Handoff
```bash
# Run this when you hand off the task to AI (Codex)
echo "$(date -Iseconds),AI_HANDOFF,TASK-001,,," >> sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv
```

#### STEP 4: AI Execution (Codex - 100% Code Generation)
[Codex handles implementation, creates completion logs, commits code]

#### STEP 5A: Codex Self-Review & Testing
[Codex reviews own work, generates tests, commits improvements]

#### STEP 5B: Multi-AI Review Process
```bash
# Log external AI review start (Claude/ChatGPT/Qwen)
echo "$(date -Iseconds),AI_REVIEW_START,TASK-001,,,CLAUDE-REVIEW" >> sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv

# Log review completion
echo "$(date -Iseconds),AI_REVIEW_COMPLETE,TASK-001,,,REVIEW-PASSED" >> sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv
```

#### STEP 6: Human Validation
```bash
# Log validation start
echo "$(date -Iseconds),VALIDATION_START,TASK-001,,," >> sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv

# Log task completion
echo "$(date -Iseconds),TASK_COMPLETE,TASK-001,,,STATUS-ACCEPTED" >> sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv
```

### End-of-Day LOC Measurement

```bash
# Overall LOC changes for the day
git diff --stat $(cat sprint-management/logs/velocity-study/git-baseline-$(date +%Y-%m-%d).txt) | tee -a sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log

# Category breakdown
echo "=== Implementation Code ===" >> sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log
git diff --stat $(cat sprint-management/logs/velocity-study/git-baseline-$(date +%Y-%m-%d).txt) -- "*.ts" "*.js" "*.py" >> sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log

echo "=== Test Code ===" >> sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log
git diff --stat $(cat sprint-management/logs/velocity-study/git-baseline-$(date +%Y-%m-%d).txt) -- "*test*" "*spec*" "test/*" >> sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log

echo "=== Configuration/Documentation ===" >> sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log
git diff --stat $(cat sprint-management/logs/velocity-study/git-baseline-$(date +%Y-%m-%d).txt) -- "*.md" "*.json" "*.yaml" "*.yml" >> sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log
```

### Daily Summary
**Tasks Completed**: [Number]
**Categories Covered**: [A/B/C distribution]
**Lines of Code Generated**: [From LOC log analysis]
**Code Types**: [Implementation/Test/Config distribution]
**Multi-AI Review Cycles**: [Number of review iterations]
**Issues/Blockers**: [Any problems encountered]
**Productivity Notes**: [Observations about velocity, code quality, review effectiveness]

### Checklist
- [ ] CSV log file initialized
- [ ] Git baseline recorded
- [ ] Session start logged
- [ ] All tasks properly classified and estimated
- [ ] AI handoffs logged
- [ ] Multi-AI review stages captured
- [ ] Human validation times captured
- [ ] Task completions logged with status
- [ ] End-of-day LOC measurement completed
- [ ] Daily summary completed

## Quick Reference Commands

**View today's activity log:**
```bash
cat sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv
```

**View today's LOC changes:**
```bash
cat sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log
```

**Check current git status:**
```bash
git log --oneline -5
git diff --stat HEAD~1
```

**Backup today's data:**
```bash
cp sprint-management/logs/velocity-study/study-log-$(date +%Y-%m-%d).csv sprint-management/analysis/velocity-data/
cp sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log sprint-management/analysis/velocity-data/
```

## LOC Analysis Quick Stats
```bash
# Count total insertions for the day
grep "insertions" sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log | awk '{sum+=$4} END {print "Total lines created:", sum}'

# Show breakdown by file type
echo "Implementation code changes:"
sed -n '/=== Implementation Code ===/,/=== Test Code ===/p' sprint-management/logs/velocity-study/loc-$(date +%Y-%m-%d).log | grep insertions
```

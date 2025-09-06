# Review Process 1.0: Quality Engineering Workflow

## 🎯 Purpose
Systematic weekly quality reviews using Review-Prompt-Lib to establish baseline quality metrics and prevent backlog chaos through fingerprint deduplication.

## ⏰ Execution Schedule
**Weekly Quality Sweep**: Every Friday at 3 PM  
**Duration**: 2-3 hours for comprehensive 8-domain review  
**Prerequisites**: Clean working tree, no urgent production issues  

---

## 🔄 **GIT WORKFLOW INTEGRATION**

Review-Prompt-Lib requires systematic git synchronization to ensure evidence files and process documentation are available across all branches.

### **Framework Synchronization Scripts**

#### **Main Branch Updates** (Process Evolution)
```bash
# When updating process framework on main branch
./push-sprint-management-to-main.sh
```

#### **Feature Branch Sync** (Before Any Work)
```bash
# Mandatory before sprint work or Codex CLI usage
./sprint-management/scripts/sync-framework-to-branch.sh
```

### **Why Complete Directory Sync Matters**
- **Evidence Files**: Historical scan results inform systematic analysis
- **Process Documentation**: Latest templates and procedures available
- **Domain Evolution**: Updated review prompts and severity criteria
- **Script Dependencies**: Executable permissions and latest automation

**Never Cherry-Pick Files**: Always sync complete sprint-management directory to prevent missing artifacts that can lead to incomplete analysis.

---

## 📋 PROCESS 1.0 CHECKLIST

### **Phase 1: Environment Preparation** ⏱️ 10 minutes

#### **1.1 System Validation**
- [ ] Navigate to review-prompt-lib directory
```bash
cd /Users/kevinbrown/MCP-ocs/sprint-management/review-prompt-lib
```

- [ ] Verify all scripts are executable
```bash
./scripts/set-executable.sh
```

- [ ] Test domain integrity (all 8 domains)
```bash
./scripts/test-all-domains.sh
```
**Expected**: ✅ All 8 domains pass validation

#### **1.2 Repository State Check**
- [ ] Confirm clean working directory
```bash
cd /Users/kevinbrown/MCP-ocs && git status
```
**Expected**: No uncommitted code changes that could affect review

- [ ] Verify on main/develop branch (not feature branch)
- [ ] Pull latest changes if working with team

---

### **Phase 2: Domain Review Execution** ⏱️ 90-120 minutes

#### **2.1 Core Domain Reviews (Priority Order)**

**P0 Critical Domains** (45 min):
- [ ] **async-correctness** (P0 - Memory leaks, race conditions)
```bash
./scripts/run-weekly-sweep.sh async-correctness --llm=codex
```

- [ ] **trust-boundaries** (P0 - Security vulnerabilities)  
```bash
./scripts/run-weekly-sweep.sh trust-boundaries --llm=codex
```

- [ ] **security-patterns** (P0 - Cryptographic issues)
```bash
./scripts/run-weekly-sweep.sh security-patterns --llm=codex
```

**P1 High-Impact Domains** (45 min):
- [ ] **interface-hygiene** (P1 - Type safety issues)
```bash
./scripts/run-weekly-sweep.sh interface-hygiene --llm=codex
```

- [ ] **exhaustiveness-checking** (P1 - State machine gaps)
```bash
./scripts/run-weekly-sweep.sh exhaustiveness-checking --llm=codex
```

- [ ] **api-contracts** (P1 - API validation issues)
```bash
./scripts/run-weekly-sweep.sh api-contracts --llm=codex
```

**P2 Quality Domains** (30 min):
- [ ] **error-taxonomy** (P2 - Error handling consistency)
```bash
./scripts/run-weekly-sweep.sh error-taxonomy --llm=codex
```

- [ ] **date-time-safety** (P2 - Date arithmetic safety)
```bash
./scripts/run-weekly-sweep.sh date-time-safety --llm=codex
```

#### **2.2 Post-Domain Validation**
After each domain:
- [ ] Verify scan results file created in `domains/{domain}/historical/`
- [ ] Check for processing errors in terminal output
- [ ] Note any P0 findings for immediate escalation

---

### **Phase 3: Findings Analysis** ⏱️ 30-45 minutes

#### **3.1 P0 Critical Issue Triage**
- [ ] Scan all domains for P0 findings
```bash
grep -r '"severity": "P0"' domains/*/historical/*-$(date +%Y-%m-%d)-codex-*.json
```

- [ ] **IMMEDIATE ACTION REQUIRED** for P0 findings:
  - [ ] Document P0 issues in `P0_CRITICAL_FINDINGS.md`
  - [ ] Create immediate backlog tasks (within 24 hours)
  - [ ] Notify team lead of critical quality issues

#### **3.2 Finding Registry Analysis**
- [ ] Review updated finding registries for trends
```bash
# Check new vs existing findings
find domains/*/historical/finding-registry.json -exec grep -l '"total_findings_ever": [1-9]' {} \;
```

- [ ] Identify regressed issues (previously resolved, now back)
- [ ] Note quality improvements (resolved findings)

#### **3.3 Cross-Domain Quality Assessment**  
- [ ] Generate quality trend summary
- [ ] Document patterns across domains
- [ ] Identify systemic issues affecting multiple domains

---

### **Phase 4: Human Review & Sprint Integration** ⏱️ 30 minutes

#### **4.1 Strategic Finding Review**
- [ ] **Human Judgment Required**: Review P0/P1 findings for:
  - [ ] False positives (LLM incorrect)
  - [ ] Acceptable technical debt (document decision)
  - [ ] Immediate vs sprint-planned fixes

#### **4.2 Sprint Backlog Integration**
- [ ] Create backlog tasks for validated findings
- [ ] Estimate effort for quality improvements  
- [ ] Prioritize findings for upcoming sprint cycles
- [ ] Update sprint planning with quality intelligence

#### **4.3 Documentation Updates**
- [ ] Update `WEEKLY_QUALITY_REPORT.md` with:
  - [ ] Total findings by domain and severity
  - [ ] Week-over-week trend analysis
  - [ ] Key quality improvements achieved
  - [ ] Recommended actions for next sprint

---

### **Phase 5: Process Validation & Archive** ⏱️ 15 minutes

#### **5.1 Quality Control**
- [ ] Verify all 8 domains completed successfully
- [ ] Check scan result files are valid JSON
- [ ] Confirm finding registries updated correctly

#### **5.2 Archive Management**
- [ ] Verify scan results properly named with date and LLM
- [ ] Confirm no duplicate or conflicting files
- [ ] Archive weekly summary if this is end of month

#### **5.3 Process Improvement**
- [ ] Note any process friction or automation failures
- [ ] Document improvements for next Review Process iteration
- [ ] Update estimated timings based on actual execution

---

## 🚨 **CRITICAL DECISION POINTS**

### **Abort Conditions**
- [ ] **STOP PROCESS** if more than 20 P0 findings across all domains
  - **Action**: Focus on P0 remediation before continuing
  
- [ ] **PAUSE FOR ANALYSIS** if new domain shows >50% regression
  - **Action**: Investigate root cause before proceeding

### **Escalation Triggers**
- [ ] **Immediate escalation** for security-related P0 findings
- [ ] **Team notification** for >10 P0 findings in single domain
- [ ] **Process review** if quality trends consistently negative

---

## ✅ **SUCCESS CRITERIA**

### **Process Completion**
- [ ] All 8 domains reviewed with Codex CLI
- [ ] P0 findings documented and triaged
- [ ] Finding registries updated with historical tracking
- [ ] Sprint backlog updated with quality tasks
- [ ] Weekly quality report generated

### **Quality Metrics**
- [ ] **Baseline established** (first run) or **trends tracked** (subsequent)
- [ ] **No duplicate backlog tasks** created (fingerprint deduplication working)
- [ ] **Systematic coverage** achieved across all domains

### **Team Integration**
- [ ] Quality findings integrated into sprint planning
- [ ] P0 issues on immediate remediation track
- [ ] Quality trends visible to stakeholders

---

## 🔄 **NEXT ITERATION IMPROVEMENTS**

After completing Review Process 1.0:
- [ ] Time each phase for better planning
- [ ] Document any domain-specific challenges
- [ ] Identify automation opportunities
- [ ] Refine LLM selection per domain based on results

---

**Process Owner**: Engineering Team Lead  
**Review Frequency**: Weekly (Fridays)  
**Process Version**: 1.0  
**Last Updated**: 2025-09-05  
**Next Review**: After 4 weekly executions

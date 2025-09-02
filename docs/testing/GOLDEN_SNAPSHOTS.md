# Golden Snapshots in MCP-ocs

## What Are Golden Snapshots?
Golden snapshots (or simply "goldens") are **frozen expected outputs** of diagnostic templates.  
They represent the **known good result** for a given scenario (e.g., ingress-pending, scheduling-failures).  

Each golden is stored under `docs/golden-templates/` as a JSON file.

---

## Why Do We Use Goldens?
MCP-ocs combines tool outputs, rubrics, and templates. Small changes in logic, model variance, or template updates can alter results.  
Goldens give us a **deterministic reference point**:

- ✅ If current output matches the golden → system is stable  
- ❌ If current output differs from the golden → either a regression or a deliberate improvement (requires review)

---

## How Are Goldens Used?

### 1. Generate Golden Snapshots
Capture expected output for all templates:
```bash
# Generate goldens with dry-run (no live cluster needed)
LMSTUDIO_DRY_RUN=true npm run template:golden:snapshot

# Generate goldens with live LM Studio
export LMSTUDIO_BASE_URL=http://localhost:1234/v1
export LMSTUDIO_MODEL=ministral-8b-instruct-2410
npm run template:golden:snapshot
```

### 2. Compare Against Goldens
Validate current system against known good outputs:
```bash
# Compare current results vs goldens
npm run template:golden:compare

# Detailed comparison with diff output
npm run template:golden:compare --verbose
```

### 3. CI Integration
Goldens are part of the CI pipeline:
```bash
# Full CI validation (includes golden comparison)
npm run ci:templates
```

---

## Golden File Structure

Each golden snapshot contains:

```json
{
  "target": "ingress-pending",
  "templateVersion": "1.0.0",
  "evidence": {
    "completeness": 1.0,
    "required": ["routerPods", "schedulingEvents", "controllerStatus"],
    "threshold": 0.9
  },
  "rubrics": {
    "triage": {
      "id": "triage-priority.v1",
      "label": "P1",
      "score": 0.84
    },
    "confidence": {
      "id": "evidence-confidence.v1", 
      "label": "High"
    },
    "safety": {
      "id": "remediation-safety.v1",
      "allowAuto": true
    },
    "slo": {
      "id": "slo-impact.v1",
      "label": "CRITICAL"
    }
  },
  "determinism": {
    "modelName": "ministral-8b-instruct-2410",
    "seed": 42,
    "temperature": 0
  }
}
```

---

## Golden Validation Process

### What Gets Compared?
The golden comparator validates:

- ✅ **Rubric Labels**: P1/P2/P3, High/Medium/Low, CRITICAL/HIGH/MEDIUM/LOW
- ✅ **Evidence Completeness**: Required evidence present vs missing
- ✅ **Safety Gates**: allowAuto decisions and guard evaluations
- ✅ **Template Steps**: Deterministic execution path
- ✅ **Model Determinism**: Same model/seed produces same results

### What Doesn't Get Compared?
- ❌ **Timestamps** - Execution times vary
- ❌ **Raw Tool Output** - Cluster state changes over time
- ❌ **Performance Metrics** - Timing varies by environment
- ❌ **Log Messages** - Formatting may vary

---

## Types of Golden Tests

### 1. Positive Goldens (Normal Cases)
```
docs/golden-templates/
├── ingress-pending-v1.golden.json     # Normal ingress issue
├── crashloopbackoff-v1.golden.json    # Standard pod failure
├── route-5xx-v1.golden.json           # Routing problem
└── pvc-binding-v1.golden.json         # Storage binding issue
```

### 2. Negative Goldens (Failure Cases) 
```
docs/golden-templates-negative/
├── evidence-incomplete.golden.json     # Missing evidence test
├── confidence-low.golden.json          # Low confidence scenario
└── safety-blocked.golden.json          # Auto-execution blocked
```

### 3. Infrastructure Goldens (Future)
```
docs/golden-templates/
├── scheduling-failures-v1.golden.json  # Node scheduling issues
├── zone-conflict-v1.golden.json        # Zone distribution problems
└── capacity-pressure-v1.golden.json    # Resource constraints
```

---

## Working with Goldens

### When to Update Goldens
**Update goldens when:**
- ✅ **Intentional rubric improvements** (better scoring logic)
- ✅ **Template enhancements** (new evidence requirements)
- ✅ **Model upgrades** (switching to better LLM)
- ✅ **New template versions** (v1.0 → v1.1)

**Don't update goldens for:**
- ❌ **Debugging convenience** (mask real regressions)
- ❌ **Flaky test fixes** (address root cause instead)
- ❌ **Environmental differences** (CI vs local)

### Golden Update Process
```bash
# 1. Investigate differences first
npm run template:golden:compare --diff

# 2. If changes are intentional, regenerate
LMSTUDIO_DRY_RUN=true npm run template:golden:snapshot

# 3. Commit updated goldens with clear message
git add docs/golden-templates/
git commit -m "feat: update goldens for improved triage scoring"
```

### Debugging Golden Failures
```bash
# See detailed comparison
npm run template:golden:compare --verbose --diff

# Generate fresh golden to compare
LMSTUDIO_DRY_RUN=true npm run template:golden:snapshot --target=ingress-pending

# Compare specific templates
npm run template:golden:compare --target=ingress-pending
```

---

## Golden Best Practices

### 1. Deterministic Execution
- ✅ **Use dry-run mode** for consistent results
- ✅ **Fixed model settings** (temperature=0, seed=42)
- ✅ **Stable test data** (fabricated execution, not live cluster)

### 2. Meaningful Comparisons
- ✅ **Focus on business logic** (rubric labels, evidence quality)
- ✅ **Abstract away volatility** (timestamps, raw outputs)
- ✅ **Clear failure messages** (what changed and why it matters)

### 3. Maintenance
- ✅ **Regular golden validation** in CI
- ✅ **Clear update process** when changes are intentional
- ✅ **Version golden files** with template versions

---

## Integration with Testing Strategy

### CI Pipeline Integration
```bash
# Part of template hygiene testing
npm run ci:templates
├── npm run template:hygiene:test:all    # Dry-run validation
├── npm run template:golden:compare      # Golden comparison
└── npm run rubrics:coverage:check       # Coverage validation
```

### Cross-Model Validation
```bash
# Validate goldens across different models
export LMSTUDIO_MODELS="ministral-8b,llama3-8b"
npm run template:golden:cross-validate
```

### Performance Baseline
```bash
# Generate performance baselines with goldens
PERF=true npm run template:golden:snapshot
npm run template:golden:compare --perf
```

---

## Troubleshooting Golden Issues

### Common Problems

#### "Golden file not found"
```bash
# Generate missing golden
LMSTUDIO_DRY_RUN=true npm run template:golden:snapshot --target=<template-name>
```

#### "Rubric label mismatch" 
```bash
# Check rubric evaluation differences
npm run template:golden:compare --rubrics-only --diff
```

#### "Evidence completeness changed"
```bash
# Validate evidence collection
npm run template:hygiene:test --target=<template-name> --evidence-debug
```

#### "Model fingerprint mismatch"
```bash
# Regenerate with correct model settings
export LMSTUDIO_MODEL=ministral-8b-instruct-2410
LMSTUDIO_DRY_RUN=true npm run template:golden:snapshot
```

### Golden Recovery
```bash
# Reset all goldens to current system state
npm run template:golden:reset-all

# Backup current goldens before changes
npm run template:golden:backup
```

---

## Future Enhancements

### Planned Golden Features
- **Infrastructure template goldens** (Phase 2)
- **Multi-model golden validation** (cross-LLM consistency)
- **Performance regression detection** (golden + timing)
- **Evidence evolution tracking** (evidence contract changes)

### Advanced Golden Scenarios
- **Negative test cases** (intentional failures)
- **Edge case validation** (boundary conditions)
- **Failure mode testing** (graceful degradation)
- **Security scenario goldens** (RBAC, compliance)

---

## Golden Snapshots Summary

**Golden snapshots provide:**
- 🎯 **Deterministic validation** - Known good outputs for comparison
- 🛡️ **Regression protection** - Catch unintended changes automatically  
- 📊 **Quality assurance** - Validate rubrics, evidence, and decision logic
- 🔄 **CI integration** - Automated validation in deployment pipeline
- 📈 **Evolution tracking** - Document intentional improvements over time

**Key principle:** Goldens capture the **business logic correctness** (triage decisions, confidence levels, safety gates) while abstracting away **environmental volatility** (timestamps, raw cluster data, performance variations).

This enables **confident development** with **automatic regression detection** for the sophisticated rubrics and template evaluation system.

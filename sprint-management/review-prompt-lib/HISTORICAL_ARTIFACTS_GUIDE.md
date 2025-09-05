# Historical Artifacts Usage Guide

## 📁 /historical/ Directory Structure & Purpose

The `/historical/` directory in each domain serves as the **deduplication engine** and **trend tracking system** for quality findings.

### Current Structure
```
domains/{domain-name}/historical/
├── finding-registry.json          # Master deduplication registry
├── {date}-{llm}-scan-results.json # Daily scan results by LLM
└── {date}-{llm}-chunked-{N}-scan-results.json # Chunked scan results
```

## 🎯 Artifact Purposes

### 1. `finding-registry.json` - The Master Registry
**Purpose**: Prevents backlog chaos through fingerprint deduplication

**Structure**:
```json
{
  "domain": "async-correctness",
  "version": "1.0",
  "created": "2025-09-05T00:00:00Z",
  "last_updated": "2025-09-05T00:00:00Z",
  
  "findings": [
    {
      "fingerprint": "async-correctness:src/auth.ts:45:unawaited-promise:a1b2c3d4",
      "first_seen": "2025-09-05",
      "last_seen": "2025-09-05", 
      "status": "active|resolved|regressed",
      "weeks_seen": 3,
      "scan_history": ["2025-09-05", "2025-08-29", "2025-08-22"],
      "backlog_task_id": "ASYNC-001",
      "finding_data": { /* Latest scan data */ }
    }
  ],
  
  "statistics": {
    "total_findings_ever": 15,
    "active_findings": 8,
    "resolved_findings": 6,
    "regressed_findings": 1
  }
}
```

**Lifecycle**:
- **Empty on first run** - Ready to receive findings
- **Grows over time** - Accumulates historical fingerprints
- **Tracks status changes** - NEW → ACTIVE → RESOLVED → REGRESSED
- **Prevents duplicates** - One fingerprint = one backlog task forever

### 2. `{date}-{llm}-scan-results.json` - Daily Scan Results
**Purpose**: Raw LLM output with metadata for processing

**Example**: `2025-09-05-qwen-scan-results.json`
```json
{
  "scan_metadata": {
    "domain": "async-correctness",
    "date": "2025-09-05",
    "llm": "qwen",
    "chunked": false,
    "files_scanned": 55,
    "prompt_version": "v1.0"
  },
  "findings": [
    {
      "fingerprint": "async-correctness:src/index.ts:54:unawaited-promise",
      "severity": "P0",
      "category": "unawaited-promise",
      "file": "src/index.ts",
      "line": 54,
      "description": "Unawaited promise in MCP server request handler",
      "evidence": "/* code snippet */",
      "recommendation": "Add await: await executeTool(...)"
    }
  ]
}
```

**Retention**: 
- **Keep latest** per LLM for comparison
- **Archive old scans** weekly/monthly to prevent bloat
- **Preserve for analysis** - Compare LLM performance over time

## 🔄 Processing Workflow

### 1. Scan Execution
```bash
./run-weekly-sweep.sh async-correctness --llm=codex
# → Creates: 2025-09-05-codex-scan-results.json
```

### 2. Fingerprint Processing  
```bash
node process-findings.cjs async-correctness 2025-09-05-codex-scan-results.json
```

**Actions Performed**:
- **NEW findings** → Add to registry with status "active"
- **EXISTING active** → Update last_seen, increment weeks_seen  
- **MISSING from scan** → Mark as "resolved" 
- **PREVIOUSLY resolved** → Mark as "regressed" if found again

### 3. Registry Updates
The `finding-registry.json` gets updated with:
- New fingerprints for unseen issues
- Status changes (active/resolved/regressed)
- Scan history tracking
- Aggregate statistics

## 📊 Expected Archive Behavior

### Clean Separation by LLM
```
historical/
├── 2025-09-05-codex-scan-results.json      # Codex full scan
├── 2025-09-05-qwen-chunked-5-scan-results.json  # Qwen chunked
├── 2025-09-06-codex-scan-results.json      # Next day Codex
└── finding-registry.json                   # Unified registry
```

### Archive Management (Future Enhancement)
```
historical/
├── current/
│   ├── latest-codex-results.json          # Most recent per LLM
│   └── latest-qwen-results.json
├── archive/
│   ├── 2025-09/                          # Monthly archives
│   │   ├── week-36-summary.json
│   │   └── daily/
│   └── 2025-08/
└── finding-registry.json                  # Always current
```

## 🚨 Current State Assessment

### ✅ What's Working
- **Registry Structure** - Proper empty registries in all 8 domains
- **Scan Results** - Real Qwen scan data in async-correctness domain  
- **Fingerprint Processing** - Fixed to handle partial→full fingerprint conversion
- **LLM Separation** - Clean file naming prevents conflicts

### ⚠️ What Needs Attention
- **Sample Data** - Only async-correctness has real scan results
- **Registry Processing** - Needs first real run to populate registries
- **Archive Strategy** - No cleanup mechanism yet (acceptable for v1.0)

### 🎯 Immediate Actions Needed
1. **Test Real Workflow** - Run actual scan and process findings
2. **Validate Registry Updates** - Ensure fingerprints populate correctly  
3. **Cross-LLM Testing** - Compare Codex vs Qwen on same domain

## 💡 Design Validation

The `/historical/` structure is **well-designed** for:
- ✅ **Deduplication** - Prevents backlog chaos
- ✅ **Trend Analysis** - Week-over-week quality metrics
- ✅ **LLM Comparison** - Performance analysis between models
- ✅ **Status Tracking** - Finding lifecycle management
- ✅ **Archive Organization** - Clean separation prevents mess

**Bottom Line**: The historical artifact design is solid and production-ready. It just needs real data from comprehensive baseline runs to prove the workflow.

# LLM Selection Usage Guide

## Quick Start

```bash
# Recommended: Use Codex CLI (proven reliable)
./run-weekly-sweep.sh async-correctness --llm=codex

# Alternative: Use Qwen with chunking  
./run-weekly-sweep.sh async-correctness --llm=qwen --chunk-size=5

# Compare results between LLMs
./compare-llm-results.sh async-correctness
```

## LLM Performance Characteristics

### 🏆 **Codex CLI (Recommended)**
✅ **Superior code analysis** - Specialized for code review  
✅ **Handles full codebase** - No chunking needed  
✅ **Consistent findings** - More thorough detection  
✅ **Perfect JSON format** - Reliable structured output  
✅ **No subscription costs** - Runs locally  
✅ **Proven track record** - Found 13 real P0/P1 issues in testing  

**Best for**: All domains, especially complex ones (async-correctness, exhaustiveness-checking, security-patterns)

### 🧠 **Qwen (Alternative)**
⚠️ **Requires chunking** - Struggles with large codebases  
⚠️ **May miss patterns** - Less thorough than Codex  
✅ **Good for simple domains** - Works well for date-safety, error-taxonomy  
✅ **Cross-validation** - Useful for checking Codex results  

**Best for**: Simple domains, secondary validation, when Codex unavailable

## Usage Examples

### Basic Usage
```bash
# Default: Codex CLI, full scan
./run-weekly-sweep.sh interface-hygiene

# Explicit Codex
./run-weekly-sweep.sh interface-hygiene --llm=codex

# Qwen with recommended chunking
./run-weekly-sweep.sh interface-hygiene --llm=qwen --chunk-size=5

# Dry run to test setup
./run-weekly-sweep.sh interface-hygiene --llm=codex --dry-run
```

### Cross-Validation Workflow
```bash
# Run both LLMs on same domain
./run-weekly-sweep.sh async-correctness --llm=codex
./run-weekly-sweep.sh async-correctness --llm=qwen --chunk-size=5

# Compare results
./compare-llm-results.sh async-correctness

# Review findings and choose primary LLM
```

### Production Workflow
```bash
# Comprehensive baseline with Codex (recommended)
./run-weekly-sweep.sh async-correctness --llm=codex
./run-weekly-sweep.sh interface-hygiene --llm=codex
./run-weekly-sweep.sh exhaustiveness-checking --llm=codex
./run-weekly-sweep.sh trust-boundaries --llm=codex
./run-weekly-sweep.sh security-patterns --llm=codex
./run-weekly-sweep.sh api-contracts --llm=codex
./run-weekly-sweep.sh error-taxonomy --llm=codex
./run-weekly-sweep.sh date-time-safety --llm=codex
```

## File Organization

Results are automatically organized by LLM:

```
domains/async-correctness/historical/
├── 2025-09-05-codex-scan-results.json         # Full Codex scan
├── 2025-09-05-qwen-chunked-5-scan-results.json # Chunked Qwen scan
└── 2025-09-06-codex-scan-results.json         # Next day Codex scan
```

## Recommendations by Domain

### Complex Domains (Use Codex)
- **async-correctness** - Complex async pattern detection
- **exhaustiveness-checking** - State machine analysis  
- **security-patterns** - Cryptographic vulnerability detection
- **trust-boundaries** - Security boundary analysis

### Simple Domains (Either LLM)
- **date-time-safety** - Date arithmetic patterns
- **error-taxonomy** - Error handling consistency
- **api-contracts** - Interface validation
- **interface-hygiene** - Type safety patterns

## Troubleshooting

### Qwen Issues
```bash
# If Qwen struggles with full scan:
./run-weekly-sweep.sh domain-name --llm=qwen --chunk-size=3

# If still issues, reduce chunk size:
./run-weekly-sweep.sh domain-name --llm=qwen --chunk-size=1
```

### Codex Issues
```bash
# Codex should handle full scans, but if issues:
./run-weekly-sweep.sh domain-name --llm=codex --chunk-size=10
```

### General Issues
```bash
# Test domain setup:
./test-all-domains.sh

# Run in dry-run mode:
./run-weekly-sweep.sh domain-name --dry-run
```

## Performance Expectations

| Domain | Codex Performance | Qwen Performance |
|--------|-------------------|------------------|
| async-correctness | ✅ Excellent (13 findings) | ⚠️ May miss complex patterns |
| interface-hygiene | ✅ Strong type analysis | ✅ Good with chunking |
| exhaustiveness-checking | ✅ Complex state analysis | ⚠️ May miss edge cases |
| security-patterns | ✅ Crypto vulnerability detection | ⚠️ Basic pattern detection |
| trust-boundaries | ✅ Security boundary analysis | ✅ Good input validation detection |
| api-contracts | ✅ Interface analysis | ✅ Good with chunking |
| error-taxonomy | ✅ Consistent detection | ✅ Good simple pattern detection |
| date-time-safety | ✅ Reliable detection | ✅ Good simple pattern detection |

**Bottom Line**: Start with Codex for comprehensive baseline, experiment with Qwen for specific domains or cross-validation.

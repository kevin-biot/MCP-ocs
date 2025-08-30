# MCP-ocs: OpenShift Diagnostic & Triage System

MCP-ocs is a comprehensive diagnostic and triage system for OpenShift clusters, built as an MCP (Model Context Protocol) server. It provides:

1. **Structured Diagnostic Workflows** - State-machine workflows with panic detection and memory-aware execution
2. **Template-Based Triage** - Pre-defined triage templates for common OpenShift issues (ingress, crashloop, PVC)
3. **Memory-Enhanced Tool Execution** - Context-aware tool execution with automatic memory capture
4. **Rubric-Based Scoring** - Priority, confidence, and safety scoring for diagnostics
5. **Operator-First Design** - Single API surface with data bundles and hot-loading support

## Architecture Overview

### Core Components

#### 1. Sealed Core (orchestration/rubric/memory)
- **Workflow Engine**: Hierarchical state machine with panic detection and memory-guided guidance
- **Rubric Evaluators**: Priority, confidence, safety scoring for diagnostics
- **Memory System**: Vector and JSON fallback storage with automatic tool execution tracking
- **Template Engine**: Hot-loaded diagnostic templates (JSON/YAML data bundles)

#### 2. Data-Only Bundles
- **Templates**: JSON files defining triage workflows (e.g., `scheduling-failures.json`)
- **Dictionaries**: JSON/YAML data files for vocabulary and aliases (not yet implemented)
- **Rubric Sets**: YAML/JSON files with scoring logic and safety guards (e.g., `triage-priority.v1.yaml`)

#### 3. Southbound MCP Tools
- **Normalized Evidence Types**: All tools return structured evidence (e.g., `billing_anomaly`, `oss_alarm`)
- **Adapters**: Tool capability descriptors for automatic filtering and validation

### API Design

MCP-ocs exposes a single northbound API surface:

```bash
# Single entry point - all tools accessible through this interface
curl -X POST http://localhost:8080/triage \
  -H "Content-Type: application/json" \
  -d '{"userInput": "Pod crashes", "bounded": true}'
```

### Data Bundle Loading

All data bundles are loaded from:
- `src/lib/templates/templates/` (JSON templates)
- `src/lib/rubrics/core/` (YAML rubrics)
- `src/lib/rubrics/diagnostic/` (YAML rubrics)

### Tool Registration

Tools are registered in a unified registry:
```ts
// All tools automatically available via MCP protocol
const toolRegistry = new UnifiedToolRegistry();
toolRegistry.registerSuite(new DiagnosticToolsV2(openshiftClient, memory));
toolRegistry.registerSuite(new ReadOpsTools(openshiftClient, memory));
```

## Key Features

### Sealed Core Architecture
- Single northbound API `/triage` endpoint
- All tool execution routed through unified workflow engine  
- Memory-aware sequential thinking orchestrator with plan persistence
- Panic detection and state transition enforcement

### Data Bundle Support
- Templates hot-loaded from `src/lib/templates/templates/`
- Rubrics in `src/lib/rubrics/core/` and `src/lib/rubrics/diagnostic/`
- JSON/YAML configuration files for all domain logic
- Version pinning and replay capability

### Memory System
- ChromaDB + JSON fallback for persistent storage
- Automatic tool execution memory capture with context
- Operational and conversation memory management

### Tool Normalization
- All MCP tools return standardized evidence types
- Capability descriptors for automatic filtering
- Memory-aware tool execution with automatic context capture

### LLM Boundaries
- LLM only calls Core → LLM, never tools or internal state
- All tool execution routed through the workflow engine
- Sequential thinking orchestrator provides structured guidance

## Risk Assessment

### Pass/Fail Criteria

**PASS**: 
- Public surface reduced to single `/triage` API
- Templates/Dictionaries/RubricSets are data-only and hot-loadable  
- MCP adapters return normalized evidence (not vendor-specific blobs)
- LLM only receives structured evidence post-evaluation
- Version pinning + replay path available

**FAIL**:
- Orchestration/rubric logic tangled with user-facing tools
- Rubric logic in telco-editable artifacts  
- Adapters hard-code vendor schemas into core
- No single API surface without breaking most code

## Current Implementation Status

### ✅ Core Logic Ready
- Workflow engine with panic detection (ADR-005)
- Memory system with vector storage (ADR-003)  
- Tool registry with namespace management (ADR-004)
- Template engine and evidence validation

### ⚠️ Data Bundle Loading
- Templates hot-loaded from JSON files (data-only)
- Rubrics in YAML format (data-only)  
- Dictionary normalization not yet implemented

### ⚠️ Memory System
- ChromaDB integration with JSON fallback
- Tool execution tracking and context capture
- Operational memory with version pinning capability

### ⚠️ LLM Safety
- Sequential thinking orchestrator for structured guidance
- LLM-only receives structured evidence (not raw tool output)
- Panic detection prevents destructive operations

## Testing & Validation

```bash
# Run all tests
npm test

# Validate configuration
npm run validate-config

# Test memory system
npm run test-memory

# Run health checks
npm run health-check
```

## Deployment Considerations

### Production Hardening
- Configure ChromaDB for persistence in production
- Set `MCP_CHROMA_HOST` and `MCP_CHROMA_PORT`  
- Enable graceful shutdown with SIGTERM handling
- Set appropriate timeout limits (`OC_TIMEOUT_MS`, `SEQ_TIMEOUT_MS`)

### Security
- All tool arguments sanitized and validated
- Circuit breaker for unreliable OpenShift operations  
- Memory sanitization to prevent log pollution
- Secure environment variable handling

### Performance
- Concurrent request deduplication  
- Memory caching for cluster info
- Template engine with boundary enforcement
- Tool execution timeout limits

## Risk Score: Low

### IP Leakage Risk
Low - All configuration and logic is in data files that can be controlled at deployment time. The system can be packaged with minimal internal exposure.

### Security
Low - All tool execution is validated and sanitized. The system prevents direct LLM access to internal state.

### Reliability
Medium - Memory system can fall back to JSON storage when ChromaDB is unavailable.

## Packaging Ready

MCP-ocs can be packaged with:
1. **Single API endpoint** - `/triage` only  
2. **All data bundles in JSON/YAML files**
3. **Hot-loadable rubrics and templates**
4. **Normalized tool outputs**
5. **LLM-safe architecture**

This provides a complete, operator-ready system with clean separation between logic and data.
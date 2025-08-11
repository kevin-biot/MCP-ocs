# ADR-007: Automatic Tool Memory Integration for Operational Intelligence

**Date:** 2025-08-11  
**Status:** Accepted  
**Context:** RED ZONE operational diagnostics and pattern recognition  

## Summary

Implement automatic memory capture and tagging for every tool execution to build operational intelligence for future diagnostic sessions. This addresses the critical need for engineers to have contextual knowledge during incident response.

## Problem Statement

Engineers responding to incidents in production ("RED ZONE") lack context from previous similar situations. Current diagnostic tools execute in isolation without learning from past executions or building knowledge for future incidents.

**Key Pain Points:**
- No memory of previous diagnostic sessions
- Pattern recognition happens manually each time
- Critical insights (like "student04 = CI/CD artifacts, not broken apps") must be rediscovered
- Engineers waste time re-analyzing known patterns

## Decision

Implement an **AutoMemorySystem** that automatically captures, tags, and stores every tool execution for future pattern recognition and contextual retrieval.

### Core Components

1. **AutoMemorySystem Class**
   - Captures every tool execution with smart tagging
   - Retrieves relevant context before tool execution
   - Builds operational knowledge base automatically

2. **Smart Tagging Framework**
   - Pattern recognition (student04 = CI/CD artifacts)
   - Context extraction (namespace, resource type, severity)
   - RED ZONE relevance tagging
   - Engineer guidance generation

3. **Automatic Integration**
   - Zero manual effort - every tool call captured
   - Context retrieval before execution
   - Structured memory storage (JSON + ChromaDB ready)

## Implementation

### Automatic Capture
```typescript
// Every tool execution automatically captured
await autoMemory.captureToolExecution({
  toolName: name,
  arguments: args,
  result: result,
  sessionId,
  timestamp: startTime,
  duration,
  success,
  error
});
```

### Context Retrieval
```typescript
// Before execution, check for relevant past context
const relevantContext = await autoMemory.retrieveRelevantContext(name, args);
if (relevantContext.length > 0) {
  console.error(`🧠 Found ${relevantContext.length} relevant past experiences`);
}
```

### Smart Tagging Examples
- `student04_pattern` + `ci_cd_artifacts` + `build_pipeline`
- `cluster_degraded` + `high_priority` + `red_zone_critical`  
- `pods_succeeded_not_ready` + `build_artifacts_pattern`

## Benefits

### For Engineers in RED ZONE
- **Context First**: "Found 3 relevant past experiences" before diagnostics
- **Pattern Recognition**: System learns "PVC pending in student04 ≠ infrastructure problem"
- **Correct Knowledge**: Prioritizes accuracy over speed for critical decisions
- **No Manual Effort**: Automatic learning from every interaction

### For Operations Teams
- **Institutional Knowledge**: Previous solutions preserved automatically
- **Pattern Database**: Common issues and resolutions catalogued
- **Training Aid**: New engineers learn from past diagnostic sessions
- **Trend Analysis**: Operational patterns emerge over time

## Technical Architecture

### Storage Backend (Hybrid)
- **JSON Files**: Immediate storage, human readable, reliable fallback
- **ChromaDB**: Vector similarity search, advanced pattern matching
- **Automatic Fallback**: If ChromaDB unavailable, JSON storage continues

### Memory Types
- **Operational Memory**: Incidents, symptoms, resolutions
- **Conversation Memory**: Tool executions, workflow tracking
- **Context Memory**: Pattern recognition, engineer insights

### Integration Points
- **Tool Execution Wrapper**: Automatic capture without tool modification
- **MCP Protocol**: Seamless integration with existing toolchain
- **Search Integration**: Context retrieval built into execution flow

## Examples

### Pattern Recognition in Action
```
Engineer: "Check student04 namespace"
System: "🧠 Found 3 relevant past experiences with student04"
System: "⚠️ Pattern: student04 contains CI/CD build artifacts, not broken applications"
System: "📋 Previous diagnosis: Pods show 'Succeeded' but never ready - this is normal behavior"
```

### Automatic Learning
```
Tool: oc_diagnostic_namespace_health
Args: { namespace: "student04" }
Tags Generated: ["student04_pattern", "ci_cd_artifacts", "build_pipeline", "pods_succeeded_not_ready"]
Stored Context: "CI/CD pipeline pods complete successfully but never become ready - not an infrastructure issue"
```

## Future Enhancements

### Phase 2: Advanced Pattern Recognition
- **Machine Learning**: Automated pattern detection in diagnostic flows
- **Anomaly Detection**: Identify unusual patterns requiring investigation
- **Predictive Analysis**: Suggest preventive actions based on trends

### Phase 3: Collaborative Intelligence
- **Cross-Team Learning**: Share patterns across multiple environments
- **Expert System**: Capture senior engineer decision-making patterns
- **Training Mode**: Guide new engineers through diagnostic workflows

## Implementation Status

- ✅ **AutoMemorySystem implemented**
- ✅ **Smart tagging framework complete**  
- ✅ **JSON storage backend functional**
- ✅ **MCP integration complete**
- 🔄 **ChromaDB integration ready for implementation**
- ✅ **Tool execution wrapper deployed**

## Conclusion

The AutoMemorySystem provides automatic operational intelligence for diagnostic tools, enabling engineers to benefit from institutional knowledge during critical incidents. The system learns from every tool execution without manual effort, building a comprehensive knowledge base for pattern recognition and contextual decision-making.

This represents a fundamental shift from isolated tool executions to context-aware operational intelligence, directly addressing the needs of engineers working in high-pressure production environments.

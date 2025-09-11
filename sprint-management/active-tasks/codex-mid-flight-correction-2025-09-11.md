**D-009 Date-Time Violation Pattern**:
```
// This violates D-009 security hygiene:
const timestamp = Date.now(); // Direct Date API usage
const sessionId = `sess_${new Date().getTime()}`; // Banned pattern

// Fixed with established utilities:
import { nowEpoch, nowIso } from '@/utils/time';
const timestamp = nowEpoch(); // D-009 compliant timing
const sessionId = `sess_${nowEpoch()}`; // Approved pattern
const logTimestamp = nowIso(); // ISO8601 for serialization
```

### **D-009 Date-Time Safety Standards**
```typescript
// ❌ NEVER - D-009 violation
const timestamp = Date.now();
const isoTime = new Date().toISOString();

// ✅ ALWAYS - D-009 compliant
import { nowEpoch, nowIso } from '@/utils/time';

// For internal timing, IDs, numeric calculations
const startTime = nowEpoch(); // eslint override included in utility
const sessionId = `tool_exec_${nowEpoch()}`;
const elapsedMs = nowEpoch() - startTime;

// For user-facing timestamps, logs, serialization
const timestamp = nowIso(); // ISO8601 format
const logEntry = { timestamp: nowIso(), message: "Operation complete" };
```

### **Schema v2 Timestamp Requirements**
```typescript
// ✅ JSON Metrics Schema v2 compliance
interface MetricsEntry {
  toolId: string;
  opType: string;
  mode: 'json' | 'vector';
  elapsedMs: number;        // Use nowEpoch() for calculations
  errorSummary: string | null;
  cleanupCheck: boolean;
  anchors: string[];
  timestamp: string;        // Use nowIso() for serialization
  sessionId: string;        // Use nowEpoch() for unique IDs
}

// Implementation example
const startTime = nowEpoch();
// ... tool execution ...
const metricsEntry: MetricsEntry = {
  toolId: 'oc_read_pods',
  opType: 'diagnostic',
  mode: 'vector',
  elapsedMs: nowEpoch() - startTime,  // D-009 compliant timing
  errorSummary: null,
  cleanupCheck: true,
  anchors: [`logs/sprint-execution.log:${nowEpoch()}`],
  timestamp: nowIso(),                // D-009 compliant serialization
  sessionId: `tool_exec_${nowEpoch()}`
};
```

# CODEX Mid-Flight Correction - MCP Protocol Safety

## **CRITICAL SAFETY UPDATE** 🚨

**Sprint**: f-011-vector-collections-v2  
**Issue**: Missing MCP Protocol Safety constraints in original kickoff  
**Priority**: P0 - Protocol violations cause production failures  
**Context**: Evidence from FIX-001 sprint shows protocol breaks require emergency fixes  

---

## **MCP PROTOCOL SAFETY CONSTRAINTS (MANDATORY)**

### **Zero Stdout Discipline**
```typescript
// ❌ NEVER - Protocol violation
console.log("Debug info");
process.stdout.write("Status");

// ✅ ALWAYS - Protocol compliant
console.error("Debug info");  // stderr only
process.stderr.write("Status"); // stderr only
```

### **Async Error Handling Patterns**
```typescript
// ✅ MCP-Safe async pattern
async function safeToolExecution(toolId: string, args: any): Promise<any> {
  try {
    const result = await executeToolInternal(toolId, args);
    // Log to stderr only
    console.error(`[INFO] Tool ${toolId} completed`);
    return result;
  } catch (error) {
    // Structured error logging to stderr
    console.error(`[ERROR] Tool ${toolId}: ${error.message}`);
    // Return JSON error, never throw to stdout
    return { error: "execution_failed", details: error.message };
  }
}
```

### **Unicode/Emoji Safety**
```typescript
// ✅ Safe logging with emoji filtering
function protocolSafeLog(message: string, level: 'INFO' | 'ERROR' = 'INFO') {
  // Filter emoji and Unicode that breaks MCP JSON protocol
  const safeMessage = message.replace(/[\u{1F600}-\u{1F64F}]/gu, '[emoji]')
                            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '[symbol]')
                            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '[transport]');
  
  console.error(`[${level}] ${safeMessage}`);
}
```

### **Graceful Degradation Strategy**
```typescript
// ✅ Vector operations with JSON fallback
async function dualWriteWithFallback(data: any): Promise<void> {
  let vectorSuccess = false;
  
  try {
    await vectorWrite(data);
    vectorSuccess = true;
  } catch (vectorError) {
    console.error(`[WARN] Vector write failed, using JSON fallback: ${vectorError.message}`);
  }
  
  try {
    await jsonWrite({ ...data, mode: vectorSuccess ? 'vector' : 'json' });
  } catch (jsonError) {
    console.error(`[ERROR] Critical: JSON fallback failed: ${jsonError.message}`);
    // Still return success to not break tool execution
  }
}
```

### **Structured Logging Standards**
```typescript
// ✅ MCP Protocol compliant logging
interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  component: string;
  message: string;
  details?: any;
}

function structuredLog(entry: LogEntry) {
  // Always to stderr, never stdout
  console.error(JSON.stringify({
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString()
  }));
}
```

---

## **IMPLEMENTATION CORRECTIONS REQUIRED**

### **1. Middleware Pre/Post Hooks**
- **ADD**: Wrap all console.log → console.error
- **ADD**: Unicode filtering in evidence anchors
- **ADD**: Try/catch around all async operations
- **ADD**: Fallback strategies for vector operations

### **2. JSON Metrics Writer**
- **ADD**: Atomic file operations with error recovery
- **ADD**: Structured error logging (no stdout)
- **ADD**: Safe JSON serialization (handle circular refs)

### **3. Vector Writer Integration**
- **ADD**: ChromaDB connection failure handling
- **ADD**: Timeout handling with graceful degradation
- **ADD**: JSON fallback when vector operations fail

### **4. Tool Gateway Integration**
- **ADD**: Protocol-safe error responses
- **ADD**: Timeout handling for middleware operations
- **ADD**: Performance monitoring without stdout pollution
- **ADD**: D-009 compliant timestamp generation (nowEpoch/nowIso)
- **ADD**: Import time utilities: `import { nowEpoch, nowIso } from '@/utils/time'`

---

## **VALIDATION CHECKLIST**

Before Phase 1 completion, verify:
- [ ] **Zero Stdout**: No console.log, process.stdout usage anywhere
- [ ] **Error Handling**: All async operations wrapped in try/catch
- [ ] **Unicode Safety**: Emoji filtering in logs and stored data
- [ ] **Fallback Strategy**: JSON fallback when vector operations fail
- [ ] **Structured Logging**: All logs use stderr with consistent format
- [ ] **Performance Bounds**: Operations complete within 400ms timeout
- [ ] **Protocol Compliance**: No JSON protocol violations during execution
- [ ] **D-009 Compliance**: All timestamps use nowEpoch()/nowIso() from src/utils/time.ts
- [ ] **Date API Ban**: No direct Date.now() or new Date().toISOString() usage

---

## **EVIDENCE FROM PRIOR SPRINTS**

**FIX-001 Crisis Example**:
```
// This caused production failure:
console.log("Memory system initialized 🚀"); // Unicode emoji broke MCP protocol

// Fixed with:
console.error("[INFO] Memory system initialized"); // Safe, no emoji, stderr
```

**Performance Issue Pattern**:
```
// This caused timeouts:
await expensiveOperation(); // No timeout, no fallback

// Fixed with:
try {
  await Promise.race([
    expensiveOperation(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 400))
  ]);
} catch (error) {
  console.error(`[WARN] Operation failed, using fallback: ${error.message}`);
  return fallbackResult;
}
```

---

## **EXECUTION LOG UPDATE**

Add to your CODEX execution log:

```markdown
### Mid-Flight Safety Correction Applied
**Issue**: Missing MCP protocol safety constraints in original kickoff
**Evidence**: FIX-001 sprint showed protocol violations cause production failures
**Actions Taken**:
- Applied zero-stdout discipline to all logging
- Added async error handling patterns
- Implemented unicode safety filtering
- Added graceful degradation strategies
- Updated all modules with protocol-compliant patterns

**Validation**: Protocol compliance verified before Phase 1 completion
```

---

## **CONTINUE IMPLEMENTATION**

With these safety constraints now applied:
1. **Review Current Code**: Update any existing implementations with safety patterns
2. **Apply to New Code**: Use these patterns for remaining Phase 1 tasks
3. **Update Tests**: Include protocol compliance in unit tests
4. **Document Patterns**: Note safety decisions in execution log

**Protocol safety is non-negotiable for MCP server operation. These patterns prevent production failures that required emergency fixes in prior sprints.**

🚀 **Continue Phase 1 implementation with MCP protocol safety compliance**
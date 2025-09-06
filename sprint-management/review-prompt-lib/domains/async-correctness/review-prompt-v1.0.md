# Async Correctness Review Prompt v1.0

## Context
You are conducting a systematic review of TypeScript/JavaScript code for async/await correctness issues that could cause memory leaks, unhandled promise rejections, or race conditions.

## Review Scope
**Files to analyze:** All *.ts files in src/ directory (exclude *.test.ts, *.spec.ts)  
**Focus areas:** HTTP handlers, database operations, file I/O, external API calls, memory operations

## Detection Patterns

### P0 CRITICAL (Block merge immediately)

#### 1. Unawaited Promises in Request Handlers
```typescript
// BAD - Missing await in critical path
async function handler(req) {
  processRequest(req);  // ❌ Unawaited promise
  return response;
}

// GOOD - Properly awaited
async function handler(req) {
  await processRequest(req);  // ✅ Awaited
  return response;
}
```
**Look for:** Async function calls without await in request handlers, API endpoints, critical execution paths

#### 2. Missing Timeout on Network Operations
```typescript
// BAD - No timeout handling
const response = await fetch(url);  // ❌ Could hang forever

// GOOD - With timeout
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);
const response = await fetch(url, { signal: controller.signal });
```
**Look for:** HTTP requests, database calls, external API calls without timeout/AbortSignal

### P1 HIGH (Fix within sprint)

#### 3. Race Conditions in Shared State
```typescript
// BAD - Concurrent modification possible
async function updateUser(id) {
  const user = await getUser(id);
  user.lastAccess = Date.now();     // ❌ Race condition possible
  await saveUser(user);
}

// GOOD - Atomic update
async function updateUser(id) {
  await updateUserAtomic(id, { lastAccess: Date.now() });
}
```
**Look for:** Concurrent access to shared objects, non-atomic read-modify-write operations

#### 4. Promise.all vs Promise.allSettled Misuse
```typescript
// BAD - One failure kills all operations
await Promise.all([
  sendEmail(user),      // If this fails...
  logActivity(user),    // ...this never executes
  updateCache(user)
]);

// GOOD - Partial success allowed
const results = await Promise.allSettled([
  sendEmail(user),
  logActivity(user), 
  updateCache(user)
]);
```
**Look for:** Promise.all where partial success is acceptable

### P2 MEDIUM (Technical debt)

#### 5. Missing Error Propagation in Async Chains
```typescript
// BAD - Error context lost
async function processData(data) {
  try {
    return await transform(data);
  } catch (error) {
    throw new Error('Processing failed');  // ❌ Original context lost
  }
}

// GOOD - Error context preserved
async function processData(data) {
  try {
    return await transform(data);
  } catch (error) {
    throw new Error(`Processing failed: ${error.message}`, { cause: error });
  }
}
```

## Output Format (REQUIRED)

For each finding, output exactly this JSON structure:
```json
{
  "fingerprint": "async-correctness:{relative_file_path}:{line_number}:{category}",
  "severity": "P0|P1|P2|P3", 
  "category": "unawaited-promise|missing-timeout|race-condition|promise-pattern|error-propagation",
  "file": "src/path/to/file.ts",
  "line": 42,
  "description": "Brief description of the specific issue",
  "evidence": "// Code snippet showing the problem\nasync function bad() {\n  doAsync(); // Missing await\n}",
  "recommendation": "Add await: await doAsync();"
}
```

**Note on Fingerprints**: Provide the fingerprint in format `domain:file:line:category`. The processing system will automatically add a content hash based on the evidence field to ensure fingerprint stability across code refactoring.

**Critical Requirements:**
- Use relative file paths from repository root
- Line numbers must be accurate  
- Evidence must include actual code snippet with context
- Evidence should contain the problematic code pattern clearly
- Categories must match exactly: unawaited-promise, missing-timeout, race-condition, promise-pattern, error-propagation
- Do not manually create content hash in fingerprint - the processing system will add it based on evidence

## Review Instructions

1. **Scan all TypeScript files** in src/ directory
2. **For each file**, look for the specific patterns listed above
3. **Generate findings** using exact JSON format
4. **Create unique fingerprints** for each issue location
5. **Include code evidence** with context lines
6. **Provide specific recommendations** for fixing each issue

## Exclusions
- Test files (*.test.ts, *.spec.ts, **/__tests__/*)
- Mock implementations (*.mock.ts)
- Legacy code marked with `// LEGACY-ASYNC` comment
- Third-party library files in node_modules/
- Configuration files (*.config.ts)

## Success Criteria
- All findings have unique, stable fingerprints
- Evidence includes actual code snippets with line context
- Recommendations are specific and actionable
- No false positives on properly handled async patterns
- Focus on real issues that could cause production problems

## Example Output
```json
[
  {
    "fingerprint": "async-correctness:src/api/auth.ts:45:unawaited-promise",
    "severity": "P0",
    "category": "unawaited-promise", 
    "file": "src/api/auth.ts",
    "line": 45,
    "description": "Authentication handler missing await on token validation",
    "evidence": "async function authenticate(req) {\n  validateToken(req.token); // Missing await\n  return { user: req.user };\n}",
    "recommendation": "Add await: await validateToken(req.token);"
  }
]
```

# Exhaustiveness Checking Review Prompt v1.0

## Context
You are conducting a systematic review of TypeScript/JavaScript code for missing exhaustiveness checks in switch statements, discriminated unions, and state machines that could cause silent failures or logic errors.

## Review Scope
**Files to analyze:** All *.ts and *.js files in src/ directory (exclude *.test.ts, *.spec.ts)  
**Focus areas:** Switch statements, discriminated unions, state machines, Result/Either patterns, enum handling

## Detection Patterns

### P0 CRITICAL (Block merge immediately - Silent failure risk)

#### 1. Missing Switch Exhaustiveness
```typescript
// BAD - Missing cases in discriminated union switch
type Action = 
  | { type: 'CREATE'; payload: User }
  | { type: 'UPDATE'; payload: Partial<User> }
  | { type: 'DELETE'; payload: string }
  | { type: 'ARCHIVE'; payload: string };  // New case added

function userReducer(state: UserState, action: Action) {
  switch (action.type) {
    case 'CREATE':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE':
      return { ...state, users: state.users.map(u => 
        u.id === action.payload.id ? { ...u, ...action.payload } : u
      )};
    case 'DELETE':
      return { ...state, users: state.users.filter(u => u.id !== action.payload) };
    // ❌ Missing 'ARCHIVE' case - silent failure!
  }
  // ❌ No return statement - undefined behavior
}

// GOOD - Exhaustive switch with assertNever
function userReducer(state: UserState, action: Action) {
  switch (action.type) {
    case 'CREATE':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE':
      return { ...state, users: state.users.map(u => 
        u.id === action.payload.id ? { ...u, ...action.payload } : u
      )};
    case 'DELETE':
      return { ...state, users: state.users.filter(u => u.id !== action.payload) };
    case 'ARCHIVE':  // ✅ All cases handled
      return { ...state, users: state.users.map(u => 
        u.id === action.payload ? { ...u, archived: true } : u
      )};
    default:
      return assertNever(action);  // ✅ Compile-time exhaustiveness check
  }
}
```
**Look for:** Switch statements on union types missing cases, enum switches without defaults

#### 2. Missing assertNever in Default Cases
```typescript
// BAD - Default case doesn't ensure exhaustiveness
type Status = 'pending' | 'approved' | 'rejected';

function getStatusColor(status: Status): string {
  switch (status) {
    case 'pending':
      return 'yellow';
    case 'approved':
      return 'green';
    case 'rejected':
      return 'red';
    default:
      return 'gray';  // ❌ Silent handling of unexpected values
  }
}

// GOOD - assertNever ensures compile-time exhaustiveness
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

function getStatusColor(status: Status): string {
  switch (status) {
    case 'pending':
      return 'yellow';
    case 'approved':
      return 'green';
    case 'rejected':
      return 'red';
    default:
      return assertNever(status);  // ✅ Compile error if Status gains new value
  }
}
```
**Look for:** Switch default cases without assertNever, missing exhaustiveness validation

### P1 HIGH (Fix within sprint - Logic error risk)

#### 3. Incomplete Discriminated Unions
```typescript
// BAD - Missing discriminant property handling
type ApiResponse = 
  | { success: true; data: any }
  | { success: false; error: string };

function handleResponse(response: ApiResponse) {
  if (response.success) {
    console.log(response.data);  // ✅ TypeScript knows this is success case
  }
  // ❌ Missing else case - error responses silently ignored!
}

// GOOD - Complete discriminated union handling
function handleResponse(response: ApiResponse) {
  if (response.success) {
    console.log(response.data);
  } else {
    console.error(response.error);  // ✅ Error case handled
  }
}

// BETTER - Switch with exhaustiveness
function handleResponse(response: ApiResponse) {
  switch (response.success) {
    case true:
      console.log(response.data);
      break;
    case false:
      console.error(response.error);
      break;
    default:
      assertNever(response);  // ✅ Exhaustive
  }
}
```
**Look for:** If/else chains on discriminated unions missing branches, partial union handling

#### 4. State Machine Transition Gaps
```typescript
// BAD - Missing state transitions
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
type ConnectionEvent = 'connect' | 'disconnect' | 'error' | 'retry';

function connectionReducer(state: ConnectionState, event: ConnectionEvent): ConnectionState {
  switch (state) {
    case 'disconnected':
      if (event === 'connect') return 'connecting';
      break;  // ❌ Other events not handled
    case 'connecting':
      if (event === 'disconnect') return 'disconnected';
      if (event === 'error') return 'disconnected';
      // ❌ Missing 'connect' success case
      break;
    case 'connected':
      if (event === 'disconnect') return 'disconnected';
      // ❌ Missing error handling
      break;
    // ❌ Missing 'reconnecting' state entirely
  }
  return state;  // ❌ Silent fallback
}

// GOOD - Complete state machine
function connectionReducer(state: ConnectionState, event: ConnectionEvent): ConnectionState {
  switch (state) {
    case 'disconnected':
      switch (event) {
        case 'connect': return 'connecting';
        case 'disconnect': return state;  // ✅ Explicit no-op
        case 'error': return state;
        case 'retry': return 'connecting';
        default: return assertNever(event);
      }
    case 'connecting':
      switch (event) {
        case 'connect': return 'connected';  // ✅ Success transition
        case 'disconnect': return 'disconnected';
        case 'error': return 'disconnected';
        case 'retry': return state;
        default: return assertNever(event);
      }
    case 'connected':
      switch (event) {
        case 'connect': return state;
        case 'disconnect': return 'disconnected';
        case 'error': return 'reconnecting';  // ✅ Error handling
        case 'retry': return state;
        default: return assertNever(event);
      }
    case 'reconnecting':  // ✅ All states handled
      switch (event) {
        case 'connect': return 'connected';
        case 'disconnect': return 'disconnected';
        case 'error': return 'disconnected';
        case 'retry': return state;
        default: return assertNever(event);
      }
    default:
      return assertNever(state);  // ✅ State exhaustiveness
  }
}
```
**Look for:** State reducers missing action types, incomplete state transition handling

### P2 MEDIUM (Technical debt - Incomplete state handling)

#### 5. Incomplete Result/Either Pattern Handling
```typescript
// BAD - Only handling success case
type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

function processUser(userResult: Result<User, string>) {
  if (userResult.ok) {
    return userResult.value.name;  // ✅ Success case
  }
  // ❌ Error case not handled - function returns undefined
}

// GOOD - Complete Result handling
function processUser(userResult: Result<User, string>): string {
  if (userResult.ok) {
    return userResult.value.name;
  } else {
    throw new Error(`User processing failed: ${userResult.error}`);  // ✅ Error case
  }
}

// BETTER - Match function for exhaustive handling
function match<T, E, R>(
  result: Result<T, E>,
  handlers: {
    ok: (value: T) => R;
    error: (error: E) => R;
  }
): R {
  return result.ok ? handlers.ok(result.value) : handlers.error(result.error);
}

const userName = match(userResult, {
  ok: (user) => user.name,  // ✅ Must handle both cases
  error: (error) => { throw new Error(`Failed: ${error}`); }
});
```
**Look for:** Result/Either types with only one branch handled, Option types without None case

## Output Format (REQUIRED)

For each finding, output exactly this JSON structure:
```json
{
  "fingerprint": "exhaustiveness-checking:{relative_file_path}:{line_number}:{category}",
  "severity": "P0|P1|P2|P3", 
  "category": "missing-switch-exhaustiveness|missing-assertnever|incomplete-discriminated-unions|state-machine-gaps|incomplete-error-handling",
  "file": "src/path/to/file.ts",
  "line": 42,
  "description": "Brief description of the specific exhaustiveness issue",
  "evidence": "// Code snippet showing the problem\nswitch (action.type) {\n  case 'CREATE': return newState;\n  // Missing cases\n}",
  "recommendation": "Add missing cases and assertNever: default: return assertNever(action);",
  "failure_mode": "New action types added to union will be silently ignored, causing state inconsistency"
}
```

**Note on Fingerprints**: Provide the fingerprint in format `domain:file:line:category`. The processing system will automatically add a content hash based on the evidence field to ensure fingerprint stability across code refactoring.

**Critical Requirements:**
- Use relative file paths from repository root
- Line numbers must be accurate  
- Evidence must include actual code snippet with context
- Evidence should contain the problematic exhaustiveness pattern clearly
- Categories must match exactly: missing-switch-exhaustiveness, missing-assertnever, incomplete-discriminated-unions, state-machine-gaps, incomplete-error-handling
- Include failure_mode field explaining what happens when exhaustiveness fails
- Do not manually create content hash in fingerprint - the processing system will add it based on evidence

## Review Instructions

1. **Scan all TypeScript/JavaScript files** in src/ directory
2. **Focus on control flow structures** - switch statements, if/else chains, pattern matching
3. **Look for exhaustiveness patterns** listed above in order of severity
4. **Generate findings** using exact JSON format
5. **Create unique fingerprints** for each issue location
6. **Include code evidence** with context lines
7. **Provide specific exhaustiveness recommendations** for fixing each issue
8. **Explain failure mode** for each finding

## Exhaustiveness Focus Areas
- **Switch statements** - discriminated unions, enums, string literals
- **Conditional logic** - if/else chains on unions, partial branching
- **State machines** - reducers, transition functions, event handling
- **Result types** - Result/Either/Option pattern completeness
- **Type narrowing** - discriminant property usage, type guards

## Exclusions
- Test files (*.test.ts, *.spec.ts, **/__tests__/*)
- Mock implementations (*.mock.ts)
- Configuration files (*.config.ts)
- Third-party library files in node_modules/
- Intentionally partial switches with `// PARTIAL-SWITCH` comment

## Success Criteria
- All findings have unique, stable fingerprints
- Evidence includes actual code snippets with line context
- Exhaustiveness recommendations are specific and actionable
- Failure mode clearly explains the risk of incomplete handling
- No false positives on intentionally partial logic
- Focus on real issues that could cause silent failures

## Example Output
```json
[
  {
    "fingerprint": "exhaustiveness-checking:src/reducers/user.ts:42:missing-switch-exhaustiveness",
    "severity": "P0",
    "category": "missing-switch-exhaustiveness", 
    "file": "src/reducers/user.ts",
    "line": 42,
    "description": "User action reducer missing cases for CREATE and DELETE actions",
    "evidence": "switch (action.type) {\n  case 'UPDATE':\n    return updateUser(state, action.payload);\n  // Missing CREATE and DELETE cases\n}",
    "recommendation": "Add missing cases and default with assertNever: case 'CREATE': ..., case 'DELETE': ..., default: return assertNever(action);",
    "failure_mode": "New user actions will be silently ignored, causing state updates to fail without error indication"
  }
]
```

# Error Taxonomy Review Prompt v1.0

## Context
You are conducting a systematic review of TypeScript/JavaScript code for error handling patterns, consistency issues, and proper error classification that could affect operational reliability and debugging.

## Review Scope
**Files to analyze:** All *.ts and *.js files in src/ directory (exclude *.test.ts, *.spec.ts)  
**Focus areas:** Error throwing, HTTP status codes, error response formats, error classification, debugging context

## Detection Patterns

### P0 CRITICAL (Block merge immediately - Error handling failure)

#### 1. Throw String Anti-pattern
```typescript
// BAD - Throwing raw strings
if (!userData.email) {
  throw 'Email is required';  // ❌ String instead of Error
}

async function processData(data) {
  if (!data) {
    throw 'Invalid data provided';  // ❌ No stack trace, hard to debug
  }
}

// BAD - Promise rejection with string
return new Promise((resolve, reject) => {
  if (error) {
    reject('Something went wrong');  // ❌ String rejection
  }
});

// GOOD - Proper Error objects
if (!userData.email) {
  throw new ValidationError('Email is required', { field: 'email' });  // ✅ Structured error
}

async function processData(data) {
  if (!data) {
    throw new ValidationError('Invalid data provided', { 
      data: typeof data,
      context: 'processData'
    });  // ✅ Rich context
  }
}
```
**Look for:** `throw 'string'`, `reject('string')`, throwing non-Error objects

#### 2. Inconsistent HTTP Status Codes
```typescript
// BAD - Wrong status codes
app.post('/api/users', (req, res) => {
  if (!req.body.email) {
    return res.status(500).json({ error: 'Email required' });  // ❌ Should be 400
  }
  
  if (!userExists(req.body.id)) {
    return res.status(400).json({ error: 'User not found' });  // ❌ Should be 404
  }
  
  if (!req.user.isAdmin) {
    return res.status(500).json({ error: 'Access denied' });  // ❌ Should be 403
  }
});

// GOOD - Correct status codes
app.post('/api/users', (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({ error: 'Email required' });  // ✅ 400 for validation
  }
  
  if (!userExists(req.body.id)) {
    return res.status(404).json({ error: 'User not found' });  // ✅ 404 for not found
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });  // ✅ 403 for forbidden
  }
});
```
**Look for:** 500 status for validation errors (should be 400), 400 for not found (should be 404), wrong codes for auth failures

### P1 HIGH (Fix within sprint - Operational reliability risk)

#### 3. Missing Error Context
```typescript
// BAD - Generic error without context
try {
  const user = await database.findUser(id);
  return user;
} catch (error) {
  console.error('Database error');  // ❌ No useful debugging info
  throw new Error('Database error');  // ❌ Lost original context
}

// BAD - Missing correlation context
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });  // ❌ No request context
  }
});

// GOOD - Rich error context
try {
  const user = await database.findUser(id);
  return user;
} catch (error) {
  console.error('Database error', { 
    userId: id, 
    operation: 'findUser',
    originalError: error.message,
    correlationId: req.correlationId  // ✅ Rich context
  });
  throw new DatabaseError('Failed to find user', { 
    cause: error,
    userId: id,
    correlationId: req.correlationId
  });
}
```
**Look for:** Generic error messages, missing correlation IDs, lost error context in catch blocks

#### 4. Unstructured Error Responses
```typescript
// BAD - Inconsistent error formats
app.get('/api/users', (req, res) => {
  try {
    // ...
  } catch (error) {
    res.status(500).send(error.message);  // ❌ Plain string
  }
});

app.get('/api/posts', (req, res) => {
  try {
    // ...
  } catch (error) {
    res.status(500).json({ message: error.message });  // ❌ Different format
  }
});

app.get('/api/comments', (req, res) => {
  try {
    // ...
  } catch (error) {
    res.status(500).json({ 
      error: { message: error.message, code: 'INTERNAL_ERROR' }
    });  // ❌ Yet another format
  }
});

// GOOD - Consistent error format
const standardErrorHandler = (error, req, res) => {
  const errorResponse = {
    error: {
      message: error.message,
      code: error.code || 'INTERNAL_ERROR',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    }
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;  // ✅ Dev-only debug info
  }
  
  res.status(error.statusCode || 500).json(errorResponse);  // ✅ Consistent format
};
```
**Look for:** Different error response structures across endpoints, mixing string and object responses

### P2 MEDIUM (Technical debt - Error handling inconsistency)

#### 5. Missing Error Classification
```typescript
// BAD - Generic Error for everything
if (!email) {
  throw new Error('Email validation failed');  // ❌ No classification
}

if (networkTimeout) {
  throw new Error('Network request failed');  // ❌ Same Error class
}

if (unauthorized) {
  throw new Error('User not authorized');  // ❌ Can't distinguish error types
}

// GOOD - Specific error classes
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

class NetworkError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'NetworkError';
    this.timeout = options.timeout;
    this.statusCode = 503;
  }
}

class AuthorizationError extends Error {
  constructor(message, userId) {
    super(message);
    this.name = 'AuthorizationError';
    this.userId = userId;
    this.statusCode = 403;
  }
}

// Usage with proper classification
if (!email) {
  throw new ValidationError('Email is required', 'email');  // ✅ Specific type
}

if (networkTimeout) {
  throw new NetworkError('Request timeout', { timeout: 5000 });  // ✅ Network-specific
}

if (unauthorized) {
  throw new AuthorizationError('Access denied', userId);  // ✅ Auth-specific
}
```
**Look for:** Generic Error class used for all failures, no error type distinction, missing domain-specific errors

## Output Format (REQUIRED)

For each finding, output exactly this JSON structure:
```json
{
  "fingerprint": "error-taxonomy:{relative_file_path}:{line_number}:{category}",
  "severity": "P0|P1|P2|P3", 
  "category": "throw-string-antipattern|inconsistent-http-status|missing-error-context|unstructured-error-responses|missing-error-classification",
  "file": "src/path/to/file.ts",
  "line": 42,
  "description": "Brief description of the specific error handling issue",
  "evidence": "// Code snippet showing the problem\nthrow 'Invalid input';",
  "recommendation": "Replace string with Error object: throw new ValidationError('Invalid input')",
  "operational_impact": "String errors lack stack traces making debugging difficult in production"
}
```

**Note on Fingerprints**: Provide the fingerprint in format `domain:file:line:category`. The processing system will automatically add a content hash based on the evidence field to ensure fingerprint stability across code refactoring.

**Critical Requirements:**
- Use relative file paths from repository root
- Line numbers must be accurate  
- Evidence must include actual code snippet with context
- Evidence should contain the problematic error pattern clearly
- Categories must match exactly: throw-string-antipattern, inconsistent-http-status, missing-error-context, unstructured-error-responses, missing-error-classification
- Include operational_impact field explaining the debugging/reliability impact
- Do not manually create content hash in fingerprint - the processing system will add it based on evidence

## Review Instructions

1. **Scan all TypeScript/JavaScript files** in src/ directory
2. **Focus on error handling code** - try/catch blocks, throw statements, HTTP responses
3. **Look for error patterns** listed above in order of severity
4. **Generate findings** using exact JSON format
5. **Create unique fingerprints** for each issue location
6. **Include code evidence** with context lines
7. **Provide specific error handling recommendations** for fixing each issue
8. **Explain operational impact** for each finding

## Error Handling Focus Areas
- **Error throwing** - Error objects vs strings, proper classification
- **HTTP status codes** - 400, 401, 403, 404, 409, 429, 500, 503 mapping
- **Error responses** - consistent format, debugging information
- **Error context** - correlation IDs, request context, stack traces
- **Error propagation** - cause chains, context preservation

## Exclusions
- Test files (*.test.ts, *.spec.ts, **/__tests__/*)
- Mock implementations (*.mock.ts)
- Configuration files (*.config.ts)
- Third-party library files in node_modules/
- Intentional string throws with `// LEGACY-ERROR` comment

## Success Criteria
- All findings have unique, stable fingerprints
- Evidence includes actual code snippets with line context
- Error handling recommendations are specific and actionable
- Operational impact clearly explains debugging/reliability effects
- No false positives on proper error handling patterns
- Focus on real issues that could affect production debugging

## Example Output
```json
[
  {
    "fingerprint": "error-taxonomy:src/api/auth.ts:23:throw-string-antipattern",
    "severity": "P0",
    "category": "throw-string-antipattern", 
    "file": "src/api/auth.ts",
    "line": 23,
    "description": "Authentication validation throwing string instead of Error object",
    "evidence": "if (!token) {\n  throw 'Authentication token required';\n}",
    "recommendation": "Replace with Error object: throw new AuthenticationError('Authentication token required')",
    "operational_impact": "String errors lack stack traces and proper error handling, making production debugging extremely difficult"
  }
]
```

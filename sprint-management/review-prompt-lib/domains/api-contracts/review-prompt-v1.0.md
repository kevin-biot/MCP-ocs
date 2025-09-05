# API Contracts Review Prompt v1.0

## Context
You are conducting a systematic review of TypeScript/JavaScript code for API contract correctness issues that could cause runtime type errors, integration failures, or contract violations.

## Review Scope
**Files to analyze:** All *.ts and *.js files in src/ directory (exclude *.test.ts, *.spec.ts)  
**Focus areas:** API endpoints, function interfaces, request/response handling, parameter validation, return types

## Detection Patterns

### P0 CRITICAL (Block merge immediately)

#### 1. Missing Input Validation
```typescript
// BAD - No validation of request parameters
app.post('/api/users', async (req, res) => {
  const user = await createUser(req.body);  // ❌ Unvalidated input
  res.json(user);
});

// GOOD - Proper input validation
app.post('/api/users', async (req, res) => {
  const validation = validateUserInput(req.body);  // ✅ Validated
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.errors });
  }
  const user = await createUser(validation.data);
  res.json(user);
});
```
**Look for:** API endpoints, function parameters without validation, direct use of req.body, unchecked object properties

#### 2. Return Type Contract Violations
```typescript
// BAD - Return type doesn't match declared interface
interface UserResponse {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<UserResponse> {
  const user = await db.findUser(id);
  return user;  // ❌ Might be null, missing properties
}

// GOOD - Properly typed return
async function getUser(id: string): Promise<UserResponse> {
  const user = await db.findUser(id);
  if (!user) {
    throw new Error('User not found');
  }
  return {  // ✅ Explicit structure matching interface
    id: user.id,
    name: user.name,
    email: user.email
  };
}
```
**Look for:** Functions returning different types than declared, missing properties, potential null/undefined returns

### P1 HIGH (Fix within sprint)

#### 3. Parameter Contract Violations
```typescript
// BAD - Implementation doesn't match interface
interface CreateUserParams {
  name: string;
  email: string;
  role?: string;  // Optional parameter
}

function createUser(params: CreateUserParams) {
  // ❌ Treating optional parameter as required
  const roleUpper = params.role.toUpperCase();  // Will crash if role undefined
  return { ...params, role: roleUpper };
}

// GOOD - Proper optional parameter handling
function createUser(params: CreateUserParams) {
  const role = params.role?.toUpperCase() ?? 'USER';  // ✅ Safe handling
  return { ...params, role };
}
```
**Look for:** Optional parameters treated as required, missing parameter checks, wrong parameter types

#### 4. Inconsistent Error Response Formats
```typescript
// BAD - Inconsistent error formats
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).send(error.message);  // ❌ Plain string
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await getPost(req.params.id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: { message: error.message, code: 'POST_ERROR' } });  // ❌ Different format
  }
});

// GOOD - Consistent error format
const standardErrorHandler = (error, res) => {
  res.status(500).json({
    error: {
      message: error.message,
      code: error.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    }
  });
};
```
**Look for:** Different error response structures across endpoints, missing error codes, inconsistent status codes

### P2 MEDIUM (Technical debt)

#### 5. Documentation Mismatch
```typescript
/**
 * Updates user profile information
 * @param userId - The user ID  // ❌ Parameter name doesn't match
 * @param data - User profile data
 * @returns Promise<User> - Updated user object  // ❌ Actually returns UserProfile
 */
async function updateUserProfile(id: string, profileData: UserProfileData): Promise<UserProfile> {
  // Implementation...
}
```
**Look for:** JSDoc parameter names not matching function signature, incorrect return type documentation, outdated examples

## Output Format (REQUIRED)

For each finding, output exactly this JSON structure:
```json
{
  "fingerprint": "api-contracts:{relative_file_path}:{line_number}:{category}",
  "severity": "P0|P1|P2|P3", 
  "category": "missing-validation|return-type-mismatch|parameter-contract-violation|error-response-inconsistency|documentation-mismatch",
  "file": "src/path/to/file.ts",
  "line": 42,
  "description": "Brief description of the specific issue",
  "evidence": "// Code snippet showing the problem\nfunction badApi(req) {\n  return req.body; // No validation\n}",
  "recommendation": "Add input validation before processing request body"
}
```

**Note on Fingerprints**: Provide the fingerprint in format `domain:file:line:category`. The processing system will automatically add a content hash based on the evidence field to ensure fingerprint stability across code refactoring.

**Critical Requirements:**
- Use relative file paths from repository root
- Line numbers must be accurate  
- Evidence must include actual code snippet with context
- Evidence should contain the problematic code pattern clearly
- Categories must match exactly: missing-validation, return-type-mismatch, parameter-contract-violation, error-response-inconsistency, documentation-mismatch
- Do not manually create content hash in fingerprint - the processing system will add it based on evidence

## Review Instructions

1. **Scan all TypeScript/JavaScript files** in src/ directory
2. **For each file**, look for the specific patterns listed above
3. **Focus on API boundaries** - endpoints, public functions, exported interfaces
4. **Generate findings** using exact JSON format
5. **Create unique fingerprints** for each issue location
6. **Include code evidence** with context lines
7. **Provide specific recommendations** for fixing each issue

## Exclusions
- Test files (*.test.ts, *.spec.ts, **/__tests__/*)
- Mock implementations (*.mock.ts)
- Internal helper functions (not part of public API)
- Third-party library files in node_modules/
- Configuration files (*.config.ts)
- Legacy code marked with `// LEGACY-API` comment

## Success Criteria
- All findings have unique, stable fingerprints
- Evidence includes actual code snippets with line context
- Recommendations are specific and actionable
- No false positives on properly handled API patterns
- Focus on real issues that could cause integration problems

## Example Output
```json
[
  {
    "fingerprint": "api-contracts:src/api/users.ts:23:missing-validation",
    "severity": "P0",
    "category": "missing-validation", 
    "file": "src/api/users.ts",
    "line": 23,
    "description": "User creation endpoint missing input validation",
    "evidence": "app.post('/api/users', async (req, res) => {\n  const user = await createUser(req.body); // No validation\n  res.json(user);\n});",
    "recommendation": "Add input validation using schema validator before createUser call"
  }
]
```

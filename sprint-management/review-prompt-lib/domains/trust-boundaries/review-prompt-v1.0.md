# Trust Boundaries Review Prompt v1.0

## Context
You are conducting a systematic security review of TypeScript/JavaScript code for trust boundary violations that could lead to security vulnerabilities, privilege escalation, or data exposure.

## Review Scope
**Files to analyze:** All *.ts and *.js files in src/ directory (exclude *.test.ts, *.spec.ts)  
**Focus areas:** API endpoints, authentication/authorization, data access, input processing, external integrations

## Detection Patterns

### P0 CRITICAL (Block merge immediately - Security vulnerability)

#### 1. Unsanitized Input Crossing Trust Boundaries
```typescript
// BAD - Direct SQL query with user input
app.get('/api/users', (req, res) => {
  const query = `SELECT * FROM users WHERE name = '${req.query.name}'`;  // ❌ SQL injection risk
  db.query(query, (err, results) => res.json(results));
});

// GOOD - Parameterized query
app.get('/api/users', (req, res) => {
  const query = 'SELECT * FROM users WHERE name = ?';  // ✅ Safe parameterized query
  db.query(query, [req.query.name], (err, results) => res.json(results));
});
```
**Look for:** Direct string concatenation with user input, unescaped template literals, command execution with user data

#### 2. Privilege Escalation Without Checks
```typescript
// BAD - Admin operation without role verification
app.delete('/api/users/:id', async (req, res) => {
  await deleteUser(req.params.id);  // ❌ No authorization check
  res.json({ success: true });
});

// GOOD - Proper authorization
app.delete('/api/users/:id', requireAdmin, async (req, res) => {  // ✅ Admin middleware
  if (req.user.id === req.params.id && !req.user.canDeleteSelf) {
    return res.status(403).json({ error: 'Cannot delete own account' });
  }
  await deleteUser(req.params.id);
  res.json({ success: true });
});
```
**Look for:** Administrative operations without role checks, database operations bypassing authorization middleware

### P1 HIGH (Fix within sprint - Security risk)

#### 3. Data Exposure Without Authorization
```typescript
// BAD - Returning user data without ownership verification
app.get('/api/profile/:userId', async (req, res) => {
  const profile = await getUserProfile(req.params.userId);  // ❌ No ownership check
  res.json(profile);
});

// GOOD - Ownership verification
app.get('/api/profile/:userId', async (req, res) => {
  if (req.user.id !== req.params.userId && !req.user.isAdmin) {  // ✅ Authorization check
    return res.status(403).json({ error: 'Access denied' });
  }
  const profile = await getUserProfile(req.params.userId);
  res.json(profile);
});
```
**Look for:** User data access without ownership verification, sensitive fields returned without permission checks

#### 4. Insufficient Input Validation at Trust Boundaries
```typescript
// BAD - Weak validation allowing path traversal
app.get('/api/files/:filename', (req, res) => {
  const filePath = path.join('./uploads', req.params.filename);  // ❌ Path traversal risk
  res.sendFile(filePath);
});

// GOOD - Proper path validation
app.get('/api/files/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);  // ✅ Strip directory components
  if (!/^[a-zA-Z0-9_.-]+$/.test(filename)) {  // ✅ Whitelist validation
    return res.status(400).json({ error: 'Invalid filename' });
  }
  const filePath = path.join('./uploads', filename);
  res.sendFile(filePath);
});
```
**Look for:** Path manipulation without validation, weak regex patterns, missing boundary checks

### P2 MEDIUM (Security debt)

#### 5. Logging Sensitive Information
```typescript
// BAD - Sensitive data in logs
async function authenticateUser(username, password) {
  console.log(`Login attempt: ${username}/${password}`);  // ❌ Password in logs
  const user = await validateCredentials(username, password);
  if (!user) {
    console.log(`Failed login for ${username} with password ${password}`);  // ❌ Still logging password
    throw new Error('Invalid credentials');
  }
  return user;
}

// GOOD - Safe logging
async function authenticateUser(username, password) {
  console.log(`Login attempt: ${username}`);  // ✅ Safe logging
  const user = await validateCredentials(username, password);
  if (!user) {
    console.log(`Failed login for ${username}`);  // ✅ No sensitive data
    throw new Error('Invalid credentials');
  }
  return user;
}
```
**Look for:** Passwords, tokens, or personal information in log statements

## Output Format (REQUIRED)

For each finding, output exactly this JSON structure:
```json
{
  "fingerprint": "trust-boundaries:{relative_file_path}:{line_number}:{category}",
  "severity": "P0|P1|P2|P3", 
  "category": "unsanitized-input|privilege-escalation|data-exposure|insufficient-validation|logging-exposure",
  "file": "src/path/to/file.ts",
  "line": 42,
  "description": "Brief description of the specific security issue",
  "evidence": "// Code snippet showing the problem\nconst query = `SELECT * FROM users WHERE id = ${userId}`;",
  "recommendation": "Use parameterized queries to prevent SQL injection",
  "security_impact": "Could allow SQL injection attacks leading to data breach"
}
```

**Note on Fingerprints**: Provide the fingerprint in format `domain:file:line:category`. The processing system will automatically add a content hash based on the evidence field to ensure fingerprint stability across code refactoring.

**Critical Requirements:**
- Use relative file paths from repository root
- Line numbers must be accurate  
- Evidence must include actual code snippet with context
- Evidence should contain the problematic code pattern clearly
- Categories must match exactly: unsanitized-input, privilege-escalation, data-exposure, insufficient-validation, logging-exposure
- Include security_impact field explaining potential attack vectors
- Do not manually create content hash in fingerprint - the processing system will add it based on evidence

## Review Instructions

1. **Scan all TypeScript/JavaScript files** in src/ directory
2. **Focus on trust boundary crossings** - where external input enters the system
3. **Look for security patterns** listed above in order of severity
4. **Generate findings** using exact JSON format
5. **Create unique fingerprints** for each issue location
6. **Include code evidence** with context lines
7. **Provide specific security recommendations** for fixing each issue
8. **Explain security impact** for each finding

## Trust Boundary Locations
- **HTTP request handlers** - req.body, req.query, req.params, req.headers
- **Database query construction** - WHERE clauses, dynamic SQL
- **File system operations** - path construction, file access
- **External API calls** - data sent to/from external services
- **Authentication/authorization checks** - role verification, permission gates
- **Logging statements** - what gets written to logs

## Exclusions
- Test files (*.test.ts, *.spec.ts, **/__tests__/*)
- Mock implementations (*.mock.ts)
- Configuration files (*.config.ts)
- Third-party library files in node_modules/
- Code marked with `// SECURITY-REVIEWED` comment (only if recent)

## Success Criteria
- All findings have unique, stable fingerprints
- Evidence includes actual code snippets with line context
- Security recommendations are specific and actionable
- Security impact clearly explains the risk
- No false positives on properly secured code patterns
- Focus on real vulnerabilities that could be exploited

## Example Output
```json
[
  {
    "fingerprint": "trust-boundaries:src/api/admin.ts:15:privilege-escalation",
    "severity": "P0",
    "category": "privilege-escalation", 
    "file": "src/api/admin.ts",
    "line": 15,
    "description": "Delete user endpoint missing admin role verification",
    "evidence": "app.delete('/api/users/:id', async (req, res) => {\n  await deleteUser(req.params.id); // No auth check\n  res.json({ success: true });\n});",
    "recommendation": "Add requireAdmin middleware or explicit role check before deleteUser call",
    "security_impact": "Any authenticated user could delete other users, leading to data loss and service disruption"
  }
]
```

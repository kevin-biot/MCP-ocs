# Security Patterns Review Prompt v1.0

## Context
You are conducting a systematic security review of TypeScript/JavaScript code for insecure implementation patterns in authentication, authorization, cryptography, and secret management.

## Review Scope
**Files to analyze:** All *.ts and *.js files in src/ directory (exclude *.test.ts, *.spec.ts)  
**Focus areas:** Authentication systems, authorization logic, cryptographic operations, secret handling, session management

## Detection Patterns

### P0 CRITICAL (Block merge immediately - Critical security vulnerability)

#### 1. Weak Cryptography Patterns
```typescript
// BAD - Weak hash algorithm for passwords
import crypto from 'crypto';
const passwordHash = crypto.createHash('md5').update(password).digest('hex');  // ❌ MD5 is broken

// BAD - Hardcoded cryptographic key
const secretKey = 'mySecretKey123';  // ❌ Hardcoded secret
const encrypted = encrypt(data, secretKey);

// GOOD - Strong hash with salt
import bcrypt from 'bcrypt';
const saltRounds = 12;
const passwordHash = await bcrypt.hash(password, saltRounds);  // ✅ Strong hashing

// GOOD - Environment-based secrets
const secretKey = process.env.ENCRYPTION_KEY;  // ✅ From environment
if (!secretKey) throw new Error('ENCRYPTION_KEY required');
```
**Look for:** MD5, SHA1 for passwords, hardcoded keys, weak random number generation, deprecated crypto

#### 2. Insecure Authentication Patterns
```typescript
// BAD - Password stored in plaintext
const user = {
  username: 'admin',
  password: 'admin123'  // ❌ Plaintext password
};

// BAD - Session without expiration
const session = {
  userId: user.id,
  token: generateToken()  // ❌ No expiration time
};

// GOOD - Hashed password with salt
const user = {
  username: 'admin',
  passwordHash: await bcrypt.hash(password, 12)  // ✅ Hashed password
};

// GOOD - Session with expiration
const session = {
  userId: user.id,
  token: generateToken(),
  expiresAt: new Date(Date.now() + 30 * 60 * 1000)  // ✅ 30 min expiration
};
```
**Look for:** Plaintext passwords, missing session expiration, no rate limiting, weak token generation

### P1 HIGH (Fix within sprint - High security risk)

#### 3. Authorization Bypass Patterns
```typescript
// BAD - Client-side only authorization
app.get('/api/admin/users', (req, res) => {
  // ❌ Assuming client-side check is sufficient
  const users = getAllUsers();
  res.json(users);
});

// BAD - Inconsistent permission checking
if (req.user.role === 'admin' || req.user.role === 'ADMIN') {  // ❌ Case-sensitive comparison
  // admin operation
}

// GOOD - Server-side authorization
app.get('/api/admin/users', requireRole('admin'), (req, res) => {  // ✅ Middleware check
  const users = getAllUsers();
  res.json(users);
});

// GOOD - Consistent case-insensitive checking
if (req.user.role.toLowerCase() === 'admin') {  // ✅ Normalized comparison
  // admin operation
}
```
**Look for:** Missing server-side auth checks, case-sensitive role comparisons, inconsistent permission logic

#### 4. Secret Exposure Patterns
```typescript
// BAD - API key in source code
const apiKey = 'sk-1234567890abcdef';  // ❌ Hardcoded API key
const apiUrl = `https://api.service.com/data?key=${apiKey}`;

// BAD - Database password in config
const dbConfig = {
  host: 'localhost',
  user: 'admin',
  password: 'secretpassword123'  // ❌ Hardcoded password
};

// GOOD - Environment variables
const apiKey = process.env.API_KEY;  // ✅ From environment
if (!apiKey) throw new Error('API_KEY required');

// GOOD - External secret management
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD  // ✅ Environment-based
};
```
**Look for:** Hardcoded API keys, database passwords, JWT secrets, encryption keys in code

### P2 MEDIUM (Security debt)

#### 5. Timing Attack Vulnerabilities
```typescript
// BAD - Non-constant time comparison
function verifyPassword(inputPassword, storedPassword) {
  return inputPassword === storedPassword;  // ❌ Timing attack possible
}

// BAD - Early return reveals information
function checkUserExists(username) {
  const user = findUser(username);
  if (!user) {
    return false;  // ❌ Quick return vs slow hash reveals user existence
  }
  return verifyPassword(inputPassword, user.passwordHash);
}

// GOOD - Constant time comparison
import { timingSafeEqual } from 'crypto';
function verifyPassword(inputPassword, storedPassword) {
  const inputBuffer = Buffer.from(inputPassword);
  const storedBuffer = Buffer.from(storedPassword);
  return timingSafeEqual(inputBuffer, storedBuffer);  // ✅ Constant time
}

// GOOD - Consistent timing
function checkUserExists(username) {
  const user = findUser(username);
  const dummyHash = '$2b$12$dummy.hash.for.timing.consistency';
  const passwordToCheck = user ? user.passwordHash : dummyHash;  // ✅ Always hash
  return user && verifyPassword(inputPassword, passwordToCheck);
}
```
**Look for:** Direct string comparison for passwords/tokens, early returns in auth logic

## Output Format (REQUIRED)

For each finding, output exactly this JSON structure:
```json
{
  "fingerprint": "security-patterns:{relative_file_path}:{line_number}:{category}",
  "severity": "P0|P1|P2|P3", 
  "category": "weak-cryptography|insecure-authentication|authorization-bypass|secret-exposure|timing-attacks",
  "file": "src/path/to/file.ts",
  "line": 42,
  "description": "Brief description of the specific security pattern issue",
  "evidence": "// Code snippet showing the problem\nconst hash = crypto.createHash('md5').update(password);",
  "recommendation": "Replace MD5 with bcrypt for password hashing",
  "security_impact": "MD5 is cryptographically broken and vulnerable to rainbow table attacks",
  "cve_references": ["CVE-2004-2761"] 
}
```

**Note on Fingerprints**: Provide the fingerprint in format `domain:file:line:category`. The processing system will automatically add a content hash based on the evidence field to ensure fingerprint stability across code refactoring.

**Critical Requirements:**
- Use relative file paths from repository root
- Line numbers must be accurate  
- Evidence must include actual code snippet with context
- Evidence should contain the problematic security pattern clearly
- Categories must match exactly: weak-cryptography, insecure-authentication, authorization-bypass, secret-exposure, timing-attacks
- Include security_impact field explaining the vulnerability
- Include cve_references array (empty array [] if no specific CVE applies)
- Do not manually create content hash in fingerprint - the processing system will add it based on evidence

## Review Instructions

1. **Scan all TypeScript/JavaScript files** in src/ directory
2. **Focus on security-critical code** - auth, crypto, secrets, permissions
3. **Look for insecure patterns** listed above in order of severity
4. **Generate findings** using exact JSON format
5. **Create unique fingerprints** for each issue location
6. **Include code evidence** with context lines
7. **Provide specific security recommendations** for fixing each issue
8. **Reference CVEs when applicable** for known vulnerability patterns

## Security Pattern Areas
- **Password handling** - hashing, storage, comparison
- **Session management** - token generation, expiration, validation  
- **Cryptographic operations** - hashing, encryption, key management
- **Secret management** - API keys, database passwords, JWT secrets
- **Authorization logic** - role checks, permission validation
- **Authentication flows** - login, logout, token validation

## Exclusions
- Test files (*.test.ts, *.spec.ts, **/__tests__/*)
- Mock implementations (*.mock.ts)
- Configuration files (*.config.ts) - unless they contain secrets
- Third-party library files in node_modules/
- Demo/example code clearly marked as non-production

## Success Criteria
- All findings have unique, stable fingerprints
- Evidence includes actual code snippets with line context
- Security recommendations are specific and actionable
- Security impact clearly explains the vulnerability
- CVE references included where applicable
- No false positives on secure implementations
- Focus on real patterns that could be exploited

## Example Output
```json
[
  {
    "fingerprint": "security-patterns:src/auth/password.ts:12:weak-cryptography",
    "severity": "P0",
    "category": "weak-cryptography", 
    "file": "src/auth/password.ts",
    "line": 12,
    "description": "Password hashing using deprecated MD5 algorithm",
    "evidence": "const passwordHash = crypto.createHash('md5').update(password).digest('hex');",
    "recommendation": "Replace MD5 with bcrypt: await bcrypt.hash(password, 12)",
    "security_impact": "MD5 is cryptographically broken and vulnerable to rainbow table attacks, allowing password recovery",
    "cve_references": ["CVE-2004-2761"]
  }
]
```

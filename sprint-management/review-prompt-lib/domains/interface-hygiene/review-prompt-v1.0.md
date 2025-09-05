# Interface Hygiene Review Prompt v1.0

## Context
You are conducting a systematic review of TypeScript code for interface and structural typing issues that could cause runtime type errors, accidental structural matches, or type safety erosion.

## Review Scope
**Files to analyze:** All *.ts and *.d.ts files in src/ directory (exclude *.test.ts, *.spec.ts)  
**Focus areas:** Interface definitions, type assertions, any usage, structural typing patterns, branded types

## Detection Patterns

### P0 CRITICAL (Block merge immediately - Type safety violation)

#### 1. Unsafe `any` Usage
```typescript
// BAD - Function parameter as any
function processData(data: any) {  // ❌ Bypasses all type checking
  return data.someProperty.method();
}

// BAD - Return type as any
function fetchUserData(): any {  // ❌ Callers lose type safety
  return apiCall('/user');
}

// GOOD - Proper typing
function processData(data: UserData) {  // ✅ Type-safe parameter
  return data.profile.getName();
}

function fetchUserData(): Promise<UserData> {  // ✅ Type-safe return
  return apiCall('/user');
}
```
**Look for:** Function parameters typed as `any`, return types declared as `any`, variables with explicit `any` type

#### 2. Dangerous Type Assertions
```typescript
// BAD - Unchecked assertion on external data
const userData = response.data as UserData;  // ❌ No validation
userData.email.toLowerCase();  // Will crash if email is undefined

// BAD - Double assertion without validation
const element = document.getElementById('input') as unknown as HTMLInputElement;  // ❌ Unsafe

// GOOD - Validated assertion
function isUserData(data: unknown): data is UserData {  // ✅ Type guard
  return typeof data === 'object' && data !== null && 
         'email' in data && typeof data.email === 'string';
}

const userData = response.data;
if (isUserData(userData)) {  // ✅ Safe usage
  userData.email.toLowerCase();
}
```
**Look for:** `as` assertions on external/unknown data, `as unknown as T` patterns, DOM assertions without null checks

### P1 HIGH (Fix within sprint - Type confusion risk)

#### 3. Structural Type Confusion
```typescript
// BAD - Interfaces that could match unintended types
interface UserConfig {
  id: string;
  name: string;
}

interface ProductConfig {
  id: string;
  name: string;  // ❌ Structurally identical to UserConfig
}

function processUser(user: UserConfig) { /* ... */ }
const product: ProductConfig = { id: 'prod123', name: 'Widget' };
processUser(product);  // ❌ TypeScript allows this!

// GOOD - Discriminated unions or branded types
interface UserConfig {
  type: 'user';  // ✅ Discriminant property
  id: string;
  name: string;
}

interface ProductConfig {
  type: 'product';  // ✅ Discriminant property
  id: string;
  name: string;
}
```
**Look for:** Interfaces with identical structure but different semantic meaning, generic object types used across domains

#### 4. Missing Branded Types for Primitives
```typescript
// BAD - Primitive confusion
type UserId = string;
type ProductId = string;
type Price = number;
type Quantity = number;

function getUser(id: UserId) { /* ... */ }
function getProduct(id: ProductId) { /* ... */ }

const userId: UserId = 'user123';
const productId: ProductId = 'prod456';

getUser(productId);  // ❌ TypeScript allows wrong ID type!

// GOOD - Branded types prevent confusion
type UserId = string & { readonly __brand: 'UserId' };
type ProductId = string & { readonly __brand: 'ProductId' };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createProductId(id: string): ProductId {
  return id as ProductId;
}

// Now type-safe
getUser(productId);  // ❌ TypeScript error!
```
**Look for:** String/number types used for IDs, money, measurements without branding

### P2 MEDIUM (Technical debt - Type safety erosion)

#### 5. Incomplete Interface Definitions
```typescript
// BAD - Unclear optionality
interface ApiResponse {
  data?: any;  // ❌ Optional any
  error?: string;
  status: number;
}

// BAD - Missing discriminants in unions
type NetworkResult = 
  | { success: true; data: any }    // ❌ Missing discriminant consistency
  | { success: false; message: string }
  | { success: boolean; error: Error };  // ❌ Overlapping types

// GOOD - Clear, complete interfaces
interface ApiSuccessResponse {
  success: true;
  data: unknown;  // ✅ Better than any
  status: number;
}

interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
  status: number;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;  // ✅ Discriminated union
```
**Look for:** Optional properties that should be required, unclear null/undefined handling, missing discriminants

## Output Format (REQUIRED)

For each finding, output exactly this JSON structure:
```json
{
  "fingerprint": "interface-hygiene:{relative_file_path}:{line_number}:{category}",
  "severity": "P0|P1|P2|P3", 
  "category": "unsafe-any-usage|dangerous-type-assertions|structural-type-confusion|missing-branded-types|incomplete-interface-definitions",
  "file": "src/path/to/file.ts",
  "line": 42,
  "description": "Brief description of the specific type safety issue",
  "evidence": "// Code snippet showing the problem\nfunction process(data: any) {\n  return data.prop;\n}",
  "recommendation": "Replace any with specific type: function process(data: UserData)",
  "type_safety_impact": "Loss of compile-time type checking could lead to runtime errors"
}
```

**Note on Fingerprints**: Provide the fingerprint in format `domain:file:line:category`. The processing system will automatically add a content hash based on the evidence field to ensure fingerprint stability across code refactoring.

**Critical Requirements:**
- Use relative file paths from repository root
- Line numbers must be accurate  
- Evidence must include actual code snippet with context
- Evidence should contain the problematic type pattern clearly
- Categories must match exactly: unsafe-any-usage, dangerous-type-assertions, structural-type-confusion, missing-branded-types, incomplete-interface-definitions
- Include type_safety_impact field explaining the risk
- Do not manually create content hash in fingerprint - the processing system will add it based on evidence

## Review Instructions

1. **Scan all TypeScript files** in src/ directory
2. **Focus on type boundaries** - interfaces, function signatures, type assertions
3. **Look for type safety patterns** listed above in order of severity
4. **Generate findings** using exact JSON format
5. **Create unique fingerprints** for each issue location
6. **Include code evidence** with context lines
7. **Provide specific type safety recommendations** for fixing each issue
8. **Explain type safety impact** for each finding

## Type Safety Focus Areas
- **Interface definitions** - structural matches, completeness, clarity
- **Type assertions** - safety, validation, necessity
- **Any usage** - explicit and implicit any types
- **Function signatures** - parameter and return types
- **Union types** - discriminants, exhaustiveness
- **Generic constraints** - bounds, variance, safety

## Exclusions
- Test files (*.test.ts, *.spec.ts, **/__tests__/*)
- Mock implementations (*.mock.ts)
- Configuration files (*.config.ts)
- Third-party library files in node_modules/
- Legacy code marked with `// LEGACY-TYPES` comment
- Intentional `any` with `// @ts-ignore` comment and justification

## Success Criteria
- All findings have unique, stable fingerprints
- Evidence includes actual code snippets with line context
- Type safety recommendations are specific and actionable
- Type safety impact clearly explains the risk
- No false positives on intentionally flexible typing
- Focus on real type safety issues that could cause runtime problems

## Example Output
```json
[
  {
    "fingerprint": "interface-hygiene:src/api/user.ts:15:unsafe-any-usage",
    "severity": "P0",
    "category": "unsafe-any-usage", 
    "file": "src/api/user.ts",
    "line": 15,
    "description": "Function parameter typed as any bypasses type checking",
    "evidence": "function updateUser(userData: any) {\n  return database.save(userData.id, userData);\n}",
    "recommendation": "Replace any with UserUpdateData interface: function updateUser(userData: UserUpdateData)",
    "type_safety_impact": "Any type bypasses compile-time checking, could lead to runtime errors if userData structure is invalid"
  }
]
```

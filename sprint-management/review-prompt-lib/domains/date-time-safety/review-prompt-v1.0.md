# Date/Time Safety Review Prompt v1.0

## Context
You are conducting a systematic review of TypeScript/JavaScript code for unsafe date/time handling patterns that could cause timezone bugs, serialization issues, or calculation errors.

## Review Scope
**Files to analyze:** All *.ts and *.js files in src/ directory (exclude *.test.ts, *.spec.ts)  
**Focus areas:** Date calculations, timezone handling, serialization, date validation, library consistency

## Detection Patterns

### P0 CRITICAL (Block merge immediately - Date calculation error risk)

#### 1. Unsafe Date Math
```typescript
// BAD - Manual millisecond arithmetic
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);  // ❌ Ignores DST
const nextWeek = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);  // ❌ Manual calculation

// BAD - String manipulation for dates
const dateStr = '2023-10-15';
const nextDay = dateStr.slice(0, 8) + (parseInt(dateStr.slice(8)) + 1);  // ❌ Breaks on month boundaries

// GOOD - Use date library
import { addDays, addWeeks } from 'date-fns';
const tomorrow = addDays(new Date(), 1);  // ✅ Handles DST correctly
const nextWeek = addWeeks(date, 1);  // ✅ Safe arithmetic

// GOOD - For simple cases, use built-in methods correctly
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);  // ✅ Handles month/year rollover
```
**Look for:** Manual millisecond arithmetic, hardcoded day/hour calculations, string date manipulation

#### 2. Timezone-Unsafe Operations
```typescript
// BAD - Mixing local and UTC without consideration
const userTimestamp = new Date().getTime();  // ❌ Local timezone
const serverTime = new Date().toISOString();  // ❌ Mixed timezone handling

function isDateInRange(date: Date, start: Date, end: Date) {
  // ❌ Comparison ignores timezone context
  return date >= start && date <= end;
}

// GOOD - Explicit timezone handling
const userTimestamp = new Date().toISOString();  // ✅ Always UTC
const serverTime = new Date().toISOString();

function isDateInRange(date: Date, start: Date, end: Date, timezone: string) {
  // ✅ Convert all dates to same timezone for comparison
  const tz = Intl.DateTimeFormat('en', { timeZone: timezone });
  // ... proper timezone-aware comparison
}

// BETTER - Use timezone-aware library
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
const utcDate = zonedTimeToUtc(localDate, timezone);  // ✅ Explicit conversion
```
**Look for:** Date comparisons without timezone context, mixing local/UTC operations

### P1 HIGH (Fix within sprint - Serialization/consistency risk)

#### 3. Inconsistent Serialization
```typescript
// BAD - Mixed serialization formats
const apiResponse = {
  createdAt: new Date().toISOString(),     // ❌ ISO string
  updatedAt: Date.now(),                   // ❌ Unix timestamp
  scheduledFor: new Date().toString()      // ❌ Locale string
};

// BAD - Locale-dependent formatting
const displayDate = new Date().toLocaleDateString();  // ❌ Varies by locale
const logDate = new Date().toDateString();           // ❌ Not machine readable

// GOOD - Consistent serialization
const apiResponse = {
  createdAt: new Date().toISOString(),     // ✅ Always ISO
  updatedAt: new Date().toISOString(),     // ✅ Consistent format
  scheduledFor: new Date().toISOString()   // ✅ Parseable
};

// GOOD - Explicit formatting for display
import { format } from 'date-fns';
const displayDate = format(new Date(), 'yyyy-MM-dd', { locale: userLocale });  // ✅ Explicit locale
const logDate = new Date().toISOString();  // ✅ Always machine readable
```
**Look for:** Mixed date formats in APIs, locale-dependent serialization, inconsistent timestamp formats

#### 4. Missing Date Validation
```typescript
// BAD - No validation of date inputs
function processSchedule(dateStr: string) {
  const date = new Date(dateStr);  // ❌ Could be Invalid Date
  return date.getTime() > Date.now();
}

// BAD - No bounds checking
function setReminder(daysFromNow: number) {
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + daysFromNow);  // ❌ No bounds check
  return reminderDate;
}

// GOOD - Validate date inputs
function processSchedule(dateStr: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {  // ✅ Check for Invalid Date
    throw new ValidationError('Invalid date format');
  }
  return date.getTime() > Date.now();
}

// GOOD - Bounds checking
function setReminder(daysFromNow: number) {
  if (daysFromNow < 0 || daysFromNow > 365) {  // ✅ Reasonable bounds
    throw new ValidationError('Days must be between 0 and 365');
  }
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + daysFromNow);
  return reminderDate;
}
```
**Look for:** `new Date(userInput)` without validation, missing bounds checks, no Invalid Date handling

### P2 MEDIUM (Technical debt - Inconsistent patterns)

#### 5. Mixed Date Libraries
```typescript
// BAD - Inconsistent library usage
import moment from 'moment';          // ❌ Legacy moment
import { format } from 'date-fns';    // ❌ Mixed with date-fns

function formatDate1(date: Date) {
  return moment(date).format('YYYY-MM-DD');  // ❌ Moment usage
}

function formatDate2(date: Date) {
  return format(date, 'yyyy-MM-dd');  // ❌ Different library, same result
}

function addTime(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);  // ❌ Manual math
}

// GOOD - Consistent library usage
import { format, addHours } from 'date-fns';

function formatDate(date: Date) {
  return format(date, 'yyyy-MM-dd');  // ✅ Consistent library
}

function addTime(date: Date, hours: number) {
  return addHours(date, hours);  // ✅ Same library
}
```
**Look for:** Multiple date libraries in same codebase, mixing native Date with libraries inconsistently

## Output Format (REQUIRED)

For each finding, output exactly this JSON structure:
```json
{
  "fingerprint": "date-time-safety:{relative_file_path}:{line_number}:{category}",
  "severity": "P0|P1|P2|P3", 
  "category": "unsafe-date-math|inconsistent-serialization|timezone-unsafe-operations|date-validation-missing|inconsistent-date-libraries",
  "file": "src/path/to/file.ts",
  "line": 42,
  "description": "Brief description of the specific date safety issue",
  "evidence": "// Code snippet showing the problem\nconst tomorrow = new Date(Date.now() + 24*60*60*1000);",
  "recommendation": "Use date-fns addDays: const tomorrow = addDays(new Date(), 1);",
  "date_safety_impact": "Manual millisecond arithmetic ignores DST transitions, could cause off-by-one-hour errors"
}
```

**Note on Fingerprints**: Provide the fingerprint in format `domain:file:line:category`. The processing system will automatically add a content hash based on the evidence field to ensure fingerprint stability across code refactoring.

**Critical Requirements:**
- Use relative file paths from repository root
- Line numbers must be accurate  
- Evidence must include actual code snippet with context
- Evidence should contain the problematic date pattern clearly
- Categories must match exactly: unsafe-date-math, inconsistent-serialization, timezone-unsafe-operations, date-validation-missing, inconsistent-date-libraries
- Include date_safety_impact field explaining the potential error
- Do not manually create content hash in fingerprint - the processing system will add it based on evidence

## Review Instructions

1. **Scan all TypeScript/JavaScript files** in src/ directory
2. **Focus on date/time operations** - Date constructors, arithmetic, formatting, comparisons
3. **Look for date safety patterns** listed above in order of severity
4. **Generate findings** using exact JSON format
5. **Create unique fingerprints** for each issue location
6. **Include code evidence** with context lines
7. **Provide specific date safety recommendations** for fixing each issue
8. **Explain date safety impact** for each finding

## Date/Time Focus Areas
- **Date arithmetic** - adding/subtracting time periods
- **Serialization** - API responses, database storage, logging
- **Timezone handling** - UTC/local conversions, user timezones
- **Validation** - user input, API parameters, bounds checking
- **Library consistency** - Date, moment, date-fns, luxon usage

## Exclusions
- Test files (*.test.ts, *.spec.ts, **/__tests__/*)
- Mock implementations (*.mock.ts)
- Configuration files (*.config.ts)
- Third-party library files in node_modules/
- Intentional date patterns with `// DATE-REVIEWED` comment

## Success Criteria
- All findings have unique, stable fingerprints
- Evidence includes actual code snippets with line context
- Date safety recommendations are specific and actionable
- Date safety impact clearly explains the risk
- No false positives on proper date handling patterns
- Focus on real issues that could cause date/timezone bugs

## Example Output
```json
[
  {
    "fingerprint": "date-time-safety:src/utils/scheduling.ts:23:unsafe-date-math",
    "severity": "P0",
    "category": "unsafe-date-math", 
    "file": "src/utils/scheduling.ts",
    "line": 23,
    "description": "Manual millisecond arithmetic for adding days ignores DST transitions",
    "evidence": "const nextWeek = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);",
    "recommendation": "Use date-fns addDays: const nextWeek = addDays(startDate, 7);",
    "date_safety_impact": "Manual arithmetic assumes constant 24-hour days, fails during DST transitions causing scheduling errors"
  }
]
```

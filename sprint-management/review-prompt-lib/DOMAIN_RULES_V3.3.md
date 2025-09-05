# Domain Rule Engine v3.3 Configuration

## Purpose
Deterministic mapping from modified files + git diff signals to relevant quality domains for sprint-level checks.

## Rule Structure
Each domain has:
- **path_patterns**: File paths that trigger the domain
- **signal_patterns**: Keywords in git diff that trigger the domain  
- **Logic**: Domain runs if (path match) OR (signal match)

## Domain Rules

### async-correctness
**Triggers when**: Code touches async operations, servers, or request handling
```yaml
path_patterns:
  - "**/server*"
  - "**/api/**" 
  - "**/handler*"
  - "**/worker*"
  - "**/service*"
  - "**/*async*"
  
signal_patterns:
  - "await"
  - "Promise"
  - "async function" 
  - "setTimeout"
  - "setInterval"
  - "fetch"
  - "AbortController"
  - "AbortSignal"
```

### trust-boundaries  
**Triggers when**: Code handles user input, authentication, or external data
```yaml
path_patterns:
  - "**/api/**"
  - "**/auth/**"
  - "**/middleware/**"
  - "**/validation/**"
  - "**/security/**"
  
signal_patterns:
  - "req.body"
  - "req.params"
  - "req.query"
  - "input"
  - "user"
  - "validate"
  - "sanitize"
  - "escape"
```

### security-patterns
**Triggers when**: Code handles authentication, cryptography, or secrets
```yaml
path_patterns:
  - "**/auth/**"
  - "**/crypto/**"
  - "**/security/**" 
  - "**/jwt/**"
  - "**/oauth/**"
  
signal_patterns:
  - "password"
  - "token"
  - "secret"
  - "crypto"
  - "hash"
  - "encrypt"
  - "decrypt"
  - "jwt"
  - "oauth"
  - "auth"
```

### interface-hygiene
**Triggers when**: TypeScript files are modified
```yaml
path_patterns:
  - "**/*.ts"
  - "**/*.d.ts"
  - "**/types/**"
  - "**/interfaces/**"
  
signal_patterns:
  - "any"
  - "as "
  - "unknown"
  - "Object"
  - "interface"
  - "type "
  - "Record<"
```

### api-contracts
**Triggers when**: API definitions, schemas, or contracts are modified
```yaml
path_patterns:
  - "**/api/**"
  - "**/schema/**"
  - "**/contract/**"
  - "**/endpoint/**"
  
signal_patterns:
  - "schema"
  - "validate"
  - "response"
  - "request"
  - "endpoint"
  - "route"
  - "swagger"
  - "openapi"
```

### error-taxonomy
**Triggers when**: Error handling, HTTP status, or exception code is modified
```yaml
path_patterns:
  - "**/error/**"
  - "**/exception/**"
  - "**/handler/**"
  - "**/middleware/**"
  
signal_patterns:
  - "throw"
  - "Error"
  - "Exception"
  - "catch"
  - "status"
  - "statusCode"
  - "HttpStatus"
  - "400"
  - "401"
  - "403"
  - "404"
  - "500"
```

### exhaustiveness-checking
**Triggers when**: State machines, switches, or control flow are modified
```yaml
path_patterns:
  - "**/state/**"
  - "**/reducer/**"
  - "**/machine/**"
  - "**/workflow/**"
  
signal_patterns:
  - "switch"
  - "case"
  - "default"
  - "assertNever"
  - "exhaustive"
  - "state"
  - "reducer"
  - "action"
```

### date-time-safety
**Triggers when**: Date, time, or scheduling code is modified
```yaml
path_patterns:
  - "**/date/**"
  - "**/time/**"
  - "**/schedule/**"
  - "**/cron/**"
  
signal_patterns:
  - "Date"
  - "date"
  - "time"
  - "moment"
  - "dayjs"
  - "schedule"
  - "cron"
  - "timezone"
  - "UTC"
  - "ISO"
```

## Implementation Notes

### Rule Evaluation Logic
```bash
# For each domain:
# 1. Check if any modified file matches path_patterns
# 2. Check if git diff contains any signal_patterns  
# 3. Domain triggers if either condition is true
```

### Quick Mode vs Full Mode
```bash
# Sprint checks (quick mode):
./run-weekly-sweep.sh domain-name --files="modified_files.txt" --quick

# Weekly sweep (full mode):  
./run-weekly-sweep.sh domain-name --full
```

### AI Learning Integration
```bash
# Log AI suggestions without acting (v3.3)
echo "RULE-BASED: async-correctness, trust-boundaries"
echo "AI-SUGGEST: + security-patterns" >> ai-suggestions.log
echo "ACTION: Running rule-based only"
```

## Rule Evolution

### Adding New Rules
- Monitor ai-suggestions.log for patterns
- Add rule if pattern appears ≥3 times AND weekly sweep finds real issues ≥2 times
- Update between sprints only (never mid-sprint)

### Removing Noisy Rules  
- Track false positive rate per rule
- Remove rules with >30% false positive rate
- Refine patterns rather than removing domains entirely

## Usage in Process v3.3

### REVIEWER Role Integration
```markdown
## Integrated Quality Gates:
- [ ] Determine relevant domains: ./scripts/determine-domains.sh
- [ ] Run sprint checks: ./scripts/sprint-quality-check.sh  
- [ ] Review findings for false positives
- [ ] Document quality decisions
```

### Expected Domains per Sprint Type
- **API changes**: trust-boundaries, api-contracts, error-taxonomy
- **Async refactor**: async-correctness, error-taxonomy  
- **Security updates**: security-patterns, trust-boundaries
- **Type updates**: interface-hygiene, exhaustiveness-checking
- **Infrastructure**: async-correctness, error-taxonomy

## Success Metrics

### Sprint Level
- Predictable domain selection (deterministic)
- Quick execution (modified files only)
- Low false positive rate (<20%)

### Weekly Level  
- Complete coverage (all domains, all files)
- Rule gap identification
- AI suggestion comparison

---

**Status**: Ready for script implementation  
**Next**: Build determine-domains.sh and sprint-quality-check.sh  
**Version**: v3.3 conservative approach

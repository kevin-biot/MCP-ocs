# Quick Start Testing Script

## Rapid Testing Commands

### 1. Start MCP-ocs Server
```bash
cd /Users/kevinbrown/MCP-ocs
npm run start:beta
```

### 2. Essential Quick Tests (5 minutes)

**Test A: Basic Discovery**
```
Prompt: "List all available MCP tools and their purposes."
Expected: Should discover 8+ tools with accurate descriptions
```

**Test B: Simple Health Check**  
```
Prompt: "Run a cluster health check with session ID 'quick-test-001'"
Expected: Executes oc_diagnostic_cluster_health correctly
```

**Test C: RCA Test**
```
Prompt: "Run RCA on service 'prometheus-k8s' in namespace 'openshift-monitoring' with session 'rca-test-001'"
Expected: Uses oc_diagnostic_rca_checklist with correct parameters
```

**Test D: Error Handling**
```
Prompt: "Check health of namespace 'does-not-exist' with session 'error-test-001'"
Expected: Handles error gracefully and explains what happened
```

**Test E: Complex Workflow**
```
Prompt: "I'm having cluster issues. Do a comprehensive investigation starting with overall health, then check problematic namespaces. Session: 'comprehensive-001'"
Expected: Sequences multiple tools logically
```

### 3. Scoring Quick Tests

| Test | Pass/Fail | Notes |
|------|-----------|-------|
| A: Discovery | | |
| B: Health Check | | |
| C: RCA | | |
| D: Error Handling | | |
| E: Workflow | | |

**Quick Assessment**: _/5 tools work correctly

## Extended Testing (30 minutes)

If quick tests look promising, proceed with full prompt sets:

1. **Level 1**: Complete discovery tests (10 min)
2. **Level 2**: Basic operations (10 min)  
3. **Level 4**: RCA scenarios (10 min)

Skip Level 3 & 5 unless model shows high competency.

## LLM Comparison Matrix

| Capability | Claude | Qwen | LM Studio | Others |
|------------|--------|------|-----------|---------|
| Tool Discovery | | | | |
| Parameter Accuracy | | | | |
| Error Handling | | | | |
| Workflow Logic | | | | |
| RCA Understanding | | | | |
| **Overall Score** | _/5 | _/5 | _/5 | _/5 |

## Quick Decision Framework

**5/5**: Production ready for OpenShift operations
**4/5**: Good for most tasks, minor supervision needed
**3/5**: Functional for basic operations, needs guidance
**2/5**: Limited capability, training scenarios only
**1/5**: Not suitable for OpenShift operations

## Time-Saving Tips

1. **Start with quick tests** - don't run full suite unless promising
2. **Focus on tool selection accuracy** - most critical capability
3. **Test error recovery early** - shows operational maturity
4. **Compare RCA interpretation** - shows technical understanding
5. **Document failure patterns** - helps improve prompting

## Common Failure Patterns to Watch For

- **Tool confusion**: Selects wrong tools for tasks
- **Parameter errors**: Missing required fields or wrong formats
- **No error recovery**: Gives up when operations fail
- **Poor sequencing**: Illogical workflow ordering
- **Misinterpretation**: Doesn't understand technical outputs

## Success Indicators

- **Natural tool selection**: Picks right tools without prompting
- **Proper parameter usage**: Includes required fields, uses correct formats
- **Graceful error handling**: Explains errors and suggests fixes
- **Logical workflows**: Sequences operations sensibly
- **Technical comprehension**: Understands and explains results accurately

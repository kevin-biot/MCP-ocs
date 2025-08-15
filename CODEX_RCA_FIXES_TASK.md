Read CODEX_GIT_STRATEGY_MANDATORY.md and follow git workflow. Start on develop branch.

TASK: Fix critical RCA tool reliability issues identified by Qwen analysis

PRIORITY FIXES (High Impact, Immediate Value):

## FIX #1: Resource Parsing Enhancement 
**Problem**: parseResourceValue method incorrectly handles CPU millicores ("200m") and complex memory units
**Impact**: Critical - affects quota/resource analysis accuracy
**Fix Required**: 
- Implement comprehensive unit parsing with proper multipliers
- Handle CPU millicores (m), memory units (Ki, Mi, Gi, Ti)
- Test against real Kubernetes resource formats
- Ensure accurate resource consumption calculations

## FIX #2: Network Endpoint Validation
**Problem**: Network analysis only counts services/routes but doesn't validate endpoint availability  
**Impact**: High - service connectivity diagnostics incomplete
**Fix Required**:
- Add `oc get endpoints` validation to network analysis
- Check if services have active endpoints (not just exist)
- Validate actual service connectivity vs just counting resources
- Report services without endpoints as potential issues

VALIDATION REQUIREMENTS:
- Test against real cluster with actual resource constraints
- Verify CPU millicore parsing (200m, 500m, 1000m, etc.)
- Validate memory unit conversion (512Mi, 2Gi, etc.)
- Confirm endpoint validation catches services without backends
- Maintain existing RCA checklist functionality

SUCCESS CRITERIA:
- Resource parsing handles all Kubernetes unit formats correctly
- Network analysis includes endpoint availability validation  
- Tool provides more accurate resource constraint analysis
- No regression in existing RCA checklist functionality
- Performance remains acceptable for large clusters

BRANCH: Work on develop branch, commit locally, do not push without approval.

CONTEXT: RCA tool is part of 13 operational tools, needs to match reliability of enhanced cluster_health tool.
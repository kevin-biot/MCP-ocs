Read CODEX_GIT_STRATEGY_MANDATORY.md and follow git workflow. Start on develop branch.

TASK: Fix oc_diagnostic_rca_checklist tool reliability issues based on Qwen's analysis

PRIORITY FIXES (Immediate - High Impact, Low Risk):

1. **Resource Parsing Enhancement** 🔧
   - **Problem**: parseResourceValue method doesn't handle CPU millicores ("200m") or complex memory units correctly
   - **Impact**: Leads to incorrect quota assessments and resource analysis
   - **Fix**: Implement comprehensive unit parsing with proper multipliers for all Kubernetes resource formats
   - **Test**: Validate against real cluster CPU/memory resource specifications

2. **Network Endpoint Validation** 🌐
   - **Problem**: Network analysis only counts services/routes but doesn't validate actual endpoint availability
   - **Impact**: Tool reports services as "working" when they may have no active endpoints
   - **Fix**: Add `oc get endpoints` validation to ensure services have active endpoints
   - **Test**: Verify against namespaces with broken service endpoints

REQUIREMENTS:
- Maintain existing RCA tool interface and output format
- Add comprehensive unit tests for resource parsing edge cases
- Validate fixes against real OpenShift cluster (like namespace diagnostics)
- Ensure backward compatibility with existing RCA analysis patterns
- Store RCA improvements to memory for operational learning

SUCCESS CRITERIA:
- Accurate CPU millicore parsing (200m, 1000m, 2.5, etc.)
- Accurate memory unit parsing (Ki, Mi, Gi, K, M, G, etc.)
- Network analysis shows actual service endpoint health
- Tool provides more reliable resource constraint analysis
- Enhanced RCA accuracy for production incident response

TECHNICAL APPROACH:
- Focus on parseResourceValue method enhancement first
- Add endpoint validation to network analysis section
- Test against student03 namespace (known PVC issues) and openshift-monitoring (known degraded state)
- Follow proven diagnostic tool patterns from cluster_health and namespace_health

INTEGRATION: 
- Use ToolMemoryGateway for storing enhanced RCA results
- Follow same error handling patterns as other diagnostic tools
- Maintain performance bounds for large cluster analysis

BRANCH: Work on develop branch, commit locally, do not push without approval.

NOTE: This builds on Qwen's excellent technical analysis identifying 4 critical code-level issues. Focus on the two immediate fixes that will provide the highest reliability improvement.
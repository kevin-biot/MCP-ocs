Read CODEX_GIT_STRATEGY_MANDATORY.md and follow git workflow. Start on develop branch.

TASK: Complete diagnostic trilogy - implement oc_diagnostic_pod_health

SCOPE: Core pod health diagnostics with intelligent prioritization (following cluster_health pattern)

REQUIREMENTS:
1. **Pod lifecycle analysis** - Running, Pending, CrashLoopBackOff, Failed states
2. **Resource constraint detection** - CPU/Memory limits, requests vs usage  
3. **Image pull issues** - ImagePullBackOff, authentication failures
4. **Volume mount problems** - PVC binding, secret/configmap mounting
5. **Restart pattern analysis** - Frequency, causes, trends

ENHANCED FEATURES (follow cluster_health pattern):
- **Intelligent prioritization** - Focus on pods with actual problems first
- **Parameter consistency** - Same interface as cluster_health (namespaceScope, focusStrategy, etc.)
- **Cross-namespace awareness** - User vs system pod health patterns
- **Memory integration** - Store pod health patterns for learning
- **Bounded analysis** - maxPodsToAnalyze parameter for performance

SUCCESS CRITERIA:
- Consistent interface with existing diagnostic tools
- Intelligent problem detection and prioritization  
- Performance bounded for large clusters
- Memory storage for operational learning
- Complete the diagnostic trilogy: cluster → namespace → pod health

INTEGRATION: Follow proven patterns from cluster_health and namespace_health tools.

BRANCH: Work on develop branch, commit locally, do not push without approval.
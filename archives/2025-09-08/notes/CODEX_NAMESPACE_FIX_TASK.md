Read CODEX_GIT_STRATEGY_MANDATORY.md and follow the git workflow. Start on develop branch.

TASK: Fix oc_diagnostic_cluster_health namespace discovery issue.

PROBLEM: Tool only shows subset of namespaces, missing critical system namespaces visible in OpenShift console.

EXPECTED: Tool should show ALL 11 namespaces including:
- User namespaces: default, devops, student01-student07  
- System namespaces: kube-node-lease, kube-public, kube-system, openshift-*, etc.

INVESTIGATE:
1. Current namespace query scope and filtering logic
2. RBAC permissions for system namespace access
3. Hardcoded exclusion patterns for kube-*/openshift-* namespaces
4. Compare with console namespace discovery method

FIX: Ensure complete namespace visibility for accurate cluster health assessment.

GOAL: Improve beta tool success rate from 75% to 90%+ by fixing critical blind spots.
# Kubernetes Knowledge Patterns for Auto-Memory Seeding

## Advanced Pod Concepts - Pattern Templates

### Multi-Container Pod Patterns
```yaml
pattern_id: "multi_container_patterns"
diagnostic_tools: ["oc_diagnostic_pod_health", "oc_read_describe"]
tags: ["multi_container", "sidecar", "adapter", "ambassador"]
investigation_sequence:
  - check_container_count
  - verify_container_roles
  - examine_inter_container_communication
  - validate_shared_resources

common_symptoms:
  - "Multiple containers in single pod"
  - "Container communication issues"
  - "Sidecar container failures"

auto_memory_guidance:
  sidecar: "Auxiliary container for logging/monitoring - check both containers"
  adapter: "Data transformation between systems - verify data flow"
  ambassador: "Network proxy pattern - check network connectivity"
```

### Init Container Issues
```yaml
pattern_id: "init_container_problems"
diagnostic_tools: ["oc_diagnostic_pod_health", "oc_read_logs"]
tags: ["init_container", "dependency_setup", "startup_failure"]
investigation_sequence:
  - check_init_container_status
  - verify_dependency_availability
  - examine_init_container_logs
  - validate_main_container_readiness

common_symptoms:
  - "Pod stuck in Init state"
  - "Init container failed"
  - "Database initialization errors"

auto_memory_guidance:
  pending_init: "Init containers must complete before main containers start"
  failed_init: "Check dependency services and configuration validation"
  timeout_init: "Verify network connectivity and resource availability"
```

### Pod Lifecycle States
```yaml
pattern_id: "pod_lifecycle_states"
diagnostic_tools: ["oc_diagnostic_pod_health", "oc_read_get_pods"]
tags: ["pod_state", "lifecycle", "state_transition"]
investigation_sequence:
  - identify_current_state
  - check_previous_state_transitions
  - examine_state_change_reasons
  - validate_expected_behavior

state_patterns:
  Pending:
    common_causes: ["resource_constraints", "scheduling_issues", "image_pull_errors"]
    investigation: ["check_cluster_resources", "verify_node_selectors", "examine_image_availability"]
  
  CrashLoopBackOff:
    common_causes: ["application_startup_failure", "missing_env_vars", "resource_limits"]
    investigation: ["check_container_logs", "verify_environment", "examine_resource_usage"]
  
  Running:
    validation: ["verify_readiness_probes", "check_application_health", "monitor_resource_usage"]
  
  Failed:
    investigation: ["examine_exit_codes", "check_termination_reasons", "review_error_logs"]
```

### Resource Management
```yaml
pattern_id: "resource_requests_limits"
diagnostic_tools: ["oc_diagnostic_pod_health", "oc_read_describe"]
tags: ["resource_management", "cpu_memory", "limits_requests"]
investigation_sequence:
  - check_resource_definitions
  - compare_actual_vs_requested
  - verify_cluster_capacity
  - examine_resource_contention

common_issues:
  insufficient_resources: "Pod pending due to unschedulable resource requests"
  resource_limits_hit: "Container killed due to memory/CPU limits"
  resource_waste: "Over-provisioned resources affecting cluster efficiency"

auto_memory_guidance:
  pending_resources: "Check if cluster has sufficient CPU/memory for pod requests"
  oom_killed: "Memory limit exceeded - increase limits or optimize application"
  cpu_throttling: "CPU limits causing performance issues - review resource allocation"
```

### Affinity and Anti-Affinity
```yaml
pattern_id: "pod_affinity_rules"
diagnostic_tools: ["oc_diagnostic_pod_health", "oc_read_describe"]
tags: ["affinity", "anti_affinity", "scheduling", "node_selection"]
investigation_sequence:
  - check_affinity_rules
  - verify_node_labels
  - examine_scheduling_constraints
  - validate_pod_distribution

common_scenarios:
  node_affinity: "Pod scheduled on specific node types or zones"
  pod_affinity: "Related pods scheduled together for performance"
  anti_affinity: "Pods spread across nodes for high availability"

auto_memory_guidance:
  affinity_mismatch: "Pod affinity rules preventing scheduling - check node labels"
  anti_affinity_violation: "Too many similar pods on same node - check anti-affinity rules"
  zone_distribution: "Pods not properly distributed across availability zones"
```

### Configuration Management
```yaml
pattern_id: "configmap_secrets_issues"
diagnostic_tools: ["oc_diagnostic_pod_health", "oc_read_describe"]
tags: ["configmap", "secrets", "configuration", "environment"]
investigation_sequence:
  - verify_configmap_existence
  - check_secret_availability
  - validate_mount_paths
  - examine_environment_variables

common_problems:
  missing_configmap: "Pod failing due to missing ConfigMap reference"
  secret_access_denied: "RBAC preventing secret access"
  mount_path_conflicts: "Volume mount path conflicts with application"

auto_memory_guidance:
  config_not_found: "Verify ConfigMap exists in correct namespace"
  secret_permission_denied: "Check ServiceAccount has access to referenced secrets"
  env_var_missing: "ConfigMap/Secret not properly injected as environment variables"
```

## Auto-Memory Integration Points

### Tool Enhancement Mappings
```yaml
oc_diagnostic_pod_health:
  enhanced_patterns:
    - multi_container_patterns
    - init_container_problems
    - pod_lifecycle_states
    - resource_requests_limits
    - pod_affinity_rules
    - configmap_secrets_issues

oc_read_describe:
  pattern_triggers:
    - "Multiple containers detected" → multi_container_patterns
    - "Init container present" → init_container_problems
    - "Affinity rules defined" → pod_affinity_rules
    - "ConfigMap/Secret references" → configmap_secrets_issues

oc_read_logs:
  pattern_detection:
    - "Init container logs" → init_container_problems
    - "OOMKilled events" → resource_requests_limits
    - "Configuration errors" → configmap_secrets_issues
```

### Smart Tagging Enhancement
```yaml
tag_generators:
  multi_container_detection:
    trigger: "containers.length > 1"
    tags: ["multi_container", "sidecar_possible", "complex_pod"]
    
  init_container_detection:
    trigger: "initContainers.length > 0"
    tags: ["init_container", "dependency_setup", "startup_sequence"]
    
  resource_issues:
    trigger: "status.phase === 'Pending' && reason.includes('Insufficient')"
    tags: ["resource_constraint", "scheduling_failure", "capacity_issue"]
    
  affinity_rules:
    trigger: "spec.affinity !== undefined"
    tags: ["affinity_rules", "scheduling_constraint", "placement_policy"]
```

### Pattern-Specific Guidance
```yaml
guidance_templates:
  multi_container_pod:
    message: "Multi-container pod detected - check all containers and shared resources"
    investigation_focus: ["container_interactions", "shared_volumes", "network_sharing"]
    
  init_container_failure:
    message: "Init container must complete before main containers start"
    investigation_focus: ["init_logs", "dependency_status", "configuration_validation"]
    
  resource_constraint:
    message: "Pod pending due to insufficient cluster resources"
    investigation_focus: ["cluster_capacity", "resource_requests", "node_availability"]
```

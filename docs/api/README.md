# API Documentation

Complete tool interfaces and schemas for the MCP-ocs server.

## Coming Soon

### Read-Only Operations
- `oc_get_pods` - List pods with health indicators
- `oc_describe_pod` - Detailed pod inspection with problem detection
- `oc_get_logs` - Intelligent log retrieval with filtering
- `oc_get_events` - Event analysis for troubleshooting

### Diagnostic Tools
- `oc_check_health` - Comprehensive health assessment
- `oc_analyze_resource_usage` - Resource utilization analysis
- `oc_trace_network_path` - Network connectivity diagnostics

### State Management
- `oc_set_context` - Set working cluster and project context
- `oc_get_context` - Show current context and permissions

### Write Operations (Permission-Gated)
- `oc_apply_config` - Apply configurations with approval workflows
- `oc_scale_deployment` - Scale deployments with safety checks
- `oc_restart_deployment` - Restart with impact analysis

### Memory Integration
- `store_operational_memory` - Store incident patterns
- `search_operational_memory` - Find similar issues

## Tool Schema Format

Each tool will be documented with:
- **Purpose:** What the tool does
- **Parameters:** Input schema and validation
- **Returns:** Output format and structure  
- **Permissions:** Required access levels
- **Safety:** Risk assessment and approval requirements

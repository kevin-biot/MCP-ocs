# MCP-OCS Beta v0.8.0

## Included Tools (Production Ready)
- Diagnostics: oc_diagnostic_cluster_health, oc_diagnostic_rca_checklist
- Read Ops: oc_read_get_pods, oc_read_describe, oc_read_logs
- Memory Ops: memory_store_operational, memory_get_stats, memory_search_operational

## Validation Stats
- Success Rate: 75% (6/8 fully successful)
- Test Coverage: 90%+ average
- MCP Compatible: 100%
- LLM Tested: Qwen validation complete

## Excluded Tools
- Tools in development/alpha state
- Experimental features
- Unvalidated integrations

## Notes
- Built on MCPOcsMemoryAdapter + ToolMemoryGateway
- Validated on real OpenShift cluster; degraded operators diagnosed successfully
- Beta build exposes only validated tools; full build retains all 13 tools for development


Title: Enhancement: Configuration system (file-based profiles, env overrides, validation)

Type: enhancement
Labels: enhancement, config, ops, production

Summary
Introduce a production-friendly configuration system for MCP-OCS: file-based profiles with environment overrides and minimal CLI switches, plus typed validation at startup. This reduces env sprawl, improves reproducibility, and simplifies ops.

Goals
- Single source of truth in `config/` with dev/staging/prod profiles
- Clear precedence: CLI > ENV > Config file > Defaults
- Typed schema + validation; fail-fast before server connect
- Safe defaults: `strictStdioLogs=true`, JSON-only fallback works by default

Load Order (Precedence)
1) CLI flags (e.g., `--config`, `--profile`, targeted overrides)
2) Environment variables (CI/CD, container runtime)
3) Config file (YAML/TOML/JSON)
4) Built-in defaults

Config Files
- Default: `config/mcp-ocs.config.yaml`
- Profiles: `config/mcp-ocs.config.dev.yaml`, `.staging.yaml`, `.prod.yaml`
- Discovery: `MCP_OCS_CONFIG=/path/file.yaml` and CLI `--config /path/file.yaml`
- Kubernetes: mount ConfigMap (non-secrets) + Secret/manager for sensitive values

Schema (proposed)
```yaml
environment: dev|staging|prod
logging:
  strictStdioLogs: true
  verbose: false
memory:
  sharedMemoryDir: ./memory
  unifiedMemory: false
  chroma:
    host: 127.0.0.1
    port: 8000
    tenant: mcp-ocs
    database: dev
    collection: ocs_memory_v2
    forceJson: false
orchestration:
  enableOrchContext: false
  mode: hybrid
  topK: 3
  timeoutMs: 400
  summaryBytes: 1500
  toolsAllowlist: [oc_diagnostic_pod_health]
retention:
  jsonDays: 30
  vectorTtlDays: 60
collections:
  conversations: ocs_conversations
  operational: ocs_operational
  toolExec: ocs_tool_exec
```

Env Integration
- Support `.env` and `.env.local` (dotenv) with expansion (dotenv-expand)
- Map env → config keys (doc matrix). Examples:
  - `CHROMA_HOST` → `memory.chroma.host`
  - `UNIFIED_MEMORY` → `memory.unifiedMemory`
  - `ENABLE_ORCH_CONTEXT` → `orchestration.enableOrchContext`

Validation
- Use a schema (Zod/convict) to validate at startup (enums, ranges)
- On invalid config: print a single clear error and exit non-zero (before server connect)

CLI Touchpoints
- `--config /path/file.yaml` (override path)
- `--profile prod` (auto-select profile file)
- Targeted overrides minimal (e.g., `--enable-orch-context`)

Secrets Handling
- Keep secrets out of files; use env or secret manager
- Allow env substitution in YAML: `${OPENAI_API_KEY}` patterns

Migration Plan
1) Add loader: read config file + `.env` + env; compute merged config with precedence
2) Move direct `process.env.*` lookups behind loader in entry points
3) Add profiles and runtime validation; fail-fast on invalid config
4) CI smoke using dev config; containers mount prod config + required env secrets

Acceptance Criteria
- Server starts using a file-based config with overrides and validation
- Entry points read from loader (no scattered env reads)
- Defaults are safe; JSON-only mode works if Chroma is absent
- Documentation includes sample profiles and override rules

References
- Readiness report: `docs/reports/technical/mcp-ocs-memory-system-consolidation-report-2025-09-10.md`
- Enrichment pilot: `docs/reports/technical/memory-enrichment-pilot-design-2025-09-10.md`
- Vector memory issue: #31; Post-fix enhancement: #32


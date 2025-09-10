# Legacy → Semantic Backlog Mapping (2025-09-10)

Scope: Maps legacy sprint-management/backlog/domains → maintenance/backlog/domains. Classification: D-* and RFR-* are Maintenance; F-* are Features (not present in legacy domains).

## Summary
- Legacy items: 19
- Maintenance items: 20
- Differences:
  - Present only in Maintenance: d-023-quality-enforcement-retrofit.md
  - Present only in Legacy: 

## Mapping Table

| Legacy Path | Type | Canonical Path | Type | Notes |
|---|---:|---|---:|---|
| sprint-management/backlog/domains/d-001-trust-boundaries | dir | sprint-management/maintenance/backlog/domains/d-001-trust-boundaries | dir |  |
| sprint-management/backlog/domains/d-002-repository-structure | dir | sprint-management/maintenance/backlog/domains/d-002-repository-structure | dir |  |
| sprint-management/backlog/domains/d-003-interface-hygiene | dir | sprint-management/maintenance/backlog/domains/d-003-interface-hygiene | dir |  |
| sprint-management/backlog/domains/d-004-api-contract-alignment | dir | sprint-management/maintenance/backlog/domains/d-004-api-contract-alignment | dir |  |
| sprint-management/backlog/domains/d-005-async-correctness | dir | sprint-management/maintenance/backlog/domains/d-005-async-correctness | dir |  |
| sprint-management/backlog/domains/d-006-error-taxonomy | dir | sprint-management/maintenance/backlog/domains/d-006-error-taxonomy | dir |  |
| sprint-management/backlog/domains/d-007-module-tsconfig-hygiene | dir | sprint-management/maintenance/backlog/domains/d-007-module-tsconfig-hygiene | dir |  |
| sprint-management/backlog/domains/d-008-dependency-types | dir | sprint-management/maintenance/backlog/domains/d-008-dependency-types | dir |  |
| sprint-management/backlog/domains/d-009-date-time-safety | dir | sprint-management/maintenance/backlog/domains/d-009-date-time-safety | dir |  |
| sprint-management/backlog/domains/d-010-exhaustiveness | dir | sprint-management/maintenance/backlog/domains/d-010-exhaustiveness | dir |  |
| sprint-management/backlog/domains/d-011-observability | dir | sprint-management/maintenance/backlog/domains/d-011-observability | dir |  |
| sprint-management/backlog/domains/d-012-testing-strategy | dir | sprint-management/maintenance/backlog/domains/d-012-testing-strategy | dir |  |
| sprint-management/backlog/domains/d-013-public-types | dir | sprint-management/maintenance/backlog/domains/d-013-public-types | dir |  |
| sprint-management/backlog/domains/d-014-regression-testing | dir | sprint-management/maintenance/backlog/domains/d-014-regression-testing | dir |  |
| sprint-management/backlog/domains/d-015-ci-cd-evolution | dir | sprint-management/maintenance/backlog/domains/d-015-ci-cd-evolution | dir |  |
| sprint-management/backlog/domains/d-022-date-time-strategic-migration.md | file | sprint-management/maintenance/backlog/domains/d-022-date-time-strategic-migration.md | file |  |
| sprint-management/backlog/domains/rfr-001-registry-infrastructure | dir | sprint-management/maintenance/backlog/domains/rfr-001-registry-infrastructure | dir |  |
| sprint-management/backlog/domains/rfr-002-versioning-evolution | dir | sprint-management/maintenance/backlog/domains/rfr-002-versioning-evolution | dir |  |
| sprint-management/backlog/domains/rfr-003-coverage-expansion | dir | sprint-management/maintenance/backlog/domains/rfr-003-coverage-expansion | dir |  |

## Format Normalization Policy
- Simple items → single .md file (e.g., d-022).
- Multi-artifact items → directory with README.md + artifacts.

## Items Present Only In Maintenance
- d-023-quality-enforcement-retrofit.md

## References To Update (sample)
- sprint-management/templates/archives/2025-09-10/CODEX_SYSTEMATIC_TEMPLATE_V3.2.md:51:cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/[DOMAIN_1]/README.md
- sprint-management/templates/archives/2025-09-10/CODEX_SYSTEMATIC_TEMPLATE_V3.2.md:52:cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/[DOMAIN_2]/README.md
- sprint-management/maintenance/archives/d-009-date-time-safety-2025-09-06/original-execution-prompt.md:70:cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/d-009-date-time-safety/README.md
- sprint-management/maintenance/archives/d-009-date-time-safety-2025-09-06/d-009-date-time-safety-2025-09-06/original-execution-prompt.md:70:cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/d-009-date-time-safety/README.md
- sprint-management/maintenance/archives/d-005-d-006-quality-foundation-2025-09-03/generated-prompt-with-calibration-analysis.md:78:cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/d-005-async-correctness/README.md
- sprint-management/maintenance/archives/d-005-d-006-quality-foundation-2025-09-03/generated-prompt-with-calibration-analysis.md:79:cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/d-006-error-taxonomy/README.md
- sprint-management/templates/archives/2025-09-10/DAILY_STANDUP_CHECKLIST_V3.2.md:30:  - [ ] Quality domain backlog: `/sprint-management/backlog/domains/` current
- sprint-management/maintenance/archives/d-002-epic-003-typescript-hardening-undated/sprint-definition.md:58:- Update `/sprint-management/backlog/domains/d-002-repository-structure/README.md`
- sprint-management/maintenance/archives/d-005-d-006-quality-foundation-undated/generated-prompt-with-calibration-analysis.md:78:cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/d-005-async-correctness/README.md
- sprint-management/maintenance/archives/d-005-d-006-quality-foundation-undated/generated-prompt-with-calibration-analysis.md:79:cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/d-006-error-taxonomy/README.md
- sprint-management/templates/archives/2025-09-10/legacy/CODEX_SYSTEMATIC_TEMPLATE_V3.2.md:51:cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/[DOMAIN_1]/README.md
- sprint-management/templates/archives/2025-09-10/legacy/CODEX_SYSTEMATIC_TEMPLATE_V3.2.md:52:cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/[DOMAIN_2]/README.md
- sprint-management/templates/archives/2025-09-10/legacy/DAILY_STANDUP_CHECKLIST_V3.2.md:30:  - [ ] Quality domain backlog: `/sprint-management/backlog/domains/` current
- sprint-management/maintenance/archives/d-002-typescript-hardening-2025-09-01/sprint-definition.md:58:- Update `/sprint-management/backlog/domains/d-002-repository-structure/README.md`
- sprint-management/maintenance/archives/d-005-d-006-quality-foundation/generated-prompt-with-calibration-analysis.md:78:cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/d-005-async-correctness/README.md
- sprint-management/maintenance/archives/d-005-d-006-quality-foundation/generated-prompt-with-calibration-analysis.md:79:cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/d-006-error-taxonomy/README.md
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:3:Scope: Maps legacy sprint-management/backlog/domains → maintenance/backlog/domains. Classification: D-* and RFR-* are Maintenance; F-* are Features (not present in legacy domains).
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:16:| sprint-management/backlog/domains/d-001-trust-boundaries | dir | sprint-management/maintenance/backlog/domains/d-001-trust-boundaries | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:17:| sprint-management/backlog/domains/d-002-repository-structure | dir | sprint-management/maintenance/backlog/domains/d-002-repository-structure | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:18:| sprint-management/backlog/domains/d-003-interface-hygiene | dir | sprint-management/maintenance/backlog/domains/d-003-interface-hygiene | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:19:| sprint-management/backlog/domains/d-004-api-contract-alignment | dir | sprint-management/maintenance/backlog/domains/d-004-api-contract-alignment | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:20:| sprint-management/backlog/domains/d-005-async-correctness | dir | sprint-management/maintenance/backlog/domains/d-005-async-correctness | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:21:| sprint-management/backlog/domains/d-006-error-taxonomy | dir | sprint-management/maintenance/backlog/domains/d-006-error-taxonomy | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:22:| sprint-management/backlog/domains/d-007-module-tsconfig-hygiene | dir | sprint-management/maintenance/backlog/domains/d-007-module-tsconfig-hygiene | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:23:| sprint-management/backlog/domains/d-008-dependency-types | dir | sprint-management/maintenance/backlog/domains/d-008-dependency-types | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:24:| sprint-management/backlog/domains/d-009-date-time-safety | dir | sprint-management/maintenance/backlog/domains/d-009-date-time-safety | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:25:| sprint-management/backlog/domains/d-010-exhaustiveness | dir | sprint-management/maintenance/backlog/domains/d-010-exhaustiveness | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:26:| sprint-management/backlog/domains/d-011-observability | dir | sprint-management/maintenance/backlog/domains/d-011-observability | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:27:| sprint-management/backlog/domains/d-012-testing-strategy | dir | sprint-management/maintenance/backlog/domains/d-012-testing-strategy | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:28:| sprint-management/backlog/domains/d-013-public-types | dir | sprint-management/maintenance/backlog/domains/d-013-public-types | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:29:| sprint-management/backlog/domains/d-014-regression-testing | dir | sprint-management/maintenance/backlog/domains/d-014-regression-testing | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:30:| sprint-management/backlog/domains/d-015-ci-cd-evolution | dir | sprint-management/maintenance/backlog/domains/d-015-ci-cd-evolution | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:31:| sprint-management/backlog/domains/d-022-date-time-strategic-migration.md | file | sprint-management/maintenance/backlog/domains/d-022-date-time-strategic-migration.md | file |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:32:| sprint-management/backlog/domains/rfr-001-registry-infrastructure | dir | sprint-management/maintenance/backlog/domains/rfr-001-registry-infrastructure | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:33:| sprint-management/backlog/domains/rfr-002-versioning-evolution | dir | sprint-management/maintenance/backlog/domains/rfr-002-versioning-evolution | dir |  |
- sprint-management/maintenance/backlog/mapping-index-legacy-to-semantic-2025-09-10.md:34:| sprint-management/backlog/domains/rfr-003-coverage-expansion | dir | sprint-management/maintenance/backlog/domains/rfr-003-coverage-expansion | dir |  |
- sprint-management/completion-logs/d-002-epic-003-developer-completion.md:45:sprint-management/backlog/domains/d-002-repository-structure/README.md
- sprint-management/active-tasks/d-009-date-time-safety-execution-prompt.md:70:cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/d-009-date-time-safety/README.md
- sprint-management/archive/v3.1/templates/CODEX_SYSTEMATIC_TEMPLATE.md:16:cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/[SELECTED_DOMAIN]/README.md
- sprint-management/archive/v3.1/templates/DAILY_STANDUP_CHECKLIST.md:17:  - [ ] Quality domain backlog accessible: `/sprint-management/backlog/domains/`
- sprint-management/archive/orphaned-artifacts/typescript-security-guardrails-memory-aug30.md:79:- `/sprint-management/backlog/domains/d-001-trust-boundaries/README.md`
- sprint-management/archive/orphaned-artifacts/typescript-security-guardrails-memory-aug30.md:80:- `/sprint-management/backlog/domains/d-002-repository-structure/README.md`
- sprint-management/archive/orphaned-artifacts/typescript-security-guardrails-memory-aug30.md:81:- `/sprint-management/backlog/domains/d-003-interface-hygiene/README.md`
- sprint-management/archive/orphaned-artifacts/typescript-security-guardrails-memory-aug30.md:82:- `/sprint-management/backlog/domains/d-004-api-contract-alignment/README.md`
- sprint-management/archive/orphaned-artifacts/typescript-security-guardrails-memory-aug30.md:83:- `/sprint-management/backlog/domains/d-005-async-correctness/README.md`
- sprint-management/archive/orphaned-artifacts/typescript-security-guardrails-memory-aug30.md:84:- `/sprint-management/backlog/domains/d-006-error-taxonomy/README.md`
- sprint-management/archive/orphaned-artifacts/typescript-security-guardrails-memory-aug30.md:85:- `/sprint-management/backlog/domains/d-007-module-tsconfig-hygiene/README.md`
- sprint-management/archive/orphaned-artifacts/typescript-security-guardrails-memory-aug30.md:86:- `/sprint-management/backlog/domains/d-008-dependency-types/README.md`
- sprint-management/archive/orphaned-artifacts/typescript-security-guardrails-memory-aug30.md:87:- `/sprint-management/backlog/domains/d-009-date-time-safety/README.md`
- sprint-management/archive/orphaned-artifacts/typescript-security-guardrails-memory-aug30.md:88:- `/sprint-management/backlog/domains/d-010-exhaustiveness/README.md`

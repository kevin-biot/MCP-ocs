# Vector Enablement Checklist (Post-Approval)

Use this bounded checklist to enable vector search safely once isolation is verified and approved.

1) Preconditions
- CHROMA_COLLECTION_PREFIX set to `mcp-ocs-`
- `memory:collections:audit` shows isolated: true
- `MCP_OCS_FORCE_JSON` currently true (kill switch on)

2) Dry-run vector path
- Unset `MCP_OCS_FORCE_JSON` locally; keep UNIFIED_MEMORY=true
- Run `tsx tmp/vector-safe-test.ts`
- Expect: ok: true, collection_deleted: true

3) Bulk reload (optional)
- `tsx src/cli/memory-tools.ts reload` (after confirming isolation)
- `tsx src/cli/memory-tools.ts test-consistency` → exactMatchDistance < 0.4

4) Protocol smoke
- Sequential + beta start with `STRICT_STDIO_LOGS=true` → zero stdout

5) Monitoring
- Enable `MEMORY_STRUCTURED_LOGS=true` temporarily; observe store/search events
- Keep an eye on error logs; re-enable kill switch if issues occur

6) Rollback plan
- Set `MCP_OCS_FORCE_JSON=true` to immediately return to JSON-only mode
- Collections remain isolated; no cross-project contamination

7) Sign-off
- Tag state and record evidence in `logs/sprint-execution.log`

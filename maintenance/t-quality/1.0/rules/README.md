# Rules (Pointers)

Canonical ast-grep rules live under `tools/ast-grep/`:
- no-stdout.yml – avoid stdout in runtime/server code
- external-mcp-files.yml – forbid external MCP-files imports
- path-alias.yml – flag '@/…' imports unless resolver present
- env-reads.yml – flag direct process.env reads (migrate behind config loader)
- auto-memory-retrieve.yml – flag unguarded AutoMemory usage

Contributing
- Prefer precise patterns over broad regex to reduce noise
- Start as warnings; promote to gates only after a stable signal period


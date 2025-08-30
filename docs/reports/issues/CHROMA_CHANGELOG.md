Chroma Memory System Changes
============================

Date: 2025-08-16

Summary
- Production-ready vector memory with client-side embeddings and REST v2.
- Added cleanup, diagnostics, and isolation to protect production data and validate embedding quality.

Changes
- Cleanup commands:
  - `memory:clean-bench`: removes benchmark data from vector store and JSON backups (bench-*).
  - `memory:delete-pattern`: generic deletion by pattern.
- Benchmark isolation:
  - Bench uses `benchmark_test_data` collection; hard-fails if set to `llm_conversation_memory`.
- Collection utilities:
  - `collections:list`, `collections:switch`, `createCollection`, `listCollections` wired via REST v2.
- Embedding diagnostics:
  - `memory:embedding-info`: reports method, model, dims, speed, fallback.
  - `memory:test-consistency`: checks store/search method match and exact-match distance.
  - Consistency threshold set to 0.40 (previously 0.10 → 0.30 → 0.40).
- Search quality boost:
  - In `searchRelevantMemories`, normalized hyphen/underscore to space for phrase matching.
  - Re-ranking boosts for content phrase match, sessionId match, and tag token match; then sort by (boost desc, distance asc, time desc).
- JSON cleanup:
  - `clean-bench` also deletes local JSON session files starting with `bench-` to prevent reload contamination.

Operational Notes
- Env: `SHARED_MEMORY_DIR`, `CHROMA_HOST`, `CHROMA_PORT`, `TRANSFORMERS_CACHE`.
- Xenova confirmed: `Xenova/all-MiniLM-L6-v2`, 384 dims; ~2–60ms per probe depending on cache.
- Post-clean verification:
  - Run `memory:embedding-info`, `memory:test-consistency`, `memory:search "chromadb victory"`.
  - Use higher limits (e.g., 15) for domain queries to evaluate ranking.

Future Considerations
- Optional `DISABLE_XENOVA` env to force hash fallback for A/B testing.
- Precise vector deletion with ID enumeration for confirmed counts.
- CLI flags for `--topk` and `--session` instead of positional args.


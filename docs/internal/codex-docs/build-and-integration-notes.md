# Build and Integration Notes (Stability-First)

## Goals
- Keep repo buildable while rebuilding memory on a stable adapter.
- Avoid touching MCP-files and legacy modules until reviewed.

## What We Did
- Added minimal no-op shims in `src/lib/memory/`:
  - `auto-memory-system.ts`, `knowledge-seeding-system.ts`, `vector-memory-manager.ts`, `vector-store.ts`
- Added declaration shims so `src/index.ts` can import tool suites without compiling them:
  - `src/types/tools-shims.d.ts`
- Scoped TypeScript build via `tsconfig.json` excludes:
  - Excludes `tests/**`, `MCP-files/**`, and `src/tools/**` from the default build.
- Adapter lanes remain intact:
  - Unit: `npm run test:adapter`
  - Live integration (Chroma v2): `npm run itest:adapter`

## Why This Works
- Keeps the adapter + core memory compiling without reintroducing old complexity.
- Does not modify MCP-files code or pull it into the build graph.
- Allows `src/index.ts` to compile by providing minimal, safe shims.

## Future Evolution
- Replace shims with real implementations or retire unused imports after roadmap decisions.
- Consider a memory-only tsconfig for producing artifacts if needed.
- Publish a small interfaces package for MCP-files boundary.


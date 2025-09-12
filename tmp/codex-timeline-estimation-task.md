# CODEX Task — Timeline Estimation (Process v3.3.2)

Date: 2025-09-11
Owner: CODEX
Status: Final — clarifications applied

## Objective
Produce a realistic, evidence‑anchored timeline estimate (with confidence ranges) for the next sprint(s), covering remaining work derived from f‑011 follow‑ups and any adjacent priorities.

## Inputs Needed (Clarifications)
Please confirm or provide the following to proceed with a high‑fidelity estimate:
- Scope boundaries
  - Which issues are in scope for the next sprint? (e.g., #37 lifecycle tools, #38 schema enforcement/reindex/stats, #39 coverage)
  - Any additional work items not yet filed?
- Constraints
  - Hard timebox (hours/days) and target sprint length
  - Environment prerequisites (cluster/chroma availability; CI limits)
  - Reviewer/tester availability windows
- Quality targets
  - Required coverage percentage for new tests
  - Performance bounds (e.g., enrichment latency ceilings; data size limits)
- Deliverable format
  - Preferred granularity (task/hour), milestones, and reporting cadence
  - Evidence artifacts required at sprint close

## Confirmed Constraints & Standards
- Sprint length: 1–2 working days (4–6 active hours/day)
- Environment: Cluster access ✅; local Chroma ✅; minimal CI dependency
- Reviews: TESTER 60–90 min; REVIEWER 60–90 min (flexible timing)
- Quality: D‑009 mandatory; zero‑stdout; enrichment ≤400ms; vector doc ≤1.5KB; metrics anchors ≤10

## Candidate Scope (from follow‑ups)
- #37 Incident lifecycle tools (begin/append/hypothesis/publish/close)
- #38 Schema v2 enforcement + reindex + per‑collection/by‑kind stats
- #39 B‑012: 100% coverage sprint (existing tools + middleware)

## Estimation Framework
- Technique: Range estimates with confidence (PERT‑style), rolled up by task and phase
- Buckets: Design/Implementation/Validation/Docs per task
- Buffers: 10–20% integration uncertainty buffer; 10% documentation buffer

## Final Breakdown (by issue)
- #37 Lifecycle tools (begin/append/hypothesis/publish/close)
  - Design + API contracts + tags + dedup hash: 1.0–1.5h (80%)
  - Implement 5 tools + minimal CLI stubs: 2.5–3.5h (75%)
  - Unit tests + light integration: 1.5–2.0h (80%)
  - Docs + examples: 0.5–0.75h (90%)
  - Total: 5.5–7.75h
- #38 Schema v2 enforcement + reindex + per‑collection/by‑kind stats
  - Enforce `kind:` on all writes; tolerant readers: 1.0–1.5h (85%)
  - Reindex script (JSON→Chroma; idempotent, dry‑run): 2.0–3.0h (75%)
  - Stats by‑kind/per‑collection: 1.0–1.5h (80%)
  - Tests & docs: 1.0–1.5h (85%)
  - Total: 5.0–7.5h
- #39 B‑012: 100% coverage sprint (existing tools + middleware)
  - Targets setup + harness + mocks: 1.0–1.5h (85%)
  - Tests (middleware/writers/adapters/CLI): 3.0–4.0h (75%)
  - Diagnostics/read‑ops smoke tests: 1.0–1.5h (80%)
  - Gaps remediation + docs: 0.5–1.0h (90%)
  - Total: 5.5–8.0h

## Roll‑Up (Final)
- Minimum: ~16.0h (aggressive)
- Likely: ~20.0h
- Maximum: ~23.0h
- Confidence: 75–80%

## Milestones & Sequencing (2‑day plan)
- Day 1 AM (4–5h): #38 enforcement + stats; start reindex script (dry‑run)
- Day 1 PM (2–3h): #37 design + begin/append skeletons; basic tests
- Day 2 AM (4–5h): #37 implement/publish/close; tests + integration; docs
- Day 2 PM (2–3h): #39 coverage pass (middleware/writers/adapters/CLI), diagnostics smoke; refine tests
- TESTER (60–90m) → REVIEWER (60–90m): Flexible

If constrained to 1 day:
- Prioritize #38 fully; partial #37 (begin/append) + skeletons; move remaining to next micro‑sprint

## Deliverables
- Timeline table (task → min/likely/max hours, confidence)
- Gantt‑style milestone view (optional, markdown)
- Risk register (top 3 risks + mitigations)
- Evidence plan (artifacts per task)

## Risks & Mitigations (Draft)
- Reindex complexity — Mitigate with dry‑run + small batch
- Lifecycle UX surface changes — Scope tools to CLI + minimal API first
- Test flakiness with Chroma — Mock/fallback where possible; keep CI off network

## Next Steps
- [x] Clarifications received
- [x] Finalized timeline and confidence ranges
- [ ] Confirm sprint start date/time and reviewers

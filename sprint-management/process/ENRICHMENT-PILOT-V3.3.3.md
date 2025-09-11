# Selective Enrichment Pilot — Process v3.3.3 (Add‑On)

Purpose
- Enhance institutional memory and planning without slowing deterministic closure (v3.3.2).
- Keep enrichment optional, evidence‑anchored, and confined to safe ENRICHMENT zones.

Scope (Phase‑1 Targets)
- analytical-artifacts/09-outstanding-work-analysis.md — Convert bullets → actionable work packages
- sprint-retrospective.md — Add Context Abstract (≤10 bullets)
- analytical-artifacts/07-key-decisions-log.md — Add Why/Impact pairs (decision archaeology)

Roles and Boundaries
- Operator / Scrum Master (human): triggers enrichment, selects targets/timebox, reviews and merges PR.
- Claude (AI Scrum Master): enriches only within <!-- ENRICHMENT: begin/end --> zones; all claims evidence‑anchored.
- Codex (AI Developer/Tester/Reviewer): produces deterministic closure (17 artifacts, validator pass, indices refresh), and inserts empty ENRICHMENT zones at baseline scaffold.

Process Steps
1) Deterministic Closure (v3.3.2)
   - Codex completes 17 required artifacts; run `npm run sprint:validate-closure` and `npm run archives:index`.
   - Optional context scaffold: `npm run sprint:context:skeleton -- <archive-dir>`.

2) Pilot Enrichment Trigger (manual)
   - Operator selects Phase‑1 targets and sets timebox (45–90 min total).

3) Enrichment Execution (Claude)
   - Edits only within ENRICHMENT zones.
   - Each enriched section includes ≥1 evidence anchor (artifacts/logs/ADRs/commits/code paths).
   - Append marker line at end of each zone: “Section updated by Claude (AI Scrum Master) based on baseline Codex findings and deterministic artifacts”.
   - Write/update `process-artifacts/enrichment-summary-YYYY-MM-DD.md` (what changed, anchors used, timebox, zone‑only confirmation).

4) Review and Merge (Operator)
   - Confirm: zone confinement, evidence anchors, timebox adherence, additive‑only changes.
   - Merge docs‑only PR labeled `context-addendum`.

Guardrails
- Zone confinement: edits between <!-- ENRICHMENT: begin/end --> only; baseline outside zones remains unchanged.
- Evidence anchors: ≥1 anchor per enriched section (artifact/log/ADR/commit/code).
- Timebox: routine ≤45 min; crisis ≤90 min (operator logs estimate in summary).
- Additive safety: no structure or validator changes; enrichment only.

Acceptance Criteria (per sprint)
- Deterministic closure completed before enrichment; validator passed; indices refreshed.
- Enrichment confined to zones; enriched sections include anchors; summary present.
- PR labeled `context-addendum`; merges cleanly without baseline regressions.

Pilot KPIs (evaluate after 2–3 sprints)
- Efficiency: ≥80% runs within timebox.
- Reuse: Abstract/Decisions adopted in next sprint planning.
- Reviewer friction: no baseline regressions; minimal rework.

Notes
- If time pressure is high, reduce to 1–2 targets (Outstanding Work + Abstract) for the sprint.
- Add light CI checks later (optional) to detect edits outside zones and require at least one anchor per zone.


# Process Version Standards (3.3.x)

- v3.3.2 (Current): 20‑artifact sprint closure standard.
  - See: `sprint-management/TEMPLATE-USAGE-GUIDE-PROCESS-V3.3.2.md` (artifact list and descriptions)
- v3.3.1 (Legacy minimum): 11‑artifact set used by older templates and PR checklist.
  - Acceptable only for legacy closures; prefer upgrading to v3.3.2 at closure.

Notes
- Daily work occurs on `release/v0.9.0-beta`; main holds canonical docs/archives.
- EOD export (manual control): `npm run process:sync-docs` on beta, then open a docs‑only PR to main.
- Generators on beta keep README sections current:
  - `npm run sprint:status` (feature epics + status)
  - `npm run sprint:tools` (tool inventory; planned + validated)
- Validation (optional gate): `npm run sprint:validate-closure -- <archive-dir>`

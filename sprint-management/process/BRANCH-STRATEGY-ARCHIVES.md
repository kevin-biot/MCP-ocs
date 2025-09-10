# Branch Strategy for Sprint Archives

## Roles
- main: documentation + sprint management (canonical home for sprint archives)
- release/* (e.g., release/v0.9.0-beta): all code work; may receive doc changes via PR; not canonical for archives

## Workflow
- Feature branches from release/* for code work
- Documentation/sprint archives committed to main
- At sprint completion: merge docs to main; code remains on release/*

## Enforcement
- CI should reject archive additions on release/*
- Archives only under:
  - sprint-management/features/archives/
  - sprint-management/maintenance/archives/

## Rationale
- Prevents confusion and data loss during reorganizations; keeps source of truth on main.

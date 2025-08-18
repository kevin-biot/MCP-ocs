SHELL := /bin/bash

.PHONY: test-local-pack smokes goldens coverage format e2e-ingress e2e-scheduling e2e-zone e2e-all regression-full llm-cross lm-models llm-matrix

# Default: run the local + cluster-read pack (non-mutating)
test-local-pack:
	bash scripts/test/local-cluster-read-pack.sh

# Run A2 template smokes (non-mutating; fabricated fixtures)
smokes:
	npm run -s retest:smoke:te-scale
	npm run -s retest:smoke:te-pvc-affinity

# Regenerate and compare goldens (offline, deterministic)
goldens:
	npm run -s template:golden:snapshot
	npm run -s template:golden:compare

# Offline evidence coverage (deterministic)
coverage:
	npm run -s template:coverage

# Formatter checks on two goldens (JSON + CSV)
format:
	node scripts/tools/format-summary.mjs docs/golden-templates/ingress-pending.json --json --gate
	node scripts/tools/format-summary.mjs docs/golden-templates/pvc-storage-affinity.json --csv --no-header

# Optional E2E against a live OpenShift cluster (read-only)
# Requirements: `oc` logged in; grants to list/describe nodes, machinesets, pods, routes, pvc, etc.
# Set INFRA_LIVE_READS=true to allow the infra tools to perform bounded cluster reads.
e2e-ingress:
	INFRA_LIVE_READS=true npm run -s e2e:te-ingress:seq

e2e-scheduling:
	INFRA_LIVE_READS=true npm run -s e2e:te-scheduling

e2e-zone:
	INFRA_LIVE_READS=true npm run -s e2e:te-zone

# Aggregate: run all e2e cluster-read checks (read-only)
e2e-all:
	$(MAKE) e2e-ingress
	$(MAKE) e2e-scheduling
	$(MAKE) e2e-zone

# Full regression (offline determinism + rubric coverage gate)
regression-full:
	MIN_RUBRICS_COVERAGE=0.9 npm run -s ci:templates
	# Negative goldens (optional)
	npm run -s template:golden:compare:negative || true

# Cross-LLM hygiene checks (LM Studio live recommended)
llm-cross:
	npm run -s template:hygiene:cross:all

lm-models:
	npm run -s lm:models

llm-matrix:
	npm run -s llm:matrix

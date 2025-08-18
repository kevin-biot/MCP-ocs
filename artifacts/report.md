# Local + Cluster-Read Test Pack Report

## Steps
- smoke-scale: OK
- smoke-pvc: OK
- golden-snap: OK
- golden-compare: OK
- coverage: OK
- fmt-ingress: OK
- fmt-pvc: OK

## Coverage
coverage: (see artifacts/template-coverage.log)

## Formatter Outputs
- ingress-pending: artifacts/formatter-ingress-pending.json
- pvc-storage-affinity: artifacts/formatter-pvc-storage-affinity.csv

## Artifacts
- artifacts/smoke-te-pvc-affinity.log
- artifacts/golden-compare.log
- artifacts/report.md
- artifacts/.rc-smoke-scale
- artifacts/.rc-fmt-ingress
- artifacts/.rc-golden-snap
- artifacts/golden-snapshot.log
- artifacts/.rc-fmt-pvc
- artifacts/formatter-pvc-storage-affinity.log
- artifacts/smoke-te-scale.log
- artifacts/template-coverage.log
- artifacts/summaries/1755467618422-smoke-scheduling-failures-1755467618421-scheduling-failures.summary.json
- artifacts/summaries/1755450226327-e2e-te-ingress-ingress-pending.summary.json
- artifacts/summaries/1755467618661-smoke-zone-conflict-1755467618660-zone-conflict.summary.json
- artifacts/summaries/1755474706384-smoke-pvc-storage-affinity-1755474706382-pvc-storage-affinity.summary.json
- artifacts/summaries/1755444115190-e2e-te-ingress-ingress-pending.summary.json
- artifacts/summaries/1755467271949-smoke-scheduling-failures-1755467271948-scheduling-failures.summary.json
- artifacts/summaries/1755467358156-smoke-zone-conflict-1755467358155-zone-conflict.summary.json
- artifacts/summaries/1755443941893-e2e-te-ingress-ingress-pending.summary.json
- artifacts/summaries/1755444019009-e2e-te-ingress-ingress-pending.summary.json
- artifacts/summaries/1755474706139-smoke-scale-instability-1755474706138-scale-instability.summary.json
- artifacts/summaries/1755476193354-smoke-scale-instability-1755476193353-scale-instability.summary.json
- artifacts/summaries/1755476193598-smoke-pvc-storage-affinity-1755476193597-pvc-storage-affinity.summary.json
- artifacts/llm-cross.log
- artifacts/formatter-pvc-storage-affinity.csv
- artifacts/node-version.txt
- artifacts/formatter-ingress-pending.json
- artifacts/npm-version.txt
- artifacts/formatter-ingress-pending.log
- artifacts/oc-version.txt
- artifacts/.rc-coverage
- artifacts/npm-i.log
- artifacts/.rc-smoke-pvc
- artifacts/.rc-golden-compare

## Notes
- Cluster reads were enabled (oc present).
- No cluster mutations attempted.

# LLM Capture + Robustness Harness (LM Studio + MCP)

## What this does
- Drives LM Studio’s OpenAI-compatible API with a tool-first system prompt.
- Captures exact prompts, tool_calls, tool results, and final assistant text.
- Runs multiple trials with fixed knobs (temperature, top_p, seed), saves transcripts.
- Scores robustness (structure stability, tool success, answer stability).

## Files
- `lmstudio-tool-runner.mjs` — simple end-to-end tool-call loop; writes transcripts/outputs.
- `llm-matrix-runner.mjs` — multi-model × multi-template matrix runner; writes report.
- `run-matrix.mjs` — N-run driver (vary seeds/temps) + robustness scoring.
- `tool-bridge.mjs` — executes tools using local UnifiedToolRegistry (read-only).
- `normalize.mjs` — normalizes text for robust comparisons.
- `robustness-score.mjs` — computes stability metrics.
- `transcript-schema.json` — schema for transcript objects.

Outputs
- `artifacts/llm-matrix-report.{md,json}` — matrix summary.
- `artifacts/llm-matrix/outputs/` — final assistant outputs per run.
- `artifacts/llm-matrix/transcripts/` — detailed transcripts per run.
- `logs/transcripts/` — transcripts for robustness runs.
- `logs/robustness/*__score.json` — robustness summary per test name.

Schema & Validation
- Per-scenario vocabularies constrain `evidence_keys` (see `scripts/e2e/schema/vocab.mjs`).
- Strict JSON schema is enforced via AJV; validation results are included in outputs and robustness summaries.

## Usage

1) Ensure LM Studio is running at `http://localhost:1234` and a model is loaded.

2) Multi-model matrix (templated prompts)
```
# Defaults: models="ministral-8b-instruct-2410,mistralai/devstral-small-2507,qwen/qwen3-coder-30b"
# Params: LM_TEMPERATURE=0.0 LM_TOP_P=1.0 LM_MAX_TOKENS=800 LM_SEED=7
npm run -s llm:matrix
```

3) Robustness run for a single prompt (N seeds)
```
# Adjust model/seeds as needed
LMS_MODEL="qwen/qwen3-coder-30b" LM_SEEDS="7,13,23" npm run -s e2e:capture
# Inspect
cat logs/robustness/ingress-pending-demo__score.json
```

4) One-off runner for a specific prompt
```
node scripts/e2e/lmstudio-tool-runner.mjs --prompt docs/e2e/prompts/route-5xx.json
```

## Gates (suggested)
- structuralStable must be true for temperature=0 runs (tool plan stable).
- toolSuccessRate >= 0.8 (once tool bridge is fully wired).
- answerStability >= 0.85 (byte/word similarity across seeds).

Tuning Tips
- Use LIST-first hints in prompts (e.g., call get_pods before naming resources) to avoid hallucinated names.
- Keep temperature 0.0 and seed fixed for determinism.
- Prefer comparing structure and rubric labels over raw free text.

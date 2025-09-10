#!/usr/bin/env bash
set -euo pipefail

# Start sequential server and assert no stdout noise during operation
STDOUT_LOG=$(mktemp)
STDERR_LOG=$(mktemp)

STRICT_STDIO_LOGS=true tsx src/index-sequential.ts >"$STDOUT_LOG" 2>"$STDERR_LOG" &
PID=$!
sleep 2

FAIL=0
if [ -s "$STDOUT_LOG" ]; then
  echo "FAIL: stdout output detected during server operation" >&2
  echo "--- stdout ---" >&2
  cat "$STDOUT_LOG" >&2 || true
  FAIL=1
else
  echo "PASS: No stdout output during server operation" >&2
fi

# Sanity: ensure no emoji-like characters in stderr when strict mode
if grep -qP "[\x{2190}-\x{21FF}\x{2300}-\x{23FF}\x{2460}-\x{24FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{1F300}-\x{1F5FF}\x{1F600}-\x{1F64F}\x{1F680}-\x{1F6FF}\x{1F900}-\x{1F9FF}\x{FE0F}]" "$STDERR_LOG" 2>/dev/null; then
  echo "FAIL: Emoji or disallowed unicode detected in stderr" >&2
  FAIL=1
else
  echo "PASS: No emojis in stderr (strict mode)" >&2
fi

kill "$PID" 2>/dev/null || true
rm -f "$STDOUT_LOG" "$STDERR_LOG"

exit $FAIL


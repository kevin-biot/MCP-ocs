#!/usr/bin/env bash
set -euo pipefail

echo "[sanity] oc version:" && oc version || { echo "oc not available"; exit 1; }
echo "[sanity] current user:" && oc whoami || true
echo "[sanity] current project:" && oc project -q || true
echo "[sanity] namespaces (first 20):" && oc get namespaces -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}' | head -n 20 || true

echo "[sanity] cluster operators (degraded):" && oc get co -o json | jq -r '.items[] | select(.status.conditions[]? | select(.type=="Degraded" and .status=="True")) | .metadata.name' || true

echo "[sanity] OK"


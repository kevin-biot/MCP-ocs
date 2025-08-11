#!/bin/bash

echo "🧪 MCP-OCS v2.0 Real Cluster Validation Framework"
echo "================================================="

cd /Users/kevinbrown/MCP-ocs

# Configuration
REAL_NAMESPACES=("devops" "openshift-apiserver" "default" "kube-system")
TIMEOUT=15
LOG_FILE="validation-$(date +%Y%m%d-%H%M%S).log"

echo "📊 Starting validation against live cluster..."
echo "Log file: $LOG_FILE"

# Helper functions
log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

test_namespace_exists() {
    local ns="$1"
    oc get namespace "$ns" >/dev/null 2>&1
}

get_real_pod_count() {
    local ns="$1"
    oc get pods -n "$ns" --no-headers 2>/dev/null | wc -l | tr -d ' '
}

get_real_crashloop_count() {
    local ns="$1"
    oc get pods -n "$ns" -o json 2>/dev/null | \
    jq -r '.items[] | select(.status.containerStatuses[]?.state.waiting?.reason=="CrashLoopBackOff") | .metadata.name' | \
    wc -l | tr -d ' '
}

get_real_pvc_count() {
    local ns="$1"
    oc get pvc -n "$ns" --no-headers 2>/dev/null | wc -l | tr -d ' '
}

test_tool_response() {
    local tool_name="$1"
    local args="$2"
    local timeout="$3"
    
    echo "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"$tool_name\",\"arguments\":$args}}" | \
    timeout "$timeout" node dist/index.js 2>/dev/null
}

# Start validation
echo ""
echo "🔍 CLUSTER CONNECTION TEST"
echo "=========================="

if ! oc cluster-info >/dev/null 2>&1; then
    log "❌ FATAL: Cannot connect to OpenShift cluster"
    exit 1
fi

CLUSTER_VERSION=$(oc version --output=json | jq -r '.openshiftVersion')
CLUSTER_URL=$(oc whoami --show-server)
CURRENT_USER=$(oc whoami)

log "✅ Connected to cluster"
log "   Version: $CLUSTER_VERSION"
log "   URL: $CLUSTER_URL"
log "   User: $CURRENT_USER"

echo ""
echo "🧪 NAMESPACE VALIDATION TESTS"
echo "============================="

for namespace in "${REAL_NAMESPACES[@]}"; do
    echo ""
    log "Testing namespace: $namespace"
    echo "-----------------------------"
    
    # Check if namespace exists
    if ! test_namespace_exists "$namespace"; then
        log "⚠️  Namespace $namespace does not exist, skipping..."
        continue
    fi
    
    # Gather real data
    REAL_POD_COUNT=$(get_real_pod_count "$namespace")
    REAL_CRASHLOOP_COUNT=$(get_real_crashloop_count "$namespace")
    REAL_PVC_COUNT=$(get_real_pvc_count "$namespace")
    
    log "📊 Real cluster data:"
    log "   Pods: $REAL_POD_COUNT"
    log "   CrashLoops: $REAL_CRASHLOOP_COUNT"  
    log "   PVCs: $REAL_PVC_COUNT"
    
    # Test check_namespace_health if tool exists
    if grep -q "check_namespace_health" src/index.ts 2>/dev/null; then
        log "🔧 Testing check_namespace_health tool..."
        
        TOOL_ARGS="{\"namespace\":\"$namespace\"}"
        TOOL_RESULT=$(test_tool_response "check_namespace_health" "$TOOL_ARGS" "$TIMEOUT")
        
        if [ $? -eq 0 ] && [ -n "$TOOL_RESULT" ]; then
            # Extract tool data
            TOOL_POD_COUNT=$(echo "$TOOL_RESULT" | jq -r '.result.content[0].text' 2>/dev/null | grep -o '"total":[0-9]*' | cut -d':' -f2 | head -1)
            TOOL_STATUS=$(echo "$TOOL_RESULT" | jq -r '.result.content[0].text' 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
            
            log "🤖 Tool results:"
            log "   Status: ${TOOL_STATUS:-unknown}"
            log "   Pod count: ${TOOL_POD_COUNT:-unknown}"
            
            # Compare results
            if [ "$REAL_POD_COUNT" = "$TOOL_POD_COUNT" ]; then
                log "✅ Pod count matches!"
            else
                log "❌ Pod count mismatch! Real: $REAL_POD_COUNT, Tool: $TOOL_POD_COUNT"
            fi
        else
            log "❌ Tool failed or timed out"
        fi
    else
        log "⚠️  check_namespace_health tool not yet implemented"
    fi
    
    # Test other tools if they exist
    if grep -q "search_rca_patterns" src/index.ts 2>/dev/null; then
        log "🔧 Testing search_rca_patterns tool..."
        # Add search test when implemented
    fi
done

echo ""
echo "🚀 PERFORMANCE TESTS"
echo "==================="

# Test response times
for namespace in "${REAL_NAMESPACES[@]:0:2}"; do
    if test_namespace_exists "$namespace"; then
        log "⏱️  Testing response time for $namespace"
        
        START_TIME=$(date +%s%3N)
        TOOL_RESULT=$(test_tool_response "check_namespace_health" "{\"namespace\":\"$namespace\"}" "$TIMEOUT")
        END_TIME=$(date +%s%3N)
        
        if [ $? -eq 0 ]; then
            DURATION=$((END_TIME - START_TIME))
            log "   Response time: ${DURATION}ms"
            
            if [ "$DURATION" -lt 5000 ]; then
                log "   ✅ Within 5s SLA"
            else
                log "   ❌ Exceeds 5s SLA"
            fi
        else
            log "   ❌ Tool failed"
        fi
    fi
done

echo ""
echo "🔒 ERROR HANDLING TESTS"  
echo "======================"

# Test non-existent namespace
log "🔧 Testing non-existent namespace handling..."
NONEXISTENT_RESULT=$(test_tool_response "check_namespace_health" "{\"namespace\":\"nonexistent-test-12345\"}" 10)

if [ $? -eq 0 ]; then
    if echo "$NONEXISTENT_RESULT" | grep -q "not found\|does not exist\|error"; then
        log "✅ Properly handles non-existent namespace"
    else
        log "❌ Should report error for non-existent namespace"
    fi
else
    log "❌ Tool crashed on non-existent namespace"
fi

echo ""
echo "📈 VALIDATION SUMMARY"
echo "===================="

# Count test results from log
TOTAL_TESTS=$(grep -c "Testing namespace:" "$LOG_FILE")
PASSED_TESTS=$(grep -c "✅" "$LOG_FILE")
FAILED_TESTS=$(grep -c "❌" "$LOG_FILE")

log "📊 Test Results:"
log "   Total namespaces tested: $TOTAL_TESTS"
log "   Checks passed: $PASSED_TESTS"
log "   Checks failed: $FAILED_TESTS"

if [ "$FAILED_TESTS" -eq 0 ]; then
    log "🎉 ALL VALIDATION TESTS PASSED!"
    exit 0
else
    log "⚠️  Some tests failed - check log for details"
    exit 1
fi

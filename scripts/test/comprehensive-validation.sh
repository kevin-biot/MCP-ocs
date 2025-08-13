#!/bin/bash

echo "🧪 Comprehensive Real-World MCP Tools Validation"
echo "==============================================="

cd /Users/kevinbrown/MCP-ocs

echo "📊 Gathering REAL cluster data for comparison..."

# Get real cluster facts
REAL_VERSION=$(oc version --output=json | jq -r '.openshiftVersion')
REAL_SERVER_URL=$(oc whoami --show-server)
REAL_CURRENT_USER=$(oc whoami)
REAL_CURRENT_CONTEXT=$(oc whoami --show-context)
REAL_NAMESPACE_COUNT=$(oc get namespaces --no-headers | wc -l | tr -d ' ')
REAL_KUBE_SYSTEM_PODS=$(oc get pods -n kube-system --no-headers 2>/dev/null | wc -l | tr -d ' ')
REAL_DEVOPS_PODS=$(oc get pods -n devops --no-headers 2>/dev/null | wc -l | tr -d ' ')
REAL_OPENSHIFT_PODS=$(oc get pods -n openshift-apiserver --no-headers 2>/dev/null | wc -l | tr -d ' ')
REAL_NODE_COUNT=$(oc get nodes --no-headers | wc -l | tr -d ' ')

echo ""
echo "📋 REAL CLUSTER FACTS:"
echo "====================="
echo "OpenShift Version: $REAL_VERSION"
echo "Server URL: $REAL_SERVER_URL"
echo "Current User: $REAL_CURRENT_USER"
echo "Current Context: $REAL_CURRENT_CONTEXT"
echo "Total Namespaces: $REAL_NAMESPACE_COUNT"
echo "Pods in kube-system: $REAL_KUBE_SYSTEM_PODS"
echo "Pods in devops: $REAL_DEVOPS_PODS"
echo "Pods in openshift-apiserver: $REAL_OPENSHIFT_PODS"
echo "Node Count: $REAL_NODE_COUNT"

echo ""
echo "🔧 Testing MCP Tools vs Real Data..."
echo "===================================="

# Test 1: Cluster Health Diagnostic
echo ""
echo "📊 TEST 1: Cluster Health Diagnostic"
echo "Real OpenShift version: $REAL_VERSION"

TOOL_HEALTH_OUTPUT=$(echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"oc_diagnostic_cluster_health","arguments":{"sessionId":"validation-1"}}}' | node dist/index.js 2>/dev/null)
TOOL_VERSION=$(echo "$TOOL_HEALTH_OUTPUT" | jq -r '.result.content[0].text' 2>/dev/null | grep -o '"version"[^,]*' | cut -d'"' -f4)

echo "Tool reported version: $TOOL_VERSION"
if [ "$TOOL_VERSION" = "$REAL_VERSION" ]; then
    echo "✅ VERSION MATCH"
else
    echo "❌ VERSION MISMATCH - Tool: $TOOL_VERSION, Real: $REAL_VERSION"
fi

# Test 2: Pod listing in kube-system
echo ""
echo "📊 TEST 2: Pod Count - kube-system namespace"
echo "Real pod count: $REAL_KUBE_SYSTEM_PODS"

TOOL_KUBE_PODS_OUTPUT=$(echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"oc_read_get_pods","arguments":{"sessionId":"validation-2","namespace":"kube-system"}}}' | node dist/index.js 2>/dev/null)
TOOL_KUBE_POD_COUNT=$(echo "$TOOL_KUBE_PODS_OUTPUT" | jq -r '.result.content[0].text' 2>/dev/null | grep -c "name:" 2>/dev/null || echo "0")

echo "Tool reported pod count: $TOOL_KUBE_POD_COUNT"
if [ "$TOOL_KUBE_POD_COUNT" = "$REAL_KUBE_SYSTEM_PODS" ]; then
    echo "✅ KUBE-SYSTEM POD COUNT MATCH"
else
    echo "❌ KUBE-SYSTEM POD COUNT MISMATCH - Tool: $TOOL_KUBE_POD_COUNT, Real: $REAL_KUBE_SYSTEM_PODS"
fi

# Test 3: Pod listing in devops
echo ""
echo "📊 TEST 3: Pod Count - devops namespace"
echo "Real pod count: $REAL_DEVOPS_PODS"

TOOL_DEVOPS_PODS_OUTPUT=$(echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"oc_read_get_pods","arguments":{"sessionId":"validation-3","namespace":"devops"}}}' | node dist/index.js 2>/dev/null)
TOOL_DEVOPS_POD_COUNT=$(echo "$TOOL_DEVOPS_PODS_OUTPUT" | jq -r '.result.content[0].text' 2>/dev/null | grep -c "name:" 2>/dev/null || echo "0")

echo "Tool reported pod count: $TOOL_DEVOPS_POD_COUNT"
if [ "$TOOL_DEVOPS_POD_COUNT" = "$REAL_DEVOPS_PODS" ]; then
    echo "✅ DEVOPS POD COUNT MATCH"
else
    echo "❌ DEVOPS POD COUNT MISMATCH - Tool: $TOOL_DEVOPS_POD_COUNT, Real: $REAL_DEVOPS_PODS"
fi

# Test 4: Pod listing in openshift-apiserver
echo ""
echo "📊 TEST 4: Pod Count - openshift-apiserver namespace"
echo "Real pod count: $REAL_OPENSHIFT_PODS"

TOOL_OPENSHIFT_PODS_OUTPUT=$(echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"oc_read_get_pods","arguments":{"sessionId":"validation-4","namespace":"openshift-apiserver"}}}' | node dist/index.js 2>/dev/null)
TOOL_OPENSHIFT_POD_COUNT=$(echo "$TOOL_OPENSHIFT_PODS_OUTPUT" | jq -r '.result.content[0].text' 2>/dev/null | grep -c "name:" 2>/dev/null || echo "0")

echo "Tool reported pod count: $TOOL_OPENSHIFT_POD_COUNT"
if [ "$TOOL_OPENSHIFT_POD_COUNT" = "$REAL_OPENSHIFT_PODS" ]; then
    echo "✅ OPENSHIFT-APISERVER POD COUNT MATCH"
else
    echo "❌ OPENSHIFT-APISERVER POD COUNT MISMATCH - Tool: $TOOL_OPENSHIFT_POD_COUNT, Real: $REAL_OPENSHIFT_PODS"
fi

# Test 5: Server URL accuracy
echo ""
echo "📊 TEST 5: Server URL"
echo "Real server URL: $REAL_SERVER_URL"

TOOL_SERVER_URL=$(echo "$TOOL_HEALTH_OUTPUT" | jq -r '.result.content[0].text' 2>/dev/null | grep -o '"serverUrl"[^,]*' | cut -d'"' -f4)
echo "Tool reported server URL: $TOOL_SERVER_URL"

if [ "$TOOL_SERVER_URL" = "$REAL_SERVER_URL" ]; then
    echo "✅ SERVER URL MATCH"
else
    echo "❌ SERVER URL MISMATCH - Tool: $TOOL_SERVER_URL, Real: $REAL_SERVER_URL"
fi

# Test 6: Current User
echo ""
echo "📊 TEST 6: Current User"
echo "Real current user: $REAL_CURRENT_USER"

TOOL_CURRENT_USER=$(echo "$TOOL_HEALTH_OUTPUT" | jq -r '.result.content[0].text' 2>/dev/null | grep -o '"currentUser"[^,]*' | cut -d'"' -f4)
echo "Tool reported current user: $TOOL_CURRENT_USER"

if [ "$TOOL_CURRENT_USER" = "$REAL_CURRENT_USER" ]; then
    echo "✅ CURRENT USER MATCH"
else
    echo "❌ CURRENT USER MISMATCH - Tool: $TOOL_CURRENT_USER, Real: $REAL_CURRENT_USER"
fi

echo ""
echo "📈 VALIDATION SUMMARY"
echo "===================="

TOTAL_TESTS=6
ERRORS=0

# Count errors
if [ "$TOOL_VERSION" != "$REAL_VERSION" ]; then ((ERRORS++)); fi
if [ "$TOOL_KUBE_POD_COUNT" != "$REAL_KUBE_SYSTEM_PODS" ]; then ((ERRORS++)); fi
if [ "$TOOL_DEVOPS_POD_COUNT" != "$REAL_DEVOPS_PODS" ]; then ((ERRORS++)); fi
if [ "$TOOL_OPENSHIFT_POD_COUNT" != "$REAL_OPENSHIFT_PODS" ]; then ((ERRORS++)); fi
if [ "$TOOL_SERVER_URL" != "$REAL_SERVER_URL" ]; then ((ERRORS++)); fi
if [ "$TOOL_CURRENT_USER" != "$REAL_CURRENT_USER" ]; then ((ERRORS++)); fi

PASSED=$((TOTAL_TESTS - ERRORS))

echo "Tests Passed: $PASSED/$TOTAL_TESTS"
echo "Tests Failed: $ERRORS/$TOTAL_TESTS"

if [ $ERRORS -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED - Tools are accurate!"
else
    echo "⚠️  $ERRORS ISSUES FOUND - Tools need calibration"
    
    echo ""
    echo "🔧 PRIORITY FIXES NEEDED:"
    echo "========================"
    
    if [ "$TOOL_VERSION" != "$REAL_VERSION" ]; then
        echo "❌ HIGH: Version reporting (Tool: $TOOL_VERSION, Real: $REAL_VERSION)"
    fi
    
    if [ "$TOOL_KUBE_POD_COUNT" != "$REAL_KUBE_SYSTEM_PODS" ]; then
        echo "❌ MEDIUM: kube-system pod count (Tool: $TOOL_KUBE_POD_COUNT, Real: $REAL_KUBE_SYSTEM_PODS)"
    fi
    
    if [ "$TOOL_DEVOPS_POD_COUNT" != "$REAL_DEVOPS_PODS" ]; then
        echo "❌ MEDIUM: devops pod count (Tool: $TOOL_DEVOPS_POD_COUNT, Real: $REAL_DEVOPS_PODS)"
    fi
    
    if [ "$TOOL_OPENSHIFT_POD_COUNT" != "$REAL_OPENSHIFT_PODS" ]; then
        echo "❌ MEDIUM: openshift-apiserver pod count (Tool: $TOOL_OPENSHIFT_POD_COUNT, Real: $REAL_OPENSHIFT_PODS)"
    fi
    
    if [ "$TOOL_SERVER_URL" != "$REAL_SERVER_URL" ]; then
        echo "❌ LOW: Server URL (Tool: $TOOL_SERVER_URL, Real: $REAL_SERVER_URL)"
    fi
    
    if [ "$TOOL_CURRENT_USER" != "$REAL_CURRENT_USER" ]; then
        echo "❌ LOW: Current user (Tool: $TOOL_CURRENT_USER, Real: $REAL_CURRENT_USER)"
    fi
fi

echo ""
echo "🎯 Ready for systematic fixes!"

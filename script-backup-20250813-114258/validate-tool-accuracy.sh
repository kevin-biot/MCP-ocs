#!/bin/bash

echo "🧪 MCP Tools vs Real OC Commands Validation"
echo "==========================================="

cd /Users/kevinbrown/MCP-ocs

echo "🔧 Testing cluster version accuracy..."

# Test 1: Cluster Version Comparison
echo ""
echo "📊 Test 1: Cluster Version"
echo "Real oc command:"
oc version --output=json | jq -r '.openshiftVersion // .serverVersion.gitVersion'

echo ""
echo "MCP Tool result:"
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"oc_diagnostic_cluster_health","arguments":{"sessionId":"validation-test"}}}' | \
node dist/index.js 2>/dev/null | \
jq -r '.result.content[0].text' 2>/dev/null | \
grep -i "version" || echo "Version not found in tool output"

# Test 2: Pod Count Comparison  
echo ""
echo "📊 Test 2: Pod Count in kube-system"
echo "Real oc command:"
REAL_POD_COUNT=$(oc get pods -n kube-system --no-headers | wc -l | tr -d ' ')
echo "Pod count: $REAL_POD_COUNT"

echo ""
echo "MCP Tool result:"
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"oc_read_get_pods","arguments":{"sessionId":"validation-test","namespace":"kube-system"}}}' | \
node dist/index.js 2>/dev/null | \
jq -r '.result.content[0].text' 2>/dev/null | \
grep -o "pod" | wc -l | \
awk '{print "Pod count from tool: " $1}'

# Test 3: Namespace List Comparison
echo ""
echo "📊 Test 3: Namespace Count"
echo "Real oc command:"
REAL_NS_COUNT=$(oc get namespaces --no-headers | wc -l | tr -d ' ')
echo "Namespace count: $REAL_NS_COUNT"

echo ""
echo "📊 Test 4: Cluster Info Comparison"
echo "Real oc command:"
oc cluster-info | head -1

echo ""
echo "Expected vs Actual Summary:"
echo "- Real OpenShift version: $(oc version --output=json | jq -r '.openshiftVersion // .serverVersion.gitVersion')"
echo "- Real cluster endpoint: $(oc whoami --show-server)"
echo "- Real current context: $(oc whoami --show-context)"

echo ""
echo "🎯 Validation complete - compare outputs above"
echo "🔧 If discrepancies found, tools need calibration"

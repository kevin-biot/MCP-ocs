#!/bin/bash

echo "🧪 Quick AWS OpenShift Connection Test"
echo "====================================="

cd /Users/kevinbrown/MCP-ocs

echo "🔧 Testing basic OpenShift connectivity..."

# Test 1: Direct oc command
echo ""
echo "📡 Test 1: Direct oc command (cluster info)"
oc cluster-info --request-timeout=10s

OC_STATUS=$?

if [ $OC_STATUS -eq 0 ]; then
    echo "✅ Direct oc command working"
else
    echo "❌ Direct oc command failed"
    echo "   Make sure you're logged in: oc login"
    exit 1
fi

# Test 2: Get some basic cluster info
echo ""
echo "📡 Test 2: Cluster version"
oc version --request-timeout=10s

echo ""
echo "📡 Test 3: List namespaces (first 5)"
oc get namespaces --request-timeout=10s | head -6

echo ""
echo "📡 Test 4: Current context"
oc whoami --show-server 2>/dev/null && echo ""
oc whoami --show-context 2>/dev/null

echo ""
echo "📡 Test 5: Basic pod listing"
oc get pods -A --request-timeout=10s | head -10

echo ""
echo "✅ Basic AWS OpenShift connectivity confirmed!"
echo ""
echo "🚀 Now testing MCP-ocs server integration..."
echo "   (Server should pick up this same connection)"

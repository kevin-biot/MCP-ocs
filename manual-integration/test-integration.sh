#!/bin/bash

# Manual Integration Test Script for Phase 2A.1
# Tests the infrastructure correlation engine against your live cluster

echo "🚀 Phase 2A.1 Manual Integration Test"
echo "===================================="
echo

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if we're connected to OpenShift
if ! oc whoami &>/dev/null; then
    echo "❌ Not connected to OpenShift cluster"
    echo "   Please run: oc login <your-cluster>"
    exit 1
fi

echo "✅ Connected to cluster: $(oc whoami --show-server)"
echo

# Check if Node.js is available
if ! node --version &>/dev/null; then
    echo "❌ Node.js not found"
    echo "   Please install Node.js to run the analyzer"
    exit 1
fi

echo "✅ Node.js available: $(node --version)"
echo

# Run the infrastructure correlation analysis
echo "🎯 Running Infrastructure Correlation Analysis..."
echo "Expected to detect your zone scale-down scenario:"
echo "   • MachineSets scaled to 0 in zones eu-west-1a, eu-west-1b"
echo "   • 50+ PVs requiring those unavailable zones"
echo

# Execute the standalone analyzer
node standalone-infrastructure-analyzer.cjs

echo
echo "📋 Manual Integration Test Complete!"
echo
echo "🎯 Next Steps:"
echo "   1. Review the analysis results above"
echo "   2. Verify zone conflicts were detected correctly"
echo "   3. Note the analysis time (<30 seconds vs 10-15 minutes manual)"
echo "   4. Consider integrating this logic into your main MCP server"
echo
echo "✅ Phase 2A.1 Real-World Validation: $(date)"

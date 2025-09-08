#!/bin/bash

echo "🔍 ChromaDB Connection Diagnostics"
echo "=================================="

echo "🌐 Testing ChromaDB connectivity..."

# Test 1: Basic HTTP connectivity
echo ""
echo "📡 Test 1: HTTP Connection to ChromaDB"
curl -s http://127.0.0.1:8000/api/v1/heartbeat 2>/dev/null && echo "✅ ChromaDB HTTP endpoint responding" || echo "❌ ChromaDB HTTP endpoint not responding"

# Test 2: Check if port is actually listening
echo ""
echo "📡 Test 2: Port Listening Check"
lsof -i :8000 2>/dev/null && echo "✅ Port 8000 is being used" || echo "❌ Nothing listening on port 8000"

# Test 3: Network connectivity
echo ""
echo "📡 Test 3: Network Connectivity"
nc -z 127.0.0.1 8000 2>/dev/null && echo "✅ Port 8000 is reachable" || echo "❌ Cannot connect to port 8000"

# Test 4: ChromaDB API version
echo ""
echo "📡 Test 4: ChromaDB API Version"
curl -s http://127.0.0.1:8000/api/v1/version 2>/dev/null | head -1 || echo "❌ ChromaDB API not responding"

echo ""
echo "🔧 If tests fail, ChromaDB may not be fully started yet."
echo "   Wait a few seconds and try again."

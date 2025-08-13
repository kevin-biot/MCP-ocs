#!/bin/bash

echo "🔍 ChromaDB API Endpoint Discovery"
echo "================================="

echo "🌐 Testing ChromaDB API endpoints..."

# Test different possible endpoints
echo ""
echo "📡 Test 1: Root endpoint"
curl -s -w "Status: %{http_code}\n" http://127.0.0.1:8000/ || echo "Connection failed"

echo ""
echo "📡 Test 2: API v1 heartbeat"
curl -s -w "Status: %{http_code}\n" http://127.0.0.1:8000/api/v1/heartbeat || echo "Connection failed"

echo ""
echo "📡 Test 3: Just /heartbeat"
curl -s -w "Status: %{http_code}\n" http://127.0.0.1:8000/heartbeat || echo "Connection failed"

echo ""
echo "📡 Test 4: API version endpoint"
curl -s -w "Status: %{http_code}\n" http://127.0.0.1:8000/api/v1/version || echo "Connection failed"

echo ""
echo "📡 Test 5: Collections endpoint"
curl -s -w "Status: %{http_code}\n" http://127.0.0.1:8000/api/v1/collections || echo "Connection failed"

echo ""
echo "📡 Test 6: Simple GET to root with response"
echo "Response:"
curl -s http://127.0.0.1:8000/ 2>/dev/null | head -5

echo ""
echo "🔧 Testing what ChromaDB documentation suggests..."
echo "📖 Checking if it's a newer ChromaDB version with different endpoints"

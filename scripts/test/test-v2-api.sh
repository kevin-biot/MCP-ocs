#!/bin/bash

echo "🧪 ChromaDB v2 API Test"
echo "======================="

echo "Testing ChromaDB v2 endpoints..."

echo ""
echo "🔧 Testing v2 heartbeat:"
curl -s -w "Status: %{http_code}\n" http://127.0.0.1:8000/api/v2/heartbeat

echo ""
echo "🔧 Testing v2 version:"
curl -s -w "Status: %{http_code}\n" http://127.0.0.1:8000/api/v2/version

echo ""
echo "🔧 Testing v2 collections:"
curl -s -w "Status: %{http_code}\n" http://127.0.0.1:8000/api/v2/collections

echo ""
echo "🔧 Response content from v2 heartbeat:"
curl -s http://127.0.0.1:8000/api/v2/heartbeat

echo ""
echo ""
echo "✅ If heartbeat returns 200, we're good to go!"

#!/bin/bash

echo "🧪 Quick ChromaDB Endpoint Test"
echo "==============================="

echo "Testing the most likely ChromaDB endpoints..."

# Test the endpoints that usually work
echo ""
echo "🔧 Testing root endpoint:"
curl -s http://127.0.0.1:8000/

echo ""
echo ""
echo "🔧 Testing heartbeat (no /api/v1):"
curl -s http://127.0.0.1:8000/heartbeat

echo ""
echo ""
echo "🔧 Testing version endpoint:"
curl -s http://127.0.0.1:8000/api/v1/version

echo ""
echo ""
echo "🔧 HTTP status codes:"
echo "Root: $(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/)"
echo "Heartbeat (no api): $(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/heartbeat)"
echo "API v1 heartbeat: $(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/v1/heartbeat)"
echo "Version: $(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/v1/version)"

#!/bin/bash

# Integration Test Regression - Component interactions
echo "🔗 Integration Test Regression Suite"
echo "==================================="

# Start ChromaDB container for testing
echo "Starting ChromaDB test container..."
docker-compose -f docker-compose.test.yml up -d chromadb

# Wait for ChromaDB to be ready
echo "Waiting for ChromaDB readiness..."
sleep 10

# Run integration tests
echo "Running memory system integration tests..."
npm run test:integration -- tests/integration/memory/ --silent

# Test JSON fallback behavior
echo "Testing JSON fallback when ChromaDB unavailable..."
docker-compose -f docker-compose.test.yml stop chromadb
npm run test:integration -- --testNamePattern="fallback" --silent

# Restart ChromaDB for other tests
docker-compose -f docker-compose.test.yml start chromadb

# Cleanup
echo "Cleaning up test containers..."
docker-compose -f docker-compose.test.yml down

echo "✅ Integration test regression complete"


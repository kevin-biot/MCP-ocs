#!/bin/bash

# Security Regression Tests - Input validation and injection prevention
echo "🔒 Security Regression Test Suite"
echo "================================"

# OpenShift client security tests
echo "Testing OpenShift client injection prevention..."
npm run test:unit -- --testNamePattern="injection|sanitiz" --silent

# Configuration validation security
echo "Testing configuration path traversal prevention..."
npm run test:unit -- --testNamePattern="validation|security" --silent

# Memory system security
echo "Testing memory system input validation..."
npm run test:integration -- --testNamePattern="validation" --silent

echo "✅ Security regression tests complete"


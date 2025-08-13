#!/bin/bash

# Unit Test Regression - Core feature functionality
echo "🧪 Unit Test Regression Suite"
echo "============================="

# Run all unit tests with coverage
echo "Running unit tests with coverage monitoring..."
npm run test:unit -- --coverage --watchAll=false

# Feature-specific unit test regression
echo "Running feature-specific regressions..."

# Configuration system regression
echo "  📋 Configuration system regression..."
npm run test:unit -- tests/unit/config/ --silent

# Logging system regression  
echo "  📝 Logging system regression..."
npm run test:unit -- tests/unit/logging/ --silent

# OpenShift client regression
echo "  🏗️ OpenShift client regression..."
npm run test:unit -- tests/unit/openshift/ --silent

echo "✅ Unit test regression complete"


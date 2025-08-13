#!/bin/bash

# Create MCP-ocs directory structure
echo "Creating MCP-ocs directory structure..."

# Source directories
mkdir -p src/tools/{read-ops,diagnostics,state-mgmt,write-ops}
mkdir -p src/{lib,types,config,utils}

# Script directories  
mkdir -p scripts/{dev,build,deploy}

# Test directories
mkdir -p tests/unit/{tools,lib,utils}
mkdir -p tests/integration/{cluster-tests,workflow-tests}
mkdir -p tests/fixtures/{mock-responses,sample-configs}
mkdir -p tests/helpers

# Documentation
mkdir -p docs/{api,workflows,deployment,examples}

# Configuration
mkdir -p config/{environments,workflows,policies}

# Operational directories
mkdir -p {logs,tmp,dist}

# GitHub workflows
mkdir -p .github/workflows

echo "✅ MCP-ocs directory structure created"

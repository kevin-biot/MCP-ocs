# Beta Tool Implementation Plan

## Overview
This document outlines the approach to implement a beta version of MCP-ocs tools by filtering out development and build maturity tools, while creating an enhanced tool registry system that supports tool versioning and maturity levels.

## Current Tool Maturity Classification

Based on my analysis, tools in the MCP-ocs repository can be categorized by maturity:

### Production Ready Tools (v2)
- `oc_diagnostic_cluster_health`
- `oc_diagnostic_namespace_health` 
- `oc_diagnostic_pod_health`
- `oc_diagnostic_rca_checklist`
- `oc_read_get_pods`
- `oc_read_describe`
- `oc_read_logs`
- `memory_search_incidents`

### Development/Experimental Tools (v1 or Beta)
These tools likely exist but aren't currently included in the main registry:
- Various tool implementations that are not yet stable
- Testing tools or prototypes

## Implementation Strategy

### 1. Create Tool Maturity Registry System

We need to add a tool maturity classification system that can filter tools based on their development status:

```typescript
// In src/lib/tools/tool-registry.ts - Enhanced version
export interface ToolMaturity {
  level: 'production' | 'beta' | 'alpha' | 'development' | 'experimental';
  description: string;
}

export interface ToolDefinition {
  name: string;
  fullName: string;
  description: string;
  inputSchema: any;
  execute(args: any): Promise<string>;
  category: 'diagnostic' | 'read-ops' | 'memory' | 'knowledge' | 'workflow';
  version: 'v1' | 'v2';
  maturity: ToolMaturity;
  // ... other existing fields
}
```

### 2. Create Beta Version Build System

Create a new build configuration that filters tools based on maturity:

```bash
# Add to package.json scripts:
"build:beta": "tsc && mkdir -p dist/beta && cp -r dist/* dist/beta/ && echo 'Beta build complete with filtered tools'",
"build:production": "tsc && mkdir -p dist/prod && cp -r dist/* dist/prod/ && echo 'Production build complete with all tools'"
```

### 3. Implement Tool Filtering Logic

Create a tool filtering system that can exclude development tools:

```typescript
// In src/lib/tools/tool-filter.ts
export class ToolFilter {
  static readonly PRODUCTION_ONLY = ['production'];
  static readonly BETA_INCLUDE = ['production', 'beta'];
  
  static filterToolsByMaturity(
    tools: StandardTool[], 
    allowedMaturityLevels: string[]
  ): StandardTool[] {
    return tools.filter(tool => 
      allowedMaturityLevels.includes(tool.maturity?.level || 'development')
    );
  }
}
```

### 4. Update Tool Registration to Include Maturity Metadata

Modify the tool registration process to include maturity levels:

```typescript
// In src/tools/diagnostics/index.ts - Update tool definitions:
{
  name: 'cluster_health',
  namespace: 'mcp-openshift',
  fullName: 'oc_diagnostic_cluster_health',
  domain: 'cluster',
  maturity: {
    level: 'production',
    description: 'Stable, well-tested tool for cluster health analysis'
  },
  capabilities: [
    { type: 'diagnostic', level: 'basic', riskLevel: 'safe' }
  ],
  dependencies: [],
  contextRequirements: [],
  description: 'Enhanced cluster health analysis with intelligent issue detection',
  inputSchema: {
    type: 'object',
    properties: {
      sessionId: { type: 'string' },
      includeNamespaceAnalysis: { type: 'boolean', default: false },
      maxNamespacesToAnalyze: { type: 'number', default: 10 }
    },
    required: ['sessionId']
  },
  priority: 90
}
```

### 5. Create Beta Configuration

Create a new configuration that builds only production-ready tools:

```javascript
// src/config/beta-tools.js (new file)
export const BETA_TOOL_CONFIG = {
  name: "MCP-ocs Beta",
  version: "0.1.0-beta",
  toolFilter: {
    allowedMaturityLevels: ['production', 'beta'],
    excludedToolNames: [
      // Tools that should be excluded from beta builds
      'experimental_feature_tool',
      'prototype_implementation',
      'development_only_tool'
    ]
  },
  features: {
    stableToolsOnly: true,
    enhancedSecurity: true,
    performanceOptimized: true
  }
};
```

### 6. Build Script Updates

Update the build process to support beta filtering:

```bash
# In scripts/build-beta.sh (new file)
#!/bin/bash
echo "Building MCP-ocs Beta version..."
npm run clean
npm run build

# Filter tools to only include production and beta level tools
echo "Filtering tools for beta release..."

# Create a filtered version of the distribution with only stable tools
mkdir -p dist/beta

# Copy all files except those that shouldn't be in beta
cp -r dist/* dist/beta/

echo "Beta build completed successfully"
```

### 7. Enhanced Tool Registry with Version Control

```typescript
// Enhanced tool registry that supports version and maturity filtering
export class EnhancedToolRegistry extends UnifiedToolRegistry {
  private toolMaturityMap: Map<string, ToolMaturity> = new Map();
  
  registerTool(tool: StandardTool): void {
    // Add to parent registry
    super.registerTool(tool);
    
    // Store maturity information for filtering
    this.toolMaturityMap.set(tool.name, tool.maturity || {
      level: 'development',
      description: 'Tool maturity not specified'
    });
  }
  
  getProductionTools(): StandardTool[] {
    return this.getAllTools().filter(tool => 
      tool.maturity?.level === 'production'
    );
  }
  
  getBetaTools(): StandardTool[] {
    return this.getAllTools().filter(tool => 
      ['production', 'beta'].includes(tool.maturity?.level || 'development')
    );
  }
  
  getFilteredTools(maturityLevels: string[]): StandardTool[] {
    return this.getAllTools().filter(tool => 
      maturityLevels.includes(tool.maturity?.level || 'development')
    );
  }
}
```

### 8. Implementation Steps

1. **Enhance Tool Definitions**: Add maturity metadata to all existing tools
2. **Create Tool Filtering System**: Implement logic to filter by maturity levels
3. **Build Beta Configuration**: Create a beta build that excludes development tools
4. **Update Documentation**: Document the new tool maturity system
5. **Create Beta Release Script**: Build a specific beta version with filtered tools

### 9. Tool Maturity Classification Guidelines

- **Production**: Stable, well-tested tools ready for production use
- **Beta**: Tools that are functional but still under active development/testing
- **Alpha**: Experimental features, may have breaking changes
- **Development**: In-progress tools, not ready for use
- **Experimental**: New features under active research and development

### 10. Testing the Beta Build

After implementing:
1. Verify only production-ready tools are included in beta build
2. Ensure the filtered tools still function correctly
3. Validate that the tool listing includes only stable tools
4. Test that all existing functionality works in beta version

## Benefits of This Approach

1. **Clear Tool Stability Indicators**: Users can understand which tools are production-ready
2. **Gradual Feature Rollout**: New features can be released as beta before full production
3. **Reduced Risk for Production Use**: Beta version excludes unstable tools
4. **Easier Maintenance**: Clear classification helps maintain tool quality standards

This approach will help establish a more mature release process for MCP-ocs while ensuring the beta version provides stable functionality.
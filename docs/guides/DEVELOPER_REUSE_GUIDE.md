# MCP-ocs Developer Reuse Guide

## Overview

This guide provides documentation for reusing elements from the MCP-ocs codebase in new MCP server implementations. The MCP-ocs system offers a comprehensive framework that can be leveraged as a foundation for building new MCP-based applications with minimal code duplication.

## Reusable Components

### 1. Core MCP Server Framework
**Location**: `src/index.ts` and related server components

**What's Reusable**:
- Complete MCP server implementation using Model Context Protocol SDK
- Stdio transport configuration
- Tool listing and execution handlers
- Standard MCP protocol compliance

**Usage Notes**:
- Can be used as-is for basic MCP server functionality
- Requires minimal configuration for new tool integrations

### 2. Tool Registration System
**Location**: `src/lib/tools/` directory

**What's Reusable**:
- `ToolRegistry` - Central tool management system
- `ToolDefinition` interface with standardized properties
- Namespace and domain organization patterns (ADR-004)
- Context-aware tool filtering

**Usage Notes**:
- Follows established naming conventions (`oc_diagnostic_`, `oc_read_`, etc.)
- Supports external tool registration via `registerExternalTool()`

### 3. Memory Management System
**Location**: `src/lib/memory/` directory

**What's Reusable**:
- `SharedMemoryManager` - JSON + ChromaDB dual storage
- `VectorMemoryManager` - Semantic search capabilities  
- `AutoMemorySystem` - Intelligent tool execution tracking
- Operational and conversation memory systems

**Usage Notes**:
- Requires ChromaDB for vector storage (can be adapted for other backends)
- Includes proper error handling and memory cleanup

### 4. OpenShift/Kubernetes Integration Layer
**Location**: `src/lib/openshift-client.ts` and related components

**What's Reusable**:
- OC command wrapper with proper error handling
- Resource retrieval and description capabilities
- Pod logs and status monitoring
- Context-aware resource operations

**Usage Notes**:
- Tightly coupled to OpenShift/Kubernetes context
- Can be abstracted for generic Kubernetes operations

### 5. Diagnostic and Health Analysis Framework
**Location**: `src/tools/diagnostics/` directory

**What's Reusable**:
- Cluster health analysis with intelligent issue detection
- Namespace and pod health checking with detailed reporting
- RCA checklist implementation for systematic incident response
- Enhanced error handling and operational context awareness

## Adding New Tools to the Framework

### Tool Structure Guidelines

1. **Directory Organization**:
   ```
   src/tools/new-category/
   ├── index.ts          # Tool definitions and registration
   └── specific-tool.ts  # Individual tool implementations
   ```

2. **Tool Definition Pattern**:
   ```typescript
   // In src/tools/new-category/index.ts
   export class NewCategoryTools {
     getTools(): ToolDefinition[] {
       return [
         {
           name: 'new_tool',
           namespace: 'mcp-new-category',  // Use mcp- prefix
           fullName: 'oc_new_category_new_tool',
           domain: 'cluster',
           priority: 80,
           capabilities: [
             { type: 'read', level: 'basic', riskLevel: 'safe' }
           ],
           dependencies: [],
           contextRequirements: [],
           description: 'Description of the tool functionality',
           inputSchema: {
             type: 'object',
             properties: {
               sessionId: { type: 'string' },
               // Add other parameters as needed
             },
             required: ['sessionId']
           }
         }
       ];
     }

     async executeTool(toolName: string, args: any): Promise<string> {
       // Implementation here
     }
   }
   ```

3. **Integration into Main Server**:
   ```typescript
   // In src/index.ts
   const newCategoryTools = new NewCategoryTools();
   
   // Add to the tools array:
   const allTools = [
     ...diagnosticTools.getTools(),
     ...readOpsTools.getTools(), 
     ...stateMgmtTools.getTools(),
     ...newCategoryTools.getTools()  // Add new tools here
   ];
   ```

### Tool Naming Conventions

**Follow established patterns**:
- `oc_diagnostic_*` - Diagnostic tools
- `oc_read_*` - Read operations  
- `oc_write_*` - Write operations
- `memory_*` - Memory management tools
- `core_*` - Core system tools

## Memory System Usage

### Vector Memory Integration

The memory system provides:

1. **Semantic Search**: ChromaDB integration for vector storage
2. **Dual Storage**: JSON + Vector storage combination  
3. **Auto-Memory**: Automatic tracking of tool executions

### Usage Example:

```typescript
// Using the shared memory manager in new tools:
const sharedMemory = new SharedMemoryManager({
  domain: 'mcp-new-project',
  namespace: 'default', 
  memoryDir: './memory',
  enableCompression: true,
  retentionDays: 30,
  chromaHost: '127.0.0.1',
  chromaPort: 8000
});

// Storing operational data:
await sharedMemory.storeOperational({
  incidentId: 'example-incident',
  domain: 'operations',
  timestamp: Date.now(),
  symptoms: ['test symptom'],
  rootCause: 'test cause',
  resolution: 'test resolution',
  affectedResources: [],
  diagnosticSteps: ['test step'],
  tags: ['test', 'example'],
  environment: 'dev'
});
```

## Important Warnings and Considerations

### 1. **ChromaDB Dependency**
- The memory system is tightly coupled to ChromaDB
- For alternative vector stores, you'll need to create adapter patterns
- Memory collections are not automatically cleaned up (see known issue)

### 2. **Tool Registration Issues**
- Known issue: `knowledge_seed_pattern` tool not being properly routed
- Root cause: Tool name prefixes must match routing logic patterns:
  - `oc_diagnostic_` 
  - `oc_read_`
  - `memory_` or `core_`

### 3. **Namespace Consistency**
- Tool names must follow established naming conventions to be properly routed
- Missing prefixes will result in "Unknown tool" errors
- Use proper namespace prefixes (`mcp-openshift`, `mcp-memory`, etc.)

### 4. **Build and Deployment Considerations**
- All TypeScript files must compile correctly for proper integration
- Ensure all imports resolve properly in the compiled JavaScript
- Build process should include all tool files

### 5. **Context-Aware Execution**
- Tools may require specific operational contexts to function properly
- Memory and workflow systems are configured for specific use cases
- Consider the operational context when reusing components

## Best Practices for Reuse

### 1. **Preserve Established Patterns**
- Maintain consistent tool naming conventions
- Follow the existing module structure patterns
- Use the same interfaces and types where possible

### 2. **Modular Integration**
- Add new tool categories as separate modules
- Maintain clear separation between core framework and domain tools
- Use the existing tool registry for proper integration

### 3. **Testing Strategy**
- Test new tools with the existing tool registration system
- Verify tool routing and execution work correctly
- Validate memory integration works as expected

### 4. **Configuration Management**
- Keep configuration consistent with existing patterns
- Use the same memory and workflow system configurations where appropriate
- Document any deviations from standard setup

## Getting Started with Reuse

### Step 1: Set Up Basic Framework
```bash
# Clone or copy the MCP-ocs structure
git clone <mcp-ocs-repo> new-mcp-project
cd new-mcp-project

# Install dependencies
npm install
```

### Step 2: Add New Tool Category
```bash
mkdir src/tools/new-category
```

### Step 3: Implement Tool Definitions
Follow the established patterns in existing tool directories.

### Step 4: Register Tools
Add new tools to the `allTools` array in `src/index.ts`.

### Step 5: Test Integration
Run the server and verify new tools appear in tool listings.

## Known Issues to Address

### 1. **Tool Routing Problems**
- The `knowledge_seed_pattern` tool demonstrates that tools must match specific routing prefixes
- This is a systemic issue in the current implementation that affects tool registration

### 2. **Memory Collection Cleanup**
- ChromaDB collections may not be properly cleaned up on restarts
- This requires manual intervention in some cases

### 3. **V2 Integration Gaps**
- Some V2 tools (like `checkNamespaceHealthV2Tool`) are commented out in integration
- This suggests potential issues with newer tool implementation patterns

## Migration Path for New Projects

### 1. **Framework Adoption**
- Use the core MCP server implementation as-is
- Leverage existing tool registration patterns
- Adapt memory systems for new use cases

### 2. **Tool Development**
- Create new tool categories following existing patterns
- Use established naming and namespace conventions  
- Integrate with the shared memory management system

### 3. **Customization**
- Modify configuration parameters as needed
- Extend memory and workflow systems where required
- Adapt OpenShift integration for different Kubernetes environments

## Conclusion

The MCP-ocs codebase provides an excellent foundation for building new MCP-based applications. With proper understanding of the tool registration patterns and memory system integration, developers can leverage most of the existing components while adding new functionality through well-defined extension points.

The key to successful reuse is maintaining consistency with the established patterns and addressing the known tool routing issues that currently affect some tool implementations.
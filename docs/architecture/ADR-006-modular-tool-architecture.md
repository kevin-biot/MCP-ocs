# ADR-006: Modular Tool Plugin Architecture

## Status
**PROPOSED** - Not yet implemented

## Context

The current MCP-ocs architecture has tool implementations tightly coupled to the main server, requiring manual registration and code changes for each new tool category. As we expand to support different OpenShift tool sets (diagnostics, operations, Tekton pipelines, etc.), this approach becomes increasingly difficult to maintain.

### Current Issues:
- **Tight Coupling**: Tool classes directly imported into main server
- **Manual Registration**: Each tool requires explicit registration in ToolRegistry
- **Expansion Complexity**: Adding new tool categories requires core server changes
- **Code Duplication**: Similar patterns repeated across tool implementations
- **Testing Isolation**: Difficult to test tool modules independently

### Future Requirements:
- Support for Tekton pipeline tools
- GitOps workflow tools  
- Monitoring and alerting tools
- Custom organizational tools
- Third-party integrations

## Decision

We will implement a **modular plugin architecture** where the MCP server acts as a lightweight orchestrator that auto-discovers and loads tool modules.

### Core Principles:

1. **Plugin Interface**: All tool modules implement a standard `ToolModule` interface
2. **Auto-Discovery**: Modules are automatically discovered and loaded at startup
3. **Dependency Injection**: Core services (OC client, memory, config) injected into modules
4. **Self-Contained**: Each module manages its own tools and lifecycle
5. **Version Management**: Modules have independent versioning

## Detailed Design

### Module Interface
```typescript
export interface ToolModule {
  readonly name: string;           // e.g., 'openshift-diagnostics'
  readonly version: string;        // e.g., '2.0.0'
  readonly domain: string;         // e.g., 'cluster'
  readonly namespace: string;      // e.g., 'mcp-openshift'
  
  // Lifecycle management
  initialize(deps: ModuleDependencies): Promise<void>;
  getTools(): ToolDefinition[];
  executeTool(toolName: string, args: any): Promise<any>;
  cleanup(): Promise<void>;
  
  // Health and status
  isHealthy(): boolean;
  getMetrics(): ModuleMetrics;
}
```

### Directory Structure
```
src/
├── modules/
│   ├── openshift-diagnostics/     ← Self-contained diagnostic tools
│   │   ├── index.ts              ← Implements ToolModule
│   │   ├── cluster-health.ts
│   │   ├── namespace-health.ts
│   │   └── pod-health.ts
│   ├── openshift-operations/      ← Read/write operations
│   │   ├── index.ts
│   │   └── tools/
│   ├── tekton-pipelines/          ← Future: Tekton tools
│   │   ├── index.ts
│   │   └── tools/
│   ├── gitops-workflows/          ← Future: GitOps tools
│   │   ├── index.ts
│   │   └── tools/
│   └── memory-operations/         ← Memory and incident management
│       ├── index.ts
│       └── tools/
└── core/
    ├── mcp-server.ts             ← Lightweight orchestrator
    ├── module-registry.ts        ← Auto-discovery and loading
    ├── interfaces/               ← Standard interfaces
    └── services/                 ← Shared services
```

### Module Loading Strategy
```typescript
export class ModuleRegistry {
  private modules = new Map<string, ToolModule>();
  
  async loadModules(dependencies: ModuleDependencies): Promise<void> {
    // Explicit module registration (phase 1)
    const moduleClasses = [
      OpenShiftDiagnosticsModule,
      OpenShiftOperationsModule,
      TektonPipelinesModule,        // Easy to add
      MemoryOperationsModule
    ];
    
    // Future: Auto-discovery from modules/ directory
    // const moduleClasses = await this.discoverModules('./modules');
    
    for (const ModuleClass of moduleClasses) {
      const module = new ModuleClass();
      await module.initialize(dependencies);
      this.registerModule(module);
    }
  }
}
```

### Tool Naming Convention
```typescript
// Module-scoped tool names
'openshift.diagnostics.cluster_health'
'openshift.diagnostics.namespace_health'
'openshift.operations.create_deployment'
'tekton.pipelines.trigger_build'
'memory.incidents.store'

// Backward compatibility aliases
'oc_diagnostic_cluster_health' → 'openshift.diagnostics.cluster_health'
```

## Implementation Strategy

### Phase 1: Core Infrastructure (Week 1)
- Define `ToolModule` interface and base classes
- Implement `ModuleRegistry` with explicit module loading
- Create `ModuleDependencies` injection system
- Maintain backward compatibility with current tool names

### Phase 2: Module Migration (Week 2)
- Refactor existing tools into modules:
  - `OpenShiftDiagnosticsModule`
  - `OpenShiftOperationsModule` 
  - `MemoryOperationsModule`
- Update main server to use module registry
- Comprehensive testing of refactored system

### Phase 3: New Module Development (Week 3+)
- Implement `TektonPipelinesModule` as proof of concept
- Add auto-discovery mechanism
- Performance optimization and caching at module level
- Documentation and developer guides

### Phase 4: Advanced Features (Future)
- Hot-reloading of modules
- Module dependency management
- Module marketplace/registry
- Cross-module communication

## Benefits

### Developer Experience
- **Easy Expansion**: New tool categories require only implementing `ToolModule`
- **Independent Development**: Modules can be developed and tested in isolation
- **Clear Boundaries**: Well-defined interfaces and responsibilities
- **Reusable Patterns**: Standard module template for all tool categories

### Operational Benefits
- **Selective Loading**: Enable/disable modules based on environment
- **Independent Scaling**: Modules can have different performance characteristics
- **Fault Isolation**: Module failures don't crash entire system
- **Metrics Granularity**: Per-module health and performance monitoring

### Maintenance Benefits
- **Reduced Coupling**: Core server logic separate from tool implementations
- **Version Management**: Modules can be versioned and updated independently
- **Testing Simplification**: Unit test modules without full server context
- **Code Organization**: Related tools grouped in logical modules

## Risks and Mitigation

### Complexity Risk
- **Risk**: Over-engineering for current simple use case
- **Mitigation**: Implement incrementally, maintain backward compatibility

### Performance Risk  
- **Risk**: Module loading overhead and indirection costs
- **Mitigation**: Lazy loading, caching, and performance monitoring

### Breaking Changes Risk
- **Risk**: Existing tool integrations break during refactoring
- **Mitigation**: Maintain tool name aliases, comprehensive testing

## Alternative Approaches Considered

### Monolithic Tool Registry (Current)
- **Pros**: Simple, direct, minimal abstraction
- **Cons**: Tight coupling, difficult expansion, code duplication

### Service-Oriented Architecture
- **Pros**: Ultimate flexibility, true microservices
- **Cons**: Over-complex for current scope, network overhead

### Configuration-Based Tools
- **Pros**: No code changes for new tools
- **Cons**: Limited flexibility, complex configuration

## Success Criteria

### Technical Metrics
- Zero downtime during module refactoring
- < 100ms additional latency for module indirection
- 100% backward compatibility for existing tool names
- < 5 minutes to add new tool module

### Organizational Metrics  
- Tekton module implemented without core server changes
- New team members can add tools without core architecture knowledge
- Module-specific testing reduces integration test complexity

## Implementation Notes

### Backward Compatibility Strategy
```typescript
// Maintain current tool names as aliases
const TOOL_ALIASES = {
  'oc_diagnostic_cluster_health': 'openshift.diagnostics.cluster_health',
  'oc_read_get_pods': 'openshift.operations.get_pods',
  'memory_store_incident': 'memory.incidents.store'
};
```

### Module Template
```typescript
// Standard module template for rapid development
export abstract class BaseToolModule implements ToolModule {
  // Common functionality, lifecycle management
  // Tool registration helpers
  // Error handling patterns
  // Logging and metrics integration
}
```

### Configuration Integration
```yaml
# config/modules.yaml
modules:
  openshift-diagnostics:
    enabled: true
    config:
      timeout: 30000
      caching: true
  tekton-pipelines:
    enabled: false  # Environment-specific enablement
    config:
      tekton_url: "https://tekton.example.com"
```

## Future Enhancements

### Auto-Discovery (Phase 4)
```typescript
// Scan modules/ directory for ToolModule implementations
const modules = await glob('./modules/*/index.js');
const moduleClasses = await Promise.all(
  modules.map(path => import(path).then(m => m.default))
);
```

### Module Marketplace
- Standard module packaging format
- Module dependency resolution
- Community-contributed modules
- Version compatibility matrix

### Cross-Module Communication
```typescript
// Modules can communicate through message bus
interface ModuleBus {
  publish(event: ModuleEvent): void;
  subscribe(eventType: string, handler: EventHandler): void;
}
```

---

**Decision Date**: August 11, 2025  
**Participants**: Development Team  
**Next Review**: After Phase 1 implementation  

**This ADR establishes the foundation for scalable, maintainable tool expansion in MCP-ocs.**

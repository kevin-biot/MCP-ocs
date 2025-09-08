# MCP-OCS Software Architecture

> **Comprehensive guide to the MCP-OCS class hierarchies, interfaces, and software engineering patterns for contributors and maintainers.**

## Table of Contents

- [Core Architecture Principles](#core-architecture-principles)
- [Interface Hierarchy](#interface-hierarchy)
- [Class Implementation Patterns](#class-implementation-patterns)
- [Dependency Injection Framework](#dependency-injection-framework)
- [Tool Registration System](#tool-registration-system)
- [Memory Integration Architecture](#memory-integration-architecture)
- [Error Handling Patterns](#error-handling-patterns)
- [Extension Points](#extension-points)
- [Performance Considerations](#performance-considerations)
- [Testing Architecture](#testing-architecture)

## Core Architecture Principles

### 1. Interface Segregation
MCP-OCS follows strict interface segregation principles, ensuring that classes only depend on interfaces they actually use.

```typescript
// Core tool interfaces
interface ToolSuite {
  category: string;
  version: string;
  getTools(): StandardTool[];
}

interface StandardTool {
  name: string;
  fullName: string;
  description: string;
  inputSchema: any;
  execute(args: any): Promise<string>;
  category: 'diagnostic' | 'read-ops' | 'memory' | 'knowledge' | 'workflow';
  version: 'v1' | 'v2';
  metadata?: ToolMetadata;
}
```

### 2. Dependency Inversion
High-level modules (tool suites) don't depend on low-level modules (specific implementations). Both depend on abstractions.

```typescript
// High-level module depends on abstraction
class DiagnosticToolsV2 implements ToolSuite {
  constructor(
    private openshiftClient: OpenShiftClient,    // ← Interface, not concrete class
    private memoryManager: SharedMemoryManager   // ← Interface, not concrete class
  ) {}
}
```

### 3. Single Responsibility
Each class has a single, well-defined responsibility:
- **ToolSuite**: Organizes and exposes related tools
- **StandardTool**: Executes a specific operation
- **MemoryGateway**: Handles memory storage and retrieval
- **OcWrapper**: Manages OpenShift CLI interactions

## Interface Hierarchy

### Core Tool Interfaces

```typescript
interface ToolDefinition {
  name: string;
  namespace: string;
  fullName: string;
  domain: string;
  priority: number;
  capabilities: ToolCapability[];
  dependencies: string[];
  contextRequirements: ContextRequirement[];
  description: string;
  inputSchema: JSONSchema;
}

interface ToolCapability {
  type: 'diagnostic' | 'read' | 'write' | 'memory';
  level: 'basic' | 'advanced' | 'expert';
  riskLevel: 'safe' | 'moderate' | 'dangerous';
}

interface ContextRequirement {
  type: 'domain_focus' | 'cluster_access' | 'namespace_scope';
  value: string;
  required: boolean;
}
```

### Memory System Interfaces

```typescript
interface MemoryManager {
  storeOperational(incident: OperationalIncident): Promise<string>;
  searchIncidents(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  searchOperational(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  getStats(detailed?: boolean): Promise<MemoryStats>;
}

interface ToolMemoryGateway {
  storeToolExecution(
    toolName: string,
    args: any,
    result: any,
    sessionId: string,
    tags: string[],
    domain: string,
    environment: string,
    severity: string
  ): Promise<void>;
}
```

### OpenShift Integration Interfaces

```typescript
interface OpenShiftClient {
  executeCommand(command: string[]): Promise<CommandResult>;
  getClusterInfo(): Promise<ClusterInfo>;
  describeResource(type: string, name: string, namespace?: string): Promise<string>;
  getLogs(podName: string, namespace: string, options?: LogOptions): Promise<string>;
}

interface OcWrapper {
  executeOc(args: string[], options?: ExecutionOptions): Promise<ExecutionResult>;
  validateCommand(args: string[]): boolean;
  sanitizeArgs(args: string[]): string[];
}
```

## Class Implementation Patterns

### Tool Suite Pattern

All tool suites follow a consistent implementation pattern:

```typescript
export class DiagnosticToolsV2 implements ToolSuite {
  category = 'diagnostic';
  version = 'v2';
  
  // Injected dependencies
  private ocWrapperV2: OcWrapperV2;
  private memoryGateway: ToolMemoryGateway;
  private engines: Map<string, DiagnosticEngine>;

  constructor(
    private openshiftClient: OpenShiftClient,
    private memoryManager: SharedMemoryManager
  ) {
    this.initializeComponents();
  }

  private initializeComponents(): void {
    this.ocWrapperV2 = new OcWrapperV2();
    this.memoryGateway = new ToolMemoryGateway('./memory');
    this.engines = new Map([
      ['rca', new RCAChecklistEngine(this.ocWrapperV2)],
      ['namespace', new NamespaceHealthChecker(this.ocWrapperV2)]
    ]);
  }

  getTools(): StandardTool[] {
    return this.getToolDefinitions().map(def => this.convertToStandardTool(def));
  }

  private getToolDefinitions(): ToolDefinition[] {
    // Return array of tool definitions
  }

  private convertToStandardTool(toolDef: ToolDefinition): StandardTool {
    return {
      name: toolDef.name,
      fullName: toolDef.fullName,
      description: toolDef.description,
      inputSchema: toolDef.inputSchema,
      category: 'diagnostic',
      version: 'v2',
      execute: async (args: any) => this.executeTool(toolDef.fullName, args)
    };
  }

  async executeTool(toolName: string, args: any): Promise<string> {
    // Tool routing logic with error handling and memory integration
  }
}
```

### Engine Pattern

Specialized engines handle complex domain logic:

```typescript
export class RCAChecklistEngine {
  constructor(private ocWrapper: OcWrapperV2) {}

  async executeRCAChecklist(args: RCAArgs): Promise<RCAResult> {
    const result: RCAResult = {
      reportId: this.generateReportId(args.sessionId),
      namespace: args.namespace,
      timestamp: new Date().toISOString(),
      duration: 0,
      overallStatus: 'healthy',
      checksPerformed: [],
      rootCause: null
    };

    const startTime = Date.now();
    
    try {
      // Execute systematic checklist
      result.checksPerformed = await this.executeSystematicChecks(args);
      result.overallStatus = this.determineOverallStatus(result.checksPerformed);
      result.rootCause = this.deriveRootCause(result.checksPerformed, result.overallStatus);
      
      return result;
    } finally {
      result.duration = Date.now() - startTime;
    }
  }

  private async executeSystematicChecks(args: RCAArgs): Promise<CheckResult[]> {
    const checks = [
      () => this.checkClusterHealth(),
      () => this.checkNodeHealth(),
      () => this.checkNamespaceHealth(args.namespace),
      () => this.checkStorageHealth(args.namespace),
      () => this.checkNetworkHealth(args.namespace),
      () => this.checkEventsAnalysis(args.namespace),
      () => this.checkResourceConstraints(args.namespace)
    ];

    return Promise.all(checks.map(check => this.executeCheck(check)));
  }

  private deriveRootCause(checks: CheckResult[], status: string): RootCause | null {
    if (status === 'healthy') return null;

    // Intelligent root cause analysis using pattern matching
    const patterns = [
      this.detectStorageProvisioner,
      this.detectNetworkPolicyBlocks, 
      this.detectResourcePressure,
      this.detectImagePullFailures,
      this.detectApplicationInstability
    ];

    for (const pattern of patterns) {
      const rootCause = pattern(checks);
      if (rootCause) return rootCause;
    }

    return this.createUnknownRootCause(checks);
  }
}
```

## Dependency Injection Framework

### Constructor Injection

MCP-OCS uses constructor injection for dependency management:

```typescript
// Dependencies are injected through constructor
class DiagnosticToolsV2 {
  constructor(
    private openshiftClient: OpenShiftClient,     // ← Required dependency
    private memoryManager: SharedMemoryManager    // ← Required dependency
  ) {
    // Dependencies are available immediately
    this.initializeComponents();
  }
}
```

### Service Locator Pattern

For optional or conditional dependencies:

```typescript
class AdvancedDiagnostics {
  private vectorSearch?: VectorSearchEngine;
  private alertManager?: AlertManagerClient;

  constructor(private serviceLocator: ServiceLocator) {
    // Optional services resolved at runtime
    this.vectorSearch = serviceLocator.getOptional<VectorSearchEngine>('vectorSearch');
    this.alertManager = serviceLocator.getOptional<AlertManagerClient>('alertManager');
  }

  async analyzeWithAI(symptoms: string[]): Promise<Analysis> {
    if (this.vectorSearch) {
      return this.vectorSearch.findSimilarIncidents(symptoms);
    }
    return this.fallbackAnalysis(symptoms);
  }
}
```

### Factory Pattern for Complex Creation

```typescript
export class ToolSuiteFactory {
  static createDiagnosticSuite(
    client: OpenShiftClient,
    memory: SharedMemoryManager,
    config: DiagnosticConfig
  ): DiagnosticToolsV2 {
    const suite = new DiagnosticToolsV2(client, memory);
    
    if (config.enableAdvancedRCA) {
      suite.addEngine(new AdvancedRCAEngine());
    }
    
    if (config.enablePerformanceMetrics) {
      suite.addEngine(new PerformanceAnalysisEngine());
    }
    
    return suite;
  }
}
```

## Tool Registration System

### Unified Registration

All tools register through a unified system:

```typescript
export class ToolRegistry {
  private tools: Map<string, StandardTool> = new Map();
  private suites: Map<string, ToolSuite> = new Map();

  registerSuite(suite: ToolSuite): void {
    this.suites.set(suite.category, suite);
    
    // Auto-register all tools from suite
    suite.getTools().forEach(tool => {
      this.tools.set(tool.fullName, tool);
    });
  }

  getToolsByCategory(category: string): StandardTool[] {
    return Array.from(this.tools.values())
      .filter(tool => tool.category === category);
  }

  getToolsByMaturity(maturity: ToolMaturity): StandardTool[] {
    return Array.from(this.tools.values())
      .filter(tool => tool.metadata?.maturity === maturity);
  }

  validateToolCompatibility(toolName: string): ValidationResult {
    const tool = this.tools.get(toolName);
    if (!tool) return { valid: false, error: 'Tool not found' };
    
    return {
      valid: true,
      maturity: tool.metadata?.maturity || 'unknown',
      lastValidated: tool.metadata?.lastValidated,
      testCoverage: tool.metadata?.testCoverage || 0
    };
  }
}
```

### Tool Maturity System

```typescript
export enum ToolMaturity {
  ALPHA = 'alpha',        // Experimental, may break
  BETA = 'beta',          // Stable API, production testing
  STABLE = 'stable',      // Production ready
  DEPRECATED = 'deprecated' // Scheduled for removal
}

export interface ToolMetadata {
  maturity: ToolMaturity;
  lastValidated: string;
  testCoverage: number;
  requiredPermissions: string[];
  deprecationDate?: string;
  replacedBy?: string;
}
```

## Memory Integration Architecture

### Layered Memory System

```typescript
// Layer 1: Tool Integration
class ToolMemoryGateway {
  constructor(private adapter: MCPOcsMemoryAdapter) {}
  
  async storeToolExecution(/* params */): Promise<void> {
    // Standardized tool execution storage
  }
}

// Layer 2: MCP-OCS Adapter  
class MCPOcsMemoryAdapter {
  constructor(private mcpFilesManager: MCPFilesMemoryManager) {}
  
  async storeOperational(/* params */): Promise<string> {
    // Domain-specific operational incident storage
  }
}

// Layer 3: MCP-Files Integration
class MCPFilesMemoryManager {
  constructor(private chromaManager: ChromaMemoryManager) {}
  
  async store(/* params */): Promise<void> {
    // Raw memory storage with vector indexing
  }
}
```

### Memory Search Patterns

```typescript
interface SearchStrategy {
  execute(query: string, options: SearchOptions): Promise<SearchResult[]>;
}

class VectorSimilaritySearch implements SearchStrategy {
  async execute(query: string, options: SearchOptions): Promise<SearchResult[]> {
    // ChromaDB vector similarity search
  }
}

class TextualSearch implements SearchStrategy {
  async execute(query: string, options: SearchOptions): Promise<SearchResult[]> {
    // Full-text search fallback
  }
}

class HybridSearch implements SearchStrategy {
  constructor(
    private vectorSearch: VectorSimilaritySearch,
    private textSearch: TextualSearch
  ) {}

  async execute(query: string, options: SearchOptions): Promise<SearchResult[]> {
    const [vectorResults, textResults] = await Promise.all([
      this.vectorSearch.execute(query, options),
      this.textSearch.execute(query, options)
    ]);
    
    return this.mergeAndRankResults(vectorResults, textResults);
  }
}
```

## Error Handling Patterns

### Hierarchical Error Handling

```typescript
// Base error types
abstract class MCPOcsError extends Error {
  abstract readonly code: string;
  abstract readonly severity: 'low' | 'medium' | 'high' | 'critical';
  
  constructor(message: string, public readonly context?: any) {
    super(message);
  }
}

class OpenShiftError extends MCPOcsError {
  readonly code = 'OPENSHIFT_ERROR';
  readonly severity = 'high';
}

class MemoryError extends MCPOcsError {
  readonly code = 'MEMORY_ERROR';  
  readonly severity = 'medium';
}

class ToolExecutionError extends MCPOcsError {
  readonly code = 'TOOL_EXECUTION_ERROR';
  readonly severity = 'medium';
}
```

### Error Recovery Strategies

```typescript
class ResilientToolExecutor {
  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    recoveryStrategies: RecoveryStrategy[]
  ): Promise<T> {
    let lastError: Error;
    
    for (const strategy of recoveryStrategies) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (await strategy.canRecover(error)) {
          await strategy.recover(error);
          continue; // Retry after recovery
        }
      }
    }
    
    throw new ToolExecutionError(
      `All recovery strategies failed: ${lastError.message}`,
      { originalError: lastError }
    );
  }
}

interface RecoveryStrategy {
  canRecover(error: Error): Promise<boolean>;
  recover(error: Error): Promise<void>;
}

class OCLoginRecovery implements RecoveryStrategy {
  async canRecover(error: Error): Promise<boolean> {
    return error.message.includes('You must be logged in');
  }
  
  async recover(error: Error): Promise<void> {
    // Attempt to refresh OC login token
  }
}
```

## Extension Points

### Plugin Architecture

```typescript
interface ToolPlugin {
  name: string;
  version: string;
  initialize(context: PluginContext): Promise<void>;
  getTools(): StandardTool[];
  cleanup(): Promise<void>;
}

class PluginManager {
  private plugins: Map<string, ToolPlugin> = new Map();
  
  async loadPlugin(plugin: ToolPlugin): Promise<void> {
    await plugin.initialize(this.createContext());
    this.plugins.set(plugin.name, plugin);
    
    // Register plugin tools
    const tools = plugin.getTools();
    tools.forEach(tool => this.toolRegistry.registerTool(tool));
  }
  
  private createContext(): PluginContext {
    return {
      toolRegistry: this.toolRegistry,
      memoryManager: this.memoryManager,
      logger: this.logger
    };
  }
}
```

### Custom Diagnostic Engines

```typescript
abstract class DiagnosticEngine {
  abstract name: string;
  abstract version: string;
  
  abstract analyze(context: DiagnosticContext): Promise<DiagnosticResult>;
  
  protected createResult(status: string, findings: string[]): DiagnosticResult {
    return {
      engine: this.name,
      version: this.version,
      timestamp: new Date().toISOString(),
      status,
      findings,
      recommendations: this.generateRecommendations(findings)
    };
  }
  
  protected abstract generateRecommendations(findings: string[]): string[];
}

class CustomNetworkDiagnostic extends DiagnosticEngine {
  name = 'network-diagnostic';
  version = '1.0.0';
  
  async analyze(context: DiagnosticContext): Promise<DiagnosticResult> {
    // Custom network diagnostic logic
  }
  
  protected generateRecommendations(findings: string[]): string[] {
    // Custom recommendation logic
  }
}
```

## Performance Considerations

### Lazy Loading

```typescript
class LazyToolSuite implements ToolSuite {
  private _tools?: StandardTool[];
  
  getTools(): StandardTool[] {
    if (!this._tools) {
      this._tools = this.initializeTools();
    }
    return this._tools;
  }
  
  private initializeTools(): StandardTool[] {
    // Expensive initialization only when needed
  }
}
```

### Caching Strategies

```typescript
class CachedDiagnosticEngine {
  private cache = new Map<string, CacheEntry>();
  
  async diagnose(args: DiagnosticArgs): Promise<DiagnosticResult> {
    const cacheKey = this.generateCacheKey(args);
    const cached = this.cache.get(cacheKey);
    
    if (cached && !this.isCacheExpired(cached)) {
      return cached.result;
    }
    
    const result = await this.performDiagnosis(args);
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      ttl: this.getTTL(args)
    });
    
    return result;
  }
}
```

### Resource Management

```typescript
class ResourceManagedTool implements StandardTool {
  private resourcePool: ResourcePool<OpenShiftConnection>;
  
  async execute(args: any): Promise<string> {
    const resource = await this.resourcePool.acquire();
    
    try {
      return await this.doExecute(args, resource);
    } finally {
      this.resourcePool.release(resource);
    }
  }
}
```

## Testing Architecture

### Test Doubles and Mocking

```typescript
// Mock implementations for testing
class MockOpenShiftClient implements OpenShiftClient {
  private responses = new Map<string, any>();
  
  setResponse(command: string, response: any): void {
    this.responses.set(command, response);
  }
  
  async executeCommand(command: string[]): Promise<CommandResult> {
    const key = command.join(' ');
    const response = this.responses.get(key);
    
    if (!response) {
      throw new Error(`No mock response configured for: ${key}`);
    }
    
    return response;
  }
}
```

### Integration Test Patterns

```typescript
describe('DiagnosticToolsV2 Integration', () => {
  let toolSuite: DiagnosticToolsV2;
  let mockClient: MockOpenShiftClient;
  let mockMemory: MockMemoryManager;
  
  beforeEach(() => {
    mockClient = new MockOpenShiftClient();
    mockMemory = new MockMemoryManager();
    toolSuite = new DiagnosticToolsV2(mockClient, mockMemory);
  });
  
  it('should execute cluster health check', async () => {
    // Setup mock responses
    mockClient.setResponse('get nodes -o json', mockNodesResponse);
    mockClient.setResponse('get clusteroperators', mockOperatorsResponse);
    
    // Execute test
    const result = await toolSuite.executeTool('oc_diagnostic_cluster_health', {
      sessionId: 'test-session',
      includeNamespaceAnalysis: false
    });
    
    // Verify results
    const parsed = JSON.parse(result);
    expect(parsed.overallHealth).toBeDefined();
    expect(parsed.nodes).toBeDefined();
    expect(parsed.operators).toBeDefined();
  });
});
```

## Architectural Decision Records (ADRs)

### ADR-001: Interface-Driven Design
**Decision**: Use TypeScript interfaces to define contracts between components
**Rationale**: Enables dependency inversion, improves testability, allows for multiple implementations
**Consequences**: Requires more upfront design, but provides long-term flexibility

### ADR-002: Tool Suite Pattern
**Decision**: Group related tools into suites that implement a common interface
**Rationale**: Provides organizational structure, enables category-based operations, simplifies registration
**Consequences**: Some tools may fit multiple categories, requires careful suite design

### ADR-003: Memory System Layering
**Decision**: Implement layered memory architecture with adapters
**Rationale**: Isolates MCP-OCS from underlying storage, enables storage swapping, provides abstraction
**Consequences**: Additional complexity, but enables future storage migrations

### ADR-004: Engine Pattern for Complex Logic
**Decision**: Extract complex diagnostic logic into specialized engine classes
**Rationale**: Separates concerns, enables testing in isolation, allows for engine swapping
**Consequences**: More classes to maintain, but improved modularity

## Best Practices

### Interface Design
1. **Keep interfaces small and focused** - Single responsibility principle
2. **Use composition over inheritance** - Favor interface composition
3. **Design for extension** - Allow for future capabilities without breaking changes
4. **Document contracts** - Clear documentation of expected behavior

### Dependency Management
1. **Inject dependencies through constructor** - Makes dependencies explicit
2. **Depend on abstractions, not concretions** - Use interfaces for dependencies
3. **Avoid circular dependencies** - Design clear dependency hierarchies
4. **Use factories for complex object creation** - Encapsulate creation logic

### Error Handling
1. **Use typed errors** - Create specific error types for different failure modes
2. **Implement recovery strategies** - Allow for graceful degradation
3. **Log contextual information** - Include relevant context in error messages
4. **Fail fast when appropriate** - Don't mask critical errors

### Performance
1. **Use lazy initialization** - Defer expensive operations until needed
2. **Implement caching strategically** - Cache expensive computations
3. **Pool resources** - Reuse expensive resources like connections
4. **Monitor and measure** - Track performance metrics

## Conclusion

This architecture provides:

- **Scalability**: Easy to add new tool suites and engines
- **Maintainability**: Clear separation of concerns and consistent patterns  
- **Testability**: Comprehensive mocking and testing strategies
- **Extensibility**: Plugin system and well-defined extension points
- **Performance**: Caching, lazy loading, and resource management
- **Reliability**: Hierarchical error handling and recovery strategies

The combination of interface-driven design, dependency injection, and systematic patterns creates a robust foundation for OpenShift operational intelligence tooling that can evolve with changing requirements while maintaining stability and performance.
## Process & Governance Update (v3.3.1)

The organization adopts the Process v3.3.1 11‑artifact template framework for sprint closure. All teams must produce the standardized artifacts to ensure consistent evidence, decisions, and retrospectives.

- Process guide: `sprint-management/TEMPLATE-USAGE-GUIDE-PROCESS-V3.3.1.md`
- Example closure set: `sprint-management/archive/d-009-date-time-safety-2025-09-06/`

Architecture components (diagnostics, normalization, fact model) should reference these artifacts where applicable.

# ADR-004: Tool Namespace Management

**Status:** Accepted  
**Date:** August 10, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor), Qwen Assistant Analysis

## Context

MCP-ocs operates in a multi-domain environment where different MCP servers (Files, Atlassian, Prometheus, OpenShift) expose tools with potential naming conflicts and namespace confusion. Recent analysis by Qwen assistant identified critical issues with tool call confusion, particularly between Atlassian tools and file memory MCP operations.

### Problem Statement

**Tool Namespace Conflicts Identified:**
- **Atlassian vs File Memory Confusion** - Tools from different domains causing execution confusion
- **Inconsistent Naming Patterns** - No standardized tool naming conventions across MCPs
- **Context-Inappropriate Tool Exposure** - All tools visible regardless of current operational context
- **Performance Impact** - Tool confusion leads to inefficient operations and user frustration

### Current Issues (From Qwen Analysis)

1. **Tool Discovery Confusion** - Memory tools found under `files-advanced:` namespace after startup script changes
2. **Cross-Domain Tool Pollution** - Atlassian tools interfering with file memory operations  
3. **Missing Namespace Isolation** - No clear separation between different tool domains
4. **Configuration-Based Tool Filtering Gaps** - Three-stream approach lacks proper tool categorization

## Decision

**Hierarchical Tool Namespace Architecture with Context-Aware Filtering**

### Core Namespace Strategy

```typescript
// Tool namespace hierarchy
const TOOL_NAMESPACES = {
  // Core operations namespace
  'mcp-core': {
    prefix: 'core_',
    domain: 'system',
    tools: ['health_check', 'status', 'config']
  },
  
  // File system operations
  'mcp-files': {
    prefix: 'file_',
    domain: 'filesystem', 
    tools: ['read_file', 'write_file', 'list_directory']
  },
  
  // Memory operations
  'mcp-memory': {
    prefix: 'memory_',
    domain: 'knowledge',
    tools: ['store_conversation', 'search_memory', 'get_session_context']
  },
  
  // OpenShift operations
  'mcp-openshift': {
    prefix: 'oc_',
    domain: 'cluster',
    tools: ['get_pods', 'describe_pod', 'apply_config']
  },
  
  // Atlassian integration
  'mcp-atlassian': {
    prefix: 'atlassian_',
    domain: 'collaboration',
    tools: ['get_issue', 'create_page', 'search_confluence']
  },
  
  // Prometheus monitoring
  'mcp-prometheus': {
    prefix: 'prom_',
    domain: 'monitoring',
    tools: ['query_metrics', 'get_alerts', 'check_health']
  }
};
```

### Context-Aware Tool Filtering

```typescript
interface OperationalContext {
  mode: 'single' | 'team' | 'router';
  primaryDomain: ToolDomain;
  activeDomains: ToolDomain[];
  workflowPhase: 'diagnostic' | 'analysis' | 'resolution';
  environment: 'dev' | 'test' | 'staging' | 'prod';
}

class ContextAwareToolManager {
  private enabledNamespaces: Set<string> = new Set();
  private toolFilters: Map<string, ToolFilter> = new Map();
  
  async setOperationalContext(context: OperationalContext): Promise<void> {
    // Clear previous context
    this.enabledNamespaces.clear();
    this.toolFilters.clear();
    
    // Always enable core tools
    this.enabledNamespaces.add('mcp-core');
    
    // Context-specific namespace activation
    switch (context.mode) {
      case 'single':
        await this.configureSingleUserMode(context);
        break;
      case 'team':
        await this.configureTeamMode(context);
        break;
      case 'router':
        await this.configureRouterMode(context);
        break;
    }
    
    // Domain-specific filtering
    this.configureDomainFiltering(context);
    
    // Workflow-phase filtering
    this.configureWorkflowFiltering(context);
  }
  
  private async configureSingleUserMode(context: OperationalContext): Promise<void> {
    // Single user: Enable files and memory only
    this.enabledNamespaces.add('mcp-files');
    this.enabledNamespaces.add('mcp-memory');
    
    // Conditionally enable domain-specific tools
    if (context.primaryDomain === 'cluster') {
      this.enabledNamespaces.add('mcp-openshift');
    }
    
    // Disable collaboration tools by default in single mode
    this.addToolFilter('atlassian_*', { 
      enabled: false, 
      reason: 'Not available in single user mode' 
    });
  }
  
  private async configureTeamMode(context: OperationalContext): Promise<void> {
    // Team mode: Enable all except router-specific tools
    this.enabledNamespaces.add('mcp-files');
    this.enabledNamespaces.add('mcp-memory');
    this.enabledNamespaces.add('mcp-atlassian');
    
    if (context.activeDomains.includes('cluster')) {
      this.enabledNamespaces.add('mcp-openshift');
    }
    
    if (context.activeDomains.includes('monitoring')) {
      this.enabledNamespaces.add('mcp-prometheus');
    }
  }
  
  private async configureRouterMode(context: OperationalContext): Promise<void> {
    // Router mode: Enable orchestration and routing tools
    this.enabledNamespaces.add('mcp-router');
    
    // Enable all domain tools for routing
    Object.keys(TOOL_NAMESPACES).forEach(namespace => {
      this.enabledNamespaces.add(namespace);
    });
    
    // Add router-specific filtering
    this.configureRouterFiltering(context);
  }
}
```

### Tool Registration and Discovery

```typescript
interface ToolDefinition {
  name: string;
  namespace: string;
  fullName: string; // namespace_prefix + name
  domain: ToolDomain;
  capabilities: ToolCapability[];
  dependencies: string[]; // Required namespaces
  conflictsWith?: string[]; // Conflicting tools
  contextRequirements: ContextRequirement[];
}

class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private namespaceTools: Map<string, Set<string>> = new Map();
  
  registerTool(tool: ToolDefinition): void {
    // Validate namespace consistency
    this.validateNamespaceConsistency(tool);
    
    // Check for conflicts
    this.checkToolConflicts(tool);
    
    // Register tool
    this.tools.set(tool.fullName, tool);
    
    // Update namespace index
    if (!this.namespaceTools.has(tool.namespace)) {
      this.namespaceTools.set(tool.namespace, new Set());
    }
    this.namespaceTools.get(tool.namespace)!.add(tool.fullName);
  }
  
  getAvailableTools(context: OperationalContext): ToolDefinition[] {
    const availableTools: ToolDefinition[] = [];
    
    // Filter by enabled namespaces
    for (const [namespace, toolNames] of this.namespaceTools) {
      if (this.contextManager.isNamespaceEnabled(namespace)) {
        for (const toolName of toolNames) {
          const tool = this.tools.get(toolName)!;
          
          // Apply context-specific filters
          if (this.contextManager.isToolAvailable(tool, context)) {
            availableTools.push(tool);
          }
        }
      }
    }
    
    return availableTools.sort((a, b) => {
      // Prioritize by context relevance
      return this.calculateToolRelevance(b, context) - 
             this.calculateToolRelevance(a, context);
    });
  }
}
```

## Implementation from Qwen Analysis

### Mitigation Strategies Applied

#### 1. Tool Naming Conventions (Qwen Recommendation)
```typescript
// Implement explicit namespace prefixes for different tool domains
const TOOL_NAMING_PATTERNS = {
  files: /^file_[a-z_]+$/,
  memory: /^memory_[a-z_]+$/,
  atlassian: /^atlassian_[a-z_]+$/,
  prometheus: /^prom_[a-z_]+$/,
  openshift: /^oc_[a-z_]+$/
};

function validateToolName(toolName: string, expectedNamespace: string): boolean {
  const pattern = TOOL_NAMING_PATTERNS[expectedNamespace];
  return pattern ? pattern.test(toolName) : false;
}
```

#### 2. Configuration-Driven Tool Selection (Qwen)
```typescript
// Example configuration approach from Qwen analysis
interface MCPConfiguration {
  mcpMode: 'single' | 'team' | 'router';
  enabledTools: {
    fileOperations: boolean;
    memorySystem: boolean;
    atlassianIntegration: boolean;
    prometheusQueries: boolean;
  };
  featureFlags: {
    [key: string]: boolean;
  };
}

class ConfigurationBasedToolFilter {
  filterTools(availableTools: ToolDefinition[], config: MCPConfiguration): ToolDefinition[] {
    return availableTools.filter(tool => {
      // Apply configuration-based filtering
      switch (tool.domain) {
        case 'filesystem':
          return config.enabledTools.fileOperations;
        case 'knowledge':
          return config.enabledTools.memorySystem;
        case 'collaboration':
          return config.enabledTools.atlassianIntegration;
        case 'monitoring':
          return config.enabledTools.prometheusQueries;
        default:
          return true; // Core tools always enabled
      }
    });
  }
}
```

#### 3. Context-Aware Tool Selection (Qwen)
```typescript
// Context-aware filtering based on current task scope
class ContextualToolSelector {
  selectToolsForContext(context: OperationalContext): ToolDefinition[] {
    const selectedTools: ToolDefinition[] = [];
    
    // For File Memory MCP context:
    if (context.primaryDomain === 'filesystem' || context.primaryDomain === 'knowledge') {
      // Prioritize file system operations and memory tools
      selectedTools.push(...this.getToolsByDomain(['filesystem', 'knowledge']));
      
      // Temporarily disable Atlassian integration tools
      this.disableToolsByDomain(['collaboration']);
    }
    
    // For Atlassian Operations context:
    if (context.primaryDomain === 'collaboration') {
      // Enable Jira/Confluence tools while disabling file operations
      selectedTools.push(...this.getToolsByDomain(['collaboration', 'knowledge']));
      
      // Minimize file system tools in this context
      this.deprioritizeToolsByDomain(['filesystem']);
    }
    
    return selectedTools;
  }
}
```

### Tool Registration Layer (Qwen Implementation)

```typescript
// Tool registration system that groups tools by domain
class DomainAwareToolRegistry {
  private toolsByDomain: Map<ToolDomain, Set<ToolDefinition>> = new Map();
  private toolCategories: Map<string, ToolCategory> = new Map();
  
  registerToolsByDomain(domain: ToolDomain, tools: ToolDefinition[]): void {
    if (!this.toolsByDomain.has(domain)) {
      this.toolsByDomain.set(domain, new Set());
    }
    
    const domainTools = this.toolsByDomain.get(domain)!;
    tools.forEach(tool => {
      // Validate tool belongs to domain
      this.validateToolDomainConsistency(tool, domain);
      
      // Register with proper categorization
      domainTools.add(tool);
      this.toolCategories.set(tool.fullName, {
        domain,
        category: this.inferToolCategory(tool),
        conflictDomains: this.identifyConflictDomains(tool, domain)
      });
    });
  }
  
  getToolsForOperationalMode(mode: OperationalMode): ToolDefinition[] {
    const toolsToEnable: ToolDefinition[] = [];
    
    switch (mode) {
      case 'file_memory':
        // Qwen's recommendation: Only file and memory tools
        toolsToEnable.push(...this.getToolsByDomain('filesystem'));
        toolsToEnable.push(...this.getToolsByDomain('knowledge'));
        
        // Explicitly exclude Atlassian tools to prevent confusion
        this.logToolExclusion('collaboration', 'Excluded during file memory operations');
        break;
        
      case 'atlassian_ops':
        // Qwen's recommendation: Atlassian and memory tools
        toolsToEnable.push(...this.getToolsByDomain('collaboration'));
        toolsToEnable.push(...this.getToolsByDomain('knowledge'));
        
        // Minimize file system tools
        this.logToolExclusion('filesystem', 'Minimized during Atlassian operations');
        break;
        
      case 'router_orchestration':
        // All tools available but with proper routing
        toolsToEnable.push(...this.getAllRegisteredTools());
        break;
    }
    
    return toolsToEnable;
  }
}
```

## Configuration-Based Tool Activation (Three-Stream Integration)

```typescript
// Integration with three-stream configuration system
interface StreamConfiguration {
  streamType: 'single' | 'team' | 'router';
  toolActivation: {
    [namespace: string]: ToolActivationConfig;
  };
  contextRules: ContextRule[];
}

interface ToolActivationConfig {
  enabled: boolean;
  priority: number;
  restrictions?: ToolRestriction[];
  dependencies?: string[];
}

class ThreeStreamToolManager {
  private streamConfigs: Map<string, StreamConfiguration> = new Map();
  
  async activateStreamConfiguration(streamType: string): Promise<void> {
    const config = this.streamConfigs.get(streamType);
    if (!config) {
      throw new Error(`Unknown stream configuration: ${streamType}`);
    }
    
    // Apply tool activation rules
    for (const [namespace, activation] of Object.entries(config.toolActivation)) {
      if (activation.enabled) {
        await this.enableNamespace(namespace, activation);
      } else {
        await this.disableNamespace(namespace, activation.restrictions);
      }
    }
    
    // Apply context rules
    await this.applyContextRules(config.contextRules);
    
    // Log configuration changes
    this.logConfigurationChange(streamType, config);
  }
  
  // Example stream configurations
  private initializeStreamConfigs(): void {
    // Single User Stream - Qwen's recommendation applied
    this.streamConfigs.set('single', {
      streamType: 'single',
      toolActivation: {
        'mcp-core': { enabled: true, priority: 100 },
        'mcp-files': { enabled: true, priority: 90 },
        'mcp-memory': { enabled: true, priority: 90 },
        'mcp-openshift': { enabled: true, priority: 80 },
        'mcp-atlassian': { 
          enabled: false, 
          priority: 0,
          restrictions: ['single_user_mode']
        },
        'mcp-prometheus': { enabled: false, priority: 0 }
      },
      contextRules: [
        {
          condition: 'primary_domain === "filesystem"',
          action: 'disable_namespace',
          target: 'mcp-atlassian',
          reason: 'Prevent file/Atlassian tool confusion'
        }
      ]
    });
    
    // Team Stream - Enhanced collaboration
    this.streamConfigs.set('team', {
      streamType: 'team',
      toolActivation: {
        'mcp-core': { enabled: true, priority: 100 },
        'mcp-files': { enabled: true, priority: 85 },
        'mcp-memory': { enabled: true, priority: 95 }, // Higher priority for team memory
        'mcp-openshift': { enabled: true, priority: 80 },
        'mcp-atlassian': { enabled: true, priority: 90 },
        'mcp-prometheus': { enabled: true, priority: 70 }
      },
      contextRules: [
        {
          condition: 'workflow_phase === "collaboration"',
          action: 'prioritize_namespace',
          target: 'mcp-atlassian',
          reason: 'Enhance collaboration tool visibility'
        }
      ]
    });
    
    // Router Stream - Full orchestration
    this.streamConfigs.set('router', {
      streamType: 'router',
      toolActivation: {
        'mcp-core': { enabled: true, priority: 100 },
        'mcp-router': { enabled: true, priority: 95 },
        'mcp-files': { enabled: true, priority: 70 },
        'mcp-memory': { enabled: true, priority: 90 },
        'mcp-openshift': { enabled: true, priority: 85 },
        'mcp-atlassian': { enabled: true, priority: 75 },
        'mcp-prometheus': { enabled: true, priority: 80 }
      },
      contextRules: [
        {
          condition: 'router_mode === "orchestration"',
          action: 'enable_all_with_routing',
          target: '*',
          reason: 'Router provides intelligent tool selection'
        }
      ]
    });
  }
}
```

## Immediate Mitigation Steps (Qwen Recommendations)

### 1. Implement Explicit Tool Naming
```bash
# Update all MCP servers to use consistent prefixes
# Files MCP: file_*, memory_*
# Atlassian MCP: atlassian_*
# OpenShift MCP: oc_*
# Prometheus MCP: prom_*
```

### 2. Enable Configuration-Based Filtering
```typescript
// Use three-stream approach to selectively enable tools
const currentConfig = {
  mcpMode: 'single', // or 'team', 'router'
  activeContext: 'file_memory', // or 'atlassian_ops', 'cluster_ops'
  enabledDomains: ['filesystem', 'knowledge'], // Exclude 'collaboration'
  toolFilters: {
    'atlassian_*': { enabled: false, reason: 'File memory context active' }
  }
};
```

### 3. Create Context-Aware Tool Selection
```typescript
// Dynamic tool filtering based on current operational context
class ContextManager {
  setContext(context: 'file_memory' | 'atlassian_ops' | 'cluster_ops'): void {
    switch (context) {
      case 'file_memory':
        this.enableDomains(['filesystem', 'knowledge']);
        this.disableDomains(['collaboration']);
        break;
      case 'atlassian_ops':
        this.enableDomains(['collaboration', 'knowledge']);
        this.deprioritizeDomains(['filesystem']);
        break;
      case 'cluster_ops':
        this.enableDomains(['cluster', 'monitoring', 'knowledge']);
        this.deprioritizeDomains(['collaboration']);
        break;
    }
  }
}
```

### 4. Document Tool Categories
```typescript
// Clear documentation of which tools belong to which domains
const TOOL_DOMAIN_MAPPING = {
  filesystem: ['file_read', 'file_write', 'list_directory', 'search_files'],
  knowledge: ['memory_store', 'memory_search', 'session_context'],
  collaboration: ['atlassian_get_issue', 'atlassian_create_page'],
  cluster: ['oc_get_pods', 'oc_describe', 'oc_apply'],
  monitoring: ['prom_query', 'prom_alerts', 'prom_health']
};
```

## Rationale

### Benefits from Qwen Analysis Integration:
✅ **Eliminates Tool Confusion** - Clear namespace separation prevents cross-domain interference  
✅ **Context-Appropriate Tools** - Only relevant tools exposed for current operation  
✅ **Configuration-Driven** - Three-stream approach enables flexible tool activation  
✅ **Performance Improvement** - Reduced tool set improves selection speed and accuracy  
✅ **Maintainable Architecture** - Clear ownership and categorization of tools  
✅ **Prevents User Frustration** - Eliminates "wrong tool for the job" scenarios  

### Addresses Specific Issues:
✅ **Atlassian/File Memory Conflicts** - Resolved through context-aware filtering  
✅ **Namespace Pollution** - Clean separation with explicit prefixes  
✅ **Configuration Complexity** - Unified three-stream configuration system  
✅ **Tool Discovery Problems** - Predictable namespace-based tool organization  

## Implementation Priority

### Phase 1: Immediate Fixes (1-2 weeks)
1. **Implement Tool Prefixing** - Add consistent namespace prefixes to all tools
2. **Create Context Manager** - Basic context-aware tool filtering
3. **Update Configuration** - Integrate with three-stream configuration system

### Phase 2: Advanced Features (2-3 weeks) 
4. **Tool Registry System** - Centralized tool registration and discovery
5. **Dynamic Context Switching** - Ability to change contexts during operation
6. **Conflict Detection** - Automatic detection of tool conflicts

### Phase 3: Optimization (1 week)
7. **Performance Tuning** - Optimize tool filtering and selection
8. **Advanced Analytics** - Track tool usage patterns and conflicts
9. **User Experience** - Tool suggestions based on context

## Success Metrics

### Conflict Resolution:
- **Tool Confusion Incidents** - Reduce to zero within 30 days
- **Context Accuracy** - 95%+ tools relevant to current operation
- **User Satisfaction** - Improved tool selection experience

### Configuration Effectiveness:
- **Stream Configuration Success** - 100% successful mode transitions
- **Tool Activation Accuracy** - Correct tools enabled for each stream
- **Performance Impact** - No degradation in tool response time

### Development Efficiency:
- **Namespace Consistency** - All new tools follow naming conventions
- **Documentation Coverage** - 100% of tools categorized and documented
- **Maintenance Overhead** - Reduced time spent on tool conflicts

## Review and Evolution

Monitor monthly:
- **Tool Usage Patterns** - Which tools used in which contexts
- **Conflict Detection** - Any remaining tool confusion incidents
- **Stream Configuration Effectiveness** - Success rate of context switches
- **User Feedback** - Developer experience with namespace management
- **Performance Impact** - Tool selection and filtering performance

## Integration with Other ADRs

**ADR-002 (GitOps Strategy):** Tool namespace management ensures proper tool selection for GitOps operations vs emergency procedures.

**ADR-003 (Memory Patterns):** Memory tools properly namespaced and context-aware to prevent conflicts with other domains.

**ADR-005 (Workflow State Machine):** State machine controls which tool namespaces are available during different workflow phases.

This ADR directly addresses the critical tool namespace issues identified by Qwen assistant analysis and provides a comprehensive solution for the MCP ecosystem tool management challenges.

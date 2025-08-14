/**
 * Unified Tool Registry - Standardized MCP Tool Registration
 * 
 * Eliminates inconsistent registration patterns and provides unified
 * interface for all tool types (v1, v2, individual, collections)
 */

import { ToolMaturity, type ToolDefinitionMeta } from '../../types/tool-maturity.js';
import { VALIDATED_TOOLS } from '../../registry/validated-tools.js';

export interface StandardTool {
  /** Unique tool identifier */
  name: string;
  
  /** Full name for MCP registration */
  fullName: string;
  
  /** Tool description for users */
  description: string;
  
  /** JSON schema for input validation */
  inputSchema: any;
  
  /** Tool execution method - MUST return JSON string */
  execute(args: any): Promise<string>;
  
  /** Tool category for organization */
  category: 'diagnostic' | 'read-ops' | 'memory' | 'knowledge' | 'workflow';
  
  /** Tool version for compatibility */
  version: 'v1' | 'v2';
  
  /** Optional metadata */
  metadata?: {
    author?: string;
    deprecated?: boolean;
    experimental?: boolean;
    requiredPermissions?: string[];
    maturity?: ToolMaturity;
    lastValidated?: string;
    testCoverage?: number;
    mcpCompatible?: boolean;
  };
}

export interface ToolSuite {
  /** Suite category identifier */
  category: string;
  
  /** Suite version */
  version: string;
  
  /** Get all tools in this suite */
  getTools(): StandardTool[];
  
  /** Optional suite-level metadata */
  metadata?: {
    description?: string;
    maintainer?: string;
  };
}

export interface ToolRegistryStats {
  totalTools: number;
  byCategory: Record<string, number>;
  byVersion: Record<string, number>;
  suites: string[];
  byMaturity: Record<string, number>;
}

/**
 * Unified Tool Registry
 * 
 * Central registry for all MCP tools with consistent interface
 * and automatic routing capabilities
 */
export class UnifiedToolRegistry {
  private tools: Map<string, StandardTool> = new Map();
  private suites: ToolSuite[] = [];
  private maturityIndex: Map<string, ToolMaturity> = new Map();
  
  /**
   * Register an entire tool suite
   */
  registerSuite(suite: ToolSuite): void {
    console.error(`📦 Registering tool suite: ${suite.category}-${suite.version}`);
    
    const tools = suite.getTools();
    let registeredCount = 0;
    
    for (const tool of tools) {
      try {
        this.registerTool(tool);
        registeredCount++;
      } catch (error) {
        console.error(`❌ Failed to register tool ${tool.name}:`, error);
      }
    }
    
    this.suites.push(suite);
    console.error(`✅ Registered ${registeredCount}/${tools.length} tools from ${suite.category}-${suite.version}`);
  }
  
  /**
   * Register a single tool
   */
  registerTool(tool: StandardTool): void {
    // Validate tool structure
    this.validateTool(tool);
    
    // Check for name conflicts
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool name conflict: ${tool.name} already registered`);
    }
    
    // Enrich metadata with maturity info if available
    const validated: ToolDefinitionMeta | undefined = VALIDATED_TOOLS[tool.fullName];
    const maturity = validated?.maturity ?? ToolMaturity.DEVELOPMENT;
    const enriched: StandardTool = {
      ...tool,
      metadata: {
        ...tool.metadata,
        maturity,
        lastValidated: validated?.lastValidated,
        testCoverage: validated?.testCoverage,
        mcpCompatible: validated?.mcpCompatible,
      }
    };

    // Register the tool
    this.tools.set(tool.name, enriched);
    this.maturityIndex.set(tool.fullName, maturity);
    console.error(`🔧 Registered tool: ${tool.name} (${tool.category}-${tool.version})`);
  }
  
  /**
   * Get all registered tools
   */
  getAllTools(): StandardTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by maturity (using fullName metadata)
   */
  getToolsByMaturity(maturities: ToolMaturity[]): StandardTool[] {
    return this.getAllTools().filter(tool => {
      const m = tool.metadata?.maturity ?? ToolMaturity.DEVELOPMENT;
      return maturities.includes(m);
    });
  }

  /**
   * Get only PRODUCTION or BETA tools (beta build set)
   */
  getBetaTools(): StandardTool[] {
    return this.getToolsByMaturity([ToolMaturity.PRODUCTION, ToolMaturity.BETA]);
  }
  
  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): StandardTool[] {
    return this.getAllTools().filter(tool => tool.category === category);
  }
  
  /**
   * Get tools by version
   */
  getToolsByVersion(version: string): StandardTool[] {
    return this.getAllTools().filter(tool => tool.version === version);
  }
  
  /**
   * Execute a tool by name (supports both internal name and fullName)
   */
  async executeTool(name: string, args: any): Promise<string> {
    // Try to find tool by fullName first (MCP uses fullName)
    let tool = Array.from(this.tools.values()).find(t => t.fullName === name);
    
    // Fallback to internal name lookup
    if (!tool) {
      tool = this.tools.get(name);
    }
    
    if (!tool) {
      const availableTools = Array.from(this.tools.values()).map(t => t.fullName).join(', ');
      throw new Error(`Tool not found: ${name}. Available tools: ${availableTools}`);
    }
    
    console.error(`⚡ Executing ${tool.category}-${tool.version} tool: ${name}`);
    
    try {
      const result = await tool.execute(args);
      
      // Validate result is string (MCP requirement)
      if (typeof result !== 'string') {
        throw new Error(`Tool ${name} returned non-string result. Tools must return JSON strings.`);
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Tool execution failed for ${name}:`, error);
      
      // Return standardized error response
      const errorResponse = {
        success: false,
        tool: name,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      
      return JSON.stringify(errorResponse, null, 2);
    }
  }
  
  /**
   * Check if a tool exists
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }
  
  /**
   * Get registry statistics
   */
  getStats(): ToolRegistryStats {
    const tools = this.getAllTools();
    
    const byCategory: Record<string, number> = {};
    const byVersion: Record<string, number> = {};
    const byMaturity: Record<string, number> = {};
    
    for (const tool of tools) {
      byCategory[tool.category] = (byCategory[tool.category] || 0) + 1;
      byVersion[tool.version] = (byVersion[tool.version] || 0) + 1;
      const m = tool.metadata?.maturity ?? ToolMaturity.DEVELOPMENT;
      byMaturity[m] = (byMaturity[m] || 0) + 1;
    }
    
    return {
      totalTools: tools.length,
      byCategory,
      byVersion,
      suites: this.suites.map(s => `${s.category}-${s.version}`),
      byMaturity
    };
  }
  
  /**
   * Get tools formatted for MCP registration
   */
  getMCPTools(): Array<{name: string, description: string, inputSchema: any}> {
    return this.getAllTools().map(tool => ({
      name: tool.fullName,
      description: tool.description,
      inputSchema: tool.inputSchema
    }));
  }

  /**
   * Get MCP-formatted tools, filtered by maturity
   */
  getMCPToolsByMaturity(maturities: ToolMaturity[]): Array<{name: string, description: string, inputSchema: any}> {
    return this.getToolsByMaturity(maturities).map(tool => ({
      name: tool.fullName,
      description: tool.description,
      inputSchema: tool.inputSchema
    }));
  }
  
  /**
   * Validate tool structure
   */
  private validateTool(tool: StandardTool): void {
    const required = ['name', 'fullName', 'description', 'inputSchema', 'execute', 'category', 'version'];
    
    for (const field of required) {
      if (!tool[field as keyof StandardTool]) {
        throw new Error(`Tool validation failed: missing required field '${field}'`);
      }
    }
    
    // Validate execute method
    if (typeof tool.execute !== 'function') {
      throw new Error(`Tool validation failed: execute must be a function`);
    }
    
    // Validate category
    const validCategories = ['diagnostic', 'read-ops', 'memory', 'knowledge', 'workflow'];
    if (!validCategories.includes(tool.category)) {
      throw new Error(`Tool validation failed: invalid category '${tool.category}'. Must be one of: ${validCategories.join(', ')}`);
    }
    
    // Validate version
    const validVersions = ['v1', 'v2'];
    if (!validVersions.includes(tool.version)) {
      throw new Error(`Tool validation failed: invalid version '${tool.version}'. Must be one of: ${validVersions.join(', ')}`);
    }
  }
}

/**
 * Global registry instance
 * Singleton pattern for application-wide tool registration
 */
let globalRegistry: UnifiedToolRegistry | null = null;

export function getGlobalToolRegistry(): UnifiedToolRegistry {
  if (!globalRegistry) {
    globalRegistry = new UnifiedToolRegistry();
  }
  return globalRegistry;
}

/**
 * Reset global registry (useful for testing)
 */
export function resetGlobalToolRegistry(): void {
  globalRegistry = null;
}

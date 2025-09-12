/**
 * Unified Tool Registry - Standardized MCP Tool Registration
 * 
 * Eliminates inconsistent registration patterns and provides unified
 * interface for all tool types (v1, v2, individual, collections)
 */

import { ToolMaturity, type ToolDefinitionMeta } from '../../types/tool-maturity.js';
import { VALIDATED_TOOLS } from '../../registry/validated-tools.js';
import { ValidationError, NotFoundError, ToolExecutionError, serializeError } from '../errors/index.js';
import { withTimeout } from '../../utils/async-timeout.js';
import { nowIso } from '../../utils/time.js';
import { preInstrument, postInstrument, postInstrumentError } from './instrumentation-middleware.js';
import { createSessionId } from '../../utils/session.js';
import { findUnresolvedPlaceholdersShallow } from './tool-args-validator.js';

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
    author?: string | undefined;
    deprecated?: boolean | undefined;
    experimental?: boolean | undefined;
    requiredPermissions?: string[] | undefined;
    maturity?: ToolMaturity | undefined;
    lastValidated?: string | undefined;
    testCoverage?: number | undefined;
    mcpCompatible?: boolean | undefined;
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
  private execCountBySession: Map<string, number> = new Map();
  
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
      throw new ValidationError(`Tool name conflict: ${tool.name} already registered`, { details: { name: tool.name } });
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
      const availableTools = Array.from(this.tools.values()).map(t => t.fullName);
      throw new NotFoundError(`Tool not found: ${name}`, { details: { requested: name, availableTools } });
    }
    
    console.error(`⚡ Executing ${tool.category}-${tool.version} tool: ${name}`);

    // Normalize args and ensure sessionId exists
    const raw = (args && typeof args === 'object') ? { ...(args as any) } : {} as any;
    if (typeof raw.sessionId !== 'string' || raw.sessionId.length === 0) {
      raw.sessionId = createSessionId();
    }
    const sessionId: string = raw.sessionId;

    // Global execution cap per session
    const cap = Number(process.env.TOOL_MAX_EXEC_PER_REQUEST || 10);
    const used = this.execCountBySession.get(sessionId) || 0;
    if (used >= cap) {
      const err = new ToolExecutionError(`Global tool execution cap exceeded`, { details: { sessionId, cap, used, reason: 'global_cap_exceeded' } });
      // Instrumentation error post-hook (non-fatal)
      try { await postInstrumentError(null as any, err); } catch {}
      const payload = { success: false, tool: name, error: serializeError(err), timestamp: nowIso() };
      return JSON.stringify(payload, null, 2);
    }
    this.execCountBySession.set(sessionId, used + 1);

    // Universal placeholder validation (shallow)
    const ph = findUnresolvedPlaceholdersShallow(raw);
    if (ph.length > 0) {
      const err = new ToolExecutionError(`Unresolved placeholders in input`, { details: { sessionId, placeholders: ph, reason: 'unresolved_placeholder' } });
      try { await postInstrumentError(null as any, err); } catch {}
      const payload = {
        success: false,
        tool: name,
        error: serializeError(err),
        guidance: 'Replace placeholders like <pod> or <name> with real values before running this tool.',
        timestamp: nowIso(),
      };
      return JSON.stringify(payload, null, 2);
    }

    // Instrumentation pre-hook (best effort, non-fatal)
    const preCtx = envEnable('ENABLE_INSTRUMENTATION', true) ? preInstrument(tool.fullName, tool.category, raw) : null;

    try {

      const timeoutMs = Number((raw?.timeoutMs ?? process.env.TOOL_TIMEOUT_MS) || 0) || 0;
      const result = await withTimeout(async () => tool.execute(raw), timeoutMs, `tool:${name}`);

      // Validate result is string (MCP requirement)
      if (typeof result !== 'string') {
        throw new ToolExecutionError(`Tool ${name} returned non-string result. Tools must return JSON strings.`);
      }

      // Instrumentation post-hook (non-blocking best effort)
      try { await postInstrument(preCtx, result); } catch {}

      return result;
      
    } catch (error) {
      console.error(`❌ Tool execution failed for ${name}:`, error);
      const err = error instanceof ToolExecutionError ? error : new ToolExecutionError(`Execution failed for ${name}`, { cause: error });
      // Instrumentation error post-hook (non-fatal)
      try { await postInstrumentError(preCtx, error); } catch {}
      const payload = {
        success: false,
        tool: name,
        error: serializeError(err),
        timestamp: nowIso(),
      };
      return JSON.stringify(payload, null, 2);
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
        throw new ValidationError(`Tool validation failed: missing required field '${field}'`, { details: { field } });
      }
    }
    
    // Validate execute method
    if (typeof tool.execute !== 'function') {
      throw new ValidationError(`Tool validation failed: execute must be a function`);
    }
    
    // Validate category
    const validCategories = ['diagnostic', 'read-ops', 'memory', 'knowledge', 'workflow'];
    if (!validCategories.includes(tool.category)) {
      throw new ValidationError(`Tool validation failed: invalid category '${tool.category}'. Must be one of: ${validCategories.join(', ')}`);
    }
    
    // Validate version
    const validVersions = ['v1', 'v2'];
    if (!validVersions.includes(tool.version)) {
      throw new ValidationError(`Tool validation failed: invalid version '${tool.version}'. Must be one of: ${validVersions.join(', ')}`);
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

function envEnable(name: string, defaultOn = true): boolean {
  const v = String(process.env[name] || '').toLowerCase();
  if (v === 'false' || v === '0' || v === 'off' || v === 'no') return false;
  if (v === 'true' || v === '1' || v === 'on' || v === 'yes') return true;
  return defaultOn;
}

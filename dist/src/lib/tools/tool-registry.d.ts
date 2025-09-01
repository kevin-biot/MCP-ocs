/**
 * Unified Tool Registry - Standardized MCP Tool Registration
 *
 * Eliminates inconsistent registration patterns and provides unified
 * interface for all tool types (v1, v2, individual, collections)
 */
import { ToolMaturity } from '../../types/tool-maturity.js';
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
export declare class UnifiedToolRegistry {
    private tools;
    private suites;
    private maturityIndex;
    /**
     * Register an entire tool suite
     */
    registerSuite(suite: ToolSuite): void;
    /**
     * Register a single tool
     */
    registerTool(tool: StandardTool): void;
    /**
     * Get all registered tools
     */
    getAllTools(): StandardTool[];
    /**
     * Get tools by maturity (using fullName metadata)
     */
    getToolsByMaturity(maturities: ToolMaturity[]): StandardTool[];
    /**
     * Get only PRODUCTION or BETA tools (beta build set)
     */
    getBetaTools(): StandardTool[];
    /**
     * Get tools by category
     */
    getToolsByCategory(category: string): StandardTool[];
    /**
     * Get tools by version
     */
    getToolsByVersion(version: string): StandardTool[];
    /**
     * Execute a tool by name (supports both internal name and fullName)
     */
    executeTool(name: string, args: any): Promise<string>;
    /**
     * Check if a tool exists
     */
    hasTool(name: string): boolean;
    /**
     * Get registry statistics
     */
    getStats(): ToolRegistryStats;
    /**
     * Get tools formatted for MCP registration
     */
    getMCPTools(): Array<{
        name: string;
        description: string;
        inputSchema: any;
    }>;
    /**
     * Get MCP-formatted tools, filtered by maturity
     */
    getMCPToolsByMaturity(maturities: ToolMaturity[]): Array<{
        name: string;
        description: string;
        inputSchema: any;
    }>;
    /**
     * Validate tool structure
     */
    private validateTool;
}
export declare function getGlobalToolRegistry(): UnifiedToolRegistry;
/**
 * Reset global registry (useful for testing)
 */
export declare function resetGlobalToolRegistry(): void;

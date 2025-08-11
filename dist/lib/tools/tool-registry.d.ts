/**
 * Tool Registry - Central registry for all MCP-ocs tools
 * Implements ADR-004: Tool namespace management
 */
import { ToolCapability } from '../types/common.js';
import { DiagnosticToolsV2 as DiagnosticTools } from '../../tools/diagnostics/index.js';
import { ReadOpsTools } from '../../tools/read-ops/index.js';
import { WriteOpsTools } from '../../tools/write-ops/index.js';
import { StateMgmtTools } from '../../tools/state-mgmt/index.js';
export interface RegisteredTool {
    name: string;
    namespace: string;
    domain: string;
    capability: ToolCapability;
    handler: Function;
    description: string;
    inputSchema: any;
}
export declare class ToolRegistry {
    private tools;
    private diagnosticTools;
    private readOpsTools;
    private writeOpsTools;
    private stateMgmtTools;
    constructor(diagnosticTools: DiagnosticTools, readOpsTools: ReadOpsTools, writeOpsTools: WriteOpsTools, stateMgmtTools: StateMgmtTools);
    private registerAllTools;
    private registerTool;
    getAvailableTools(): RegisteredTool[];
    getTool(name: string): RegisteredTool | undefined;
    getToolsByNamespace(namespace: string): RegisteredTool[];
    getToolsByDomain(domain: string): RegisteredTool[];
    /**
     * Register a new tool (public method for v2 tools)
     */
    registerExternalTool(toolDefinition: {
        name: string;
        description: string;
        inputSchema: any;
        handler: Function;
    }): void;
    executeTool(name: string, args: any): Promise<any>;
}

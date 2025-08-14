#!/usr/bin/env node
"use strict";
/**
 * MCP-ocs Beta Entry Point - Validated Tool Subset
 * Registers only production-ready (PRODUCTION/BETA) tools for stable deployments
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var index_js_2 = require("./tools/diagnostics/index.js");
var index_js_3 = require("./tools/read-ops/index.js");
var index_js_4 = require("./tools/state-mgmt/index.js");
var openshift_client_js_1 = require("./lib/openshift-client.js");
var shared_memory_js_1 = require("./lib/memory/shared-memory.js");
var workflow_engine_js_1 = require("./lib/workflow/workflow-engine.js");
var auto_memory_system_js_1 = require("./lib/memory/auto-memory-system.js");
var tool_registry_js_1 = require("./lib/tools/tool-registry.js");
var tool_maturity_js_1 = require("./types/tool-maturity.js");
console.error('🚀 Starting MCP-ocs server (beta)...');
// Initialize core components
var openshiftClient = new openshift_client_js_1.OpenShiftClient({ ocPath: 'oc', timeout: 30000 });
var sharedMemory = new shared_memory_js_1.SharedMemoryManager({
    domain: 'mcp-ocs',
    namespace: 'default',
    memoryDir: './memory',
    enableCompression: true,
    retentionDays: 30,
    chromaHost: '127.0.0.1',
    chromaPort: 8000
});
var workflowEngine = new workflow_engine_js_1.WorkflowEngine({
    enablePanicDetection: true,
    enforcementLevel: 'guidance',
    memoryManager: sharedMemory,
    minEvidenceThreshold: 2
});
var autoMemory = new auto_memory_system_js_1.AutoMemorySystem(sharedMemory);
// Registry and suites
var toolRegistry = new tool_registry_js_1.UnifiedToolRegistry();
var diagnosticTools = new index_js_2.DiagnosticToolsV2(openshiftClient, sharedMemory);
var readOpsTools = new index_js_3.ReadOpsTools(openshiftClient, sharedMemory);
var stateMgmtTools = new index_js_4.StateMgmtTools(sharedMemory, workflowEngine);
toolRegistry.registerSuite(diagnosticTools);
toolRegistry.registerSuite(readOpsTools);
toolRegistry.registerSuite(stateMgmtTools);
// Filter to production-ready tools
var betaToolsMCP = toolRegistry.getMCPToolsByMaturity([tool_maturity_js_1.ToolMaturity.PRODUCTION, tool_maturity_js_1.ToolMaturity.BETA]);
console.error("\u2705 Beta toolset size: ".concat(betaToolsMCP.length));
// Create MCP server
var server = new index_js_1.Server({ name: 'mcp-ocs-beta', version: '0.8.0-beta' }, { capabilities: { tools: {} } });
// List only beta tools
server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.error('📋 Listing beta toolset...');
        return [2 /*return*/, { tools: betaToolsMCP }];
    });
}); });
// Execute tools (routing remains unified)
server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, args, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = request.params, name = _a.name, args = _a.arguments;
                console.error("\uD83D\uDD27 [beta] Executing tool: ".concat(name));
                return [4 /*yield*/, toolRegistry.executeTool(name, args || {})];
            case 1:
                result = _b.sent();
                return [2 /*return*/, { content: [{ type: 'text', text: result }] }];
        }
    });
}); });
// Connect
var transport = new stdio_js_1.StdioServerTransport();
await server.connect(transport);
console.error('✅ MCP-ocs beta server connected and ready!');

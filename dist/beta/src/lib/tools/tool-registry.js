"use strict";
/**
 * Unified Tool Registry - Standardized MCP Tool Registration
 *
 * Eliminates inconsistent registration patterns and provides unified
 * interface for all tool types (v1, v2, individual, collections)
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.UnifiedToolRegistry = void 0;
exports.getGlobalToolRegistry = getGlobalToolRegistry;
exports.resetGlobalToolRegistry = resetGlobalToolRegistry;
var tool_maturity_js_1 = require("../../types/tool-maturity.js");
var validated_tools_js_1 = require("../../registry/validated-tools.js");
/**
 * Unified Tool Registry
 *
 * Central registry for all MCP tools with consistent interface
 * and automatic routing capabilities
 */
var UnifiedToolRegistry = /** @class */ (function () {
    function UnifiedToolRegistry() {
        this.tools = new Map();
        this.suites = [];
        this.maturityIndex = new Map();
    }
    /**
     * Register an entire tool suite
     */
    UnifiedToolRegistry.prototype.registerSuite = function (suite) {
        console.error("\uD83D\uDCE6 Registering tool suite: ".concat(suite.category, "-").concat(suite.version));
        var tools = suite.getTools();
        var registeredCount = 0;
        for (var _i = 0, tools_1 = tools; _i < tools_1.length; _i++) {
            var tool = tools_1[_i];
            try {
                this.registerTool(tool);
                registeredCount++;
            }
            catch (error) {
                console.error("\u274C Failed to register tool ".concat(tool.name, ":"), error);
            }
        }
        this.suites.push(suite);
        console.error("\u2705 Registered ".concat(registeredCount, "/").concat(tools.length, " tools from ").concat(suite.category, "-").concat(suite.version));
    };
    /**
     * Register a single tool
     */
    UnifiedToolRegistry.prototype.registerTool = function (tool) {
        var _a;
        // Validate tool structure
        this.validateTool(tool);
        // Check for name conflicts
        if (this.tools.has(tool.name)) {
            throw new Error("Tool name conflict: ".concat(tool.name, " already registered"));
        }
        // Enrich metadata with maturity info if available
        var validated = validated_tools_js_1.VALIDATED_TOOLS[tool.fullName];
        var maturity = (_a = validated === null || validated === void 0 ? void 0 : validated.maturity) !== null && _a !== void 0 ? _a : tool_maturity_js_1.ToolMaturity.DEVELOPMENT;
        var enriched = __assign(__assign({}, tool), { metadata: __assign(__assign({}, tool.metadata), { maturity: maturity, lastValidated: validated === null || validated === void 0 ? void 0 : validated.lastValidated, testCoverage: validated === null || validated === void 0 ? void 0 : validated.testCoverage, mcpCompatible: validated === null || validated === void 0 ? void 0 : validated.mcpCompatible }) });
        // Register the tool
        this.tools.set(tool.name, enriched);
        this.maturityIndex.set(tool.fullName, maturity);
        console.error("\uD83D\uDD27 Registered tool: ".concat(tool.name, " (").concat(tool.category, "-").concat(tool.version, ")"));
    };
    /**
     * Get all registered tools
     */
    UnifiedToolRegistry.prototype.getAllTools = function () {
        return Array.from(this.tools.values());
    };
    /**
     * Get tools by maturity (using fullName metadata)
     */
    UnifiedToolRegistry.prototype.getToolsByMaturity = function (maturities) {
        return this.getAllTools().filter(function (tool) {
            var _a, _b;
            var m = (_b = (_a = tool.metadata) === null || _a === void 0 ? void 0 : _a.maturity) !== null && _b !== void 0 ? _b : tool_maturity_js_1.ToolMaturity.DEVELOPMENT;
            return maturities.includes(m);
        });
    };
    /**
     * Get only PRODUCTION or BETA tools (beta build set)
     */
    UnifiedToolRegistry.prototype.getBetaTools = function () {
        return this.getToolsByMaturity([tool_maturity_js_1.ToolMaturity.PRODUCTION, tool_maturity_js_1.ToolMaturity.BETA]);
    };
    /**
     * Get tools by category
     */
    UnifiedToolRegistry.prototype.getToolsByCategory = function (category) {
        return this.getAllTools().filter(function (tool) { return tool.category === category; });
    };
    /**
     * Get tools by version
     */
    UnifiedToolRegistry.prototype.getToolsByVersion = function (version) {
        return this.getAllTools().filter(function (tool) { return tool.version === version; });
    };
    /**
     * Execute a tool by name (supports both internal name and fullName)
     */
    UnifiedToolRegistry.prototype.executeTool = function (name, args) {
        return __awaiter(this, void 0, void 0, function () {
            var tool, availableTools, result, error_1, errorResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tool = Array.from(this.tools.values()).find(function (t) { return t.fullName === name; });
                        // Fallback to internal name lookup
                        if (!tool) {
                            tool = this.tools.get(name);
                        }
                        if (!tool) {
                            availableTools = Array.from(this.tools.values()).map(function (t) { return t.fullName; }).join(', ');
                            throw new Error("Tool not found: ".concat(name, ". Available tools: ").concat(availableTools));
                        }
                        console.error("\u26A1 Executing ".concat(tool.category, "-").concat(tool.version, " tool: ").concat(name));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, tool.execute(args)];
                    case 2:
                        result = _a.sent();
                        // Validate result is string (MCP requirement)
                        if (typeof result !== 'string') {
                            throw new Error("Tool ".concat(name, " returned non-string result. Tools must return JSON strings."));
                        }
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _a.sent();
                        console.error("\u274C Tool execution failed for ".concat(name, ":"), error_1);
                        errorResponse = {
                            success: false,
                            tool: name,
                            error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                            timestamp: new Date().toISOString()
                        };
                        return [2 /*return*/, JSON.stringify(errorResponse, null, 2)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if a tool exists
     */
    UnifiedToolRegistry.prototype.hasTool = function (name) {
        return this.tools.has(name);
    };
    /**
     * Get registry statistics
     */
    UnifiedToolRegistry.prototype.getStats = function () {
        var _a, _b;
        var tools = this.getAllTools();
        var byCategory = {};
        var byVersion = {};
        var byMaturity = {};
        for (var _i = 0, tools_2 = tools; _i < tools_2.length; _i++) {
            var tool = tools_2[_i];
            byCategory[tool.category] = (byCategory[tool.category] || 0) + 1;
            byVersion[tool.version] = (byVersion[tool.version] || 0) + 1;
            var m = (_b = (_a = tool.metadata) === null || _a === void 0 ? void 0 : _a.maturity) !== null && _b !== void 0 ? _b : tool_maturity_js_1.ToolMaturity.DEVELOPMENT;
            byMaturity[m] = (byMaturity[m] || 0) + 1;
        }
        return {
            totalTools: tools.length,
            byCategory: byCategory,
            byVersion: byVersion,
            suites: this.suites.map(function (s) { return "".concat(s.category, "-").concat(s.version); }),
            byMaturity: byMaturity
        };
    };
    /**
     * Get tools formatted for MCP registration
     */
    UnifiedToolRegistry.prototype.getMCPTools = function () {
        return this.getAllTools().map(function (tool) { return ({
            name: tool.fullName,
            description: tool.description,
            inputSchema: tool.inputSchema
        }); });
    };
    /**
     * Get MCP-formatted tools, filtered by maturity
     */
    UnifiedToolRegistry.prototype.getMCPToolsByMaturity = function (maturities) {
        return this.getToolsByMaturity(maturities).map(function (tool) { return ({
            name: tool.fullName,
            description: tool.description,
            inputSchema: tool.inputSchema
        }); });
    };
    /**
     * Validate tool structure
     */
    UnifiedToolRegistry.prototype.validateTool = function (tool) {
        var required = ['name', 'fullName', 'description', 'inputSchema', 'execute', 'category', 'version'];
        for (var _i = 0, required_1 = required; _i < required_1.length; _i++) {
            var field = required_1[_i];
            if (!tool[field]) {
                throw new Error("Tool validation failed: missing required field '".concat(field, "'"));
            }
        }
        // Validate execute method
        if (typeof tool.execute !== 'function') {
            throw new Error("Tool validation failed: execute must be a function");
        }
        // Validate category
        var validCategories = ['diagnostic', 'read-ops', 'memory', 'knowledge', 'workflow'];
        if (!validCategories.includes(tool.category)) {
            throw new Error("Tool validation failed: invalid category '".concat(tool.category, "'. Must be one of: ").concat(validCategories.join(', ')));
        }
        // Validate version
        var validVersions = ['v1', 'v2'];
        if (!validVersions.includes(tool.version)) {
            throw new Error("Tool validation failed: invalid version '".concat(tool.version, "'. Must be one of: ").concat(validVersions.join(', ')));
        }
    };
    return UnifiedToolRegistry;
}());
exports.UnifiedToolRegistry = UnifiedToolRegistry;
/**
 * Global registry instance
 * Singleton pattern for application-wide tool registration
 */
var globalRegistry = null;
function getGlobalToolRegistry() {
    if (!globalRegistry) {
        globalRegistry = new UnifiedToolRegistry();
    }
    return globalRegistry;
}
/**
 * Reset global registry (useful for testing)
 */
function resetGlobalToolRegistry() {
    globalRegistry = null;
}

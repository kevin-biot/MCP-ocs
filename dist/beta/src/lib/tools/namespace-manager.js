"use strict";
/**
 * Tool Namespace Manager - ADR-004 Implementation
 *
 * Hierarchical tool namespace architecture with context-aware filtering
 * Prevents tool confusion and provides structured tool organization
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
exports.ToolNamespaceManager = exports.ToolRegistry = void 0;
/**
 * Tool namespace definitions following ADR-004 conventions
 */
var TOOL_NAMESPACES = {
    // Core system operations
    'mcp-core': {
        prefix: 'core_',
        domain: 'system',
        tools: ['health_check', 'status', 'config', 'memory_stats']
    },
    // OpenShift cluster operations
    'mcp-openshift': {
        prefix: 'oc_',
        domain: 'cluster',
        tools: ['get_pods', 'describe_pod', 'get_logs', 'get_events', 'apply_config', 'scale_deployment']
    },
    // File system operations
    'mcp-files': {
        prefix: 'file_',
        domain: 'filesystem',
        tools: ['read_file', 'write_file', 'list_directory', 'search_files']
    },
    // Memory operations
    'mcp-memory': {
        prefix: 'memory_',
        domain: 'knowledge',
        tools: ['store_conversation', 'search_memory', 'get_session_context', 'search_operational']
    },
    // Atlassian integration (disabled in first pass per ADR-004)
    'mcp-atlassian': {
        prefix: 'atlassian_',
        domain: 'collaboration',
        tools: ['get_issue', 'create_page', 'search_confluence'],
        disabled: true // First pass version
    },
    // Monitoring and metrics
    'mcp-prometheus': {
        prefix: 'prom_',
        domain: 'monitoring',
        tools: ['query_metrics', 'get_alerts', 'check_health'],
        disabled: true // First pass version
    }
};
/**
 * Context-aware tool filtering rules
 */
var CONTEXT_FILTERING_RULES = {
    file_memory: {
        enabledDomains: ['filesystem', 'knowledge', 'system'],
        disabledDomains: ['collaboration'], // Prevent Atlassian confusion
        priorityBoost: ['file_', 'memory_', 'core_'],
        reasoning: 'Focus on file operations and memory, exclude collaboration tools to prevent confusion'
    },
    atlassian_ops: {
        enabledDomains: ['collaboration', 'knowledge', 'system'],
        deprioritizedDomains: ['filesystem'], // Minimize file tools
        priorityBoost: ['atlassian_', 'memory_', 'core_'],
        reasoning: 'Focus on collaboration tools, minimize file operations'
    },
    cluster_ops: {
        enabledDomains: ['cluster', 'monitoring', 'knowledge', 'system'],
        deprioritizedDomains: ['collaboration', 'filesystem'],
        priorityBoost: ['oc_', 'prom_', 'memory_', 'core_'],
        reasoning: 'Focus on cluster operations and monitoring'
    },
    general: {
        enabledDomains: ['cluster', 'filesystem', 'knowledge', 'system'],
        disabledDomains: [], // No hard restrictions
        priorityBoost: ['core_'],
        reasoning: 'Balanced access to core domains'
    }
};
/**
 * Three-stream configuration integration
 */
var STREAM_CONFIGURATIONS = {
    single: {
        enabledNamespaces: ['mcp-core', 'mcp-files', 'mcp-memory', 'mcp-openshift'],
        disabledNamespaces: ['mcp-atlassian', 'mcp-prometheus'],
        defaultContext: 'general',
        reasoning: 'Single user mode with core functionality, exclude collaboration'
    },
    team: {
        enabledNamespaces: ['mcp-core', 'mcp-files', 'mcp-memory', 'mcp-openshift', 'mcp-atlassian'],
        disabledNamespaces: ['mcp-prometheus'], // Enable later
        defaultContext: 'general',
        reasoning: 'Team mode with collaboration tools enabled'
    },
    router: {
        enabledNamespaces: Object.keys(TOOL_NAMESPACES),
        disabledNamespaces: [],
        defaultContext: 'general',
        reasoning: 'Router mode with all tools available for orchestration'
    }
};
/**
 * Tool Registry for namespace-aware tool management
 */
var ToolRegistry = /** @class */ (function () {
    function ToolRegistry(namespaceManager) {
        this.tools = new Map();
        this.namespaceTools = new Map();
        this.namespaceManager = namespaceManager;
    }
    ToolRegistry.prototype.registerToolGroup = function (groupName, tools) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, tools_1, tool;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, tools_1 = tools;
                        _a.label = 1;
                    case 1:
                        if (!(_i < tools_1.length)) return [3 /*break*/, 4];
                        tool = tools_1[_i];
                        return [4 /*yield*/, this.registerTool(tool)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        console.error("\uD83D\uDCCB Registered tool group '".concat(groupName, "' with ").concat(tools.length, " tools"));
                        return [2 /*return*/];
                }
            });
        });
    };
    ToolRegistry.prototype.registerTool = function (tool) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
                this.namespaceTools.get(tool.namespace).add(tool.fullName);
                return [2 /*return*/];
            });
        });
    };
    ToolRegistry.prototype.getAvailableTools = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var availableTools, enabledNamespaces, _i, enabledNamespaces_1, namespace, toolNames, _a, toolNames_1, toolName, tool;
            var _this = this;
            return __generator(this, function (_b) {
                availableTools = [];
                enabledNamespaces = this.namespaceManager.getEnabledNamespaces(context);
                // Filter tools by enabled namespaces
                for (_i = 0, enabledNamespaces_1 = enabledNamespaces; _i < enabledNamespaces_1.length; _i++) {
                    namespace = enabledNamespaces_1[_i];
                    toolNames = this.namespaceTools.get(namespace);
                    if (toolNames) {
                        for (_a = 0, toolNames_1 = toolNames; _a < toolNames_1.length; _a++) {
                            toolName = toolNames_1[_a];
                            tool = this.tools.get(toolName);
                            if (tool && this.namespaceManager.isToolAvailable(tool, context)) {
                                availableTools.push(tool);
                            }
                        }
                    }
                }
                // Sort by context relevance and priority
                return [2 /*return*/, availableTools.sort(function (a, b) {
                        var relevanceA = _this.calculateToolRelevance(a, context);
                        var relevanceB = _this.calculateToolRelevance(b, context);
                        if (relevanceA !== relevanceB) {
                            return relevanceB - relevanceA; // Higher relevance first
                        }
                        return b.priority - a.priority; // Higher priority first
                    })];
            });
        });
    };
    ToolRegistry.prototype.executeTool = function (toolName, args) {
        return __awaiter(this, void 0, void 0, function () {
            var tool;
            return __generator(this, function (_a) {
                tool = this.tools.get(toolName);
                if (!tool) {
                    throw new Error("Tool not found: ".concat(toolName));
                }
                // Tool execution will be delegated to specific tool implementations
                // This is a placeholder for the actual execution logic
                console.error("\uD83D\uDD27 Executing tool: ".concat(toolName));
                return [2 /*return*/, {
                        tool: toolName,
                        result: 'Tool execution placeholder - implement in tool groups',
                        timestamp: new Date().toISOString()
                    }];
            });
        });
    };
    ToolRegistry.prototype.getToolCount = function () {
        return this.tools.size;
    };
    ToolRegistry.prototype.getGroupCount = function () {
        return this.namespaceTools.size;
    };
    ToolRegistry.prototype.validateNamespaceConsistency = function (tool) {
        var _a;
        var expectedPrefix = (_a = TOOL_NAMESPACES[tool.namespace]) === null || _a === void 0 ? void 0 : _a.prefix;
        if (expectedPrefix && !tool.fullName.startsWith(expectedPrefix)) {
            throw new Error("Tool ".concat(tool.fullName, " does not follow namespace prefix ").concat(expectedPrefix));
        }
    };
    ToolRegistry.prototype.checkToolConflicts = function (tool) {
        if (tool.conflictsWith) {
            for (var _i = 0, _a = tool.conflictsWith; _i < _a.length; _i++) {
                var conflictingTool = _a[_i];
                if (this.tools.has(conflictingTool)) {
                    console.warn("\u26A0\uFE0F Tool conflict detected: ".concat(tool.fullName, " conflicts with ").concat(conflictingTool));
                }
            }
        }
    };
    ToolRegistry.prototype.calculateToolRelevance = function (tool, context) {
        var relevance = tool.priority;
        // Boost relevance for tools in primary domain
        if (tool.domain === context.primaryDomain) {
            relevance += 50;
        }
        // Boost relevance for tools in active domains
        if (context.activeDomains.includes(tool.domain)) {
            relevance += 25;
        }
        // Apply context-specific boosts
        var contextRules = CONTEXT_FILTERING_RULES[context.contextType];
        if (contextRules === null || contextRules === void 0 ? void 0 : contextRules.priorityBoost) {
            for (var _i = 0, _a = contextRules.priorityBoost; _i < _a.length; _i++) {
                var prefix = _a[_i];
                if (tool.fullName.startsWith(prefix)) {
                    relevance += 30;
                    break;
                }
            }
        }
        // Reduce relevance for workflow-inappropriate tools
        if (context.workflowPhase === 'diagnostic' && tool.capabilities.some(function (c) { return c.type === 'write'; })) {
            relevance -= 20; // Reduce write operations during diagnostics
        }
        return relevance;
    };
    return ToolRegistry;
}());
exports.ToolRegistry = ToolRegistry;
/**
 * Main Tool Namespace Manager
 */
var ToolNamespaceManager = /** @class */ (function () {
    function ToolNamespaceManager(config) {
        this.enabledNamespaces = new Set();
        this.toolFilters = new Map();
        this.config = config;
        this.currentContext = {
            mode: config.mode,
            primaryDomain: 'system',
            activeDomains: config.enabledDomains,
            workflowPhase: 'diagnostic',
            environment: 'dev',
            contextType: config.currentContext || 'general'
        };
        this.initializeStreamConfiguration();
    }
    /**
     * Set operational context and update tool availability
     */
    ToolNamespaceManager.prototype.setOperationalContext = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.error("\uD83C\uDFAF Setting operational context: ".concat(context.contextType, " (").concat(context.mode, " mode)"));
                        this.currentContext = context;
                        // Clear previous context
                        this.enabledNamespaces.clear();
                        this.toolFilters.clear();
                        // Always enable core tools
                        this.enabledNamespaces.add('mcp-core');
                        _a = context.mode;
                        switch (_a) {
                            case 'single': return [3 /*break*/, 1];
                            case 'team': return [3 /*break*/, 3];
                            case 'router': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, this.configureSingleUserMode(context)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 3: return [4 /*yield*/, this.configureTeamMode(context)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.configureRouterMode(context)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        // Apply context-specific filtering
                        this.applyContextFiltering(context);
                        console.error("\u2705 Context set: ".concat(this.enabledNamespaces.size, " namespaces enabled"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get currently enabled namespaces
     */
    ToolNamespaceManager.prototype.getEnabledNamespaces = function (context) {
        var ctx = context || this.currentContext;
        // Apply stream configuration restrictions
        var streamConfig = STREAM_CONFIGURATIONS[ctx.mode];
        var enabledByStream = new Set(streamConfig.enabledNamespaces);
        // Intersect with context-enabled namespaces
        var result = Array.from(this.enabledNamespaces).filter(function (ns) { return enabledByStream.has(ns); });
        return result;
    };
    /**
     * Check if a specific tool is available in current context
     */
    ToolNamespaceManager.prototype.isToolAvailable = function (tool, context) {
        // Check if namespace is enabled
        if (!this.enabledNamespaces.has(tool.namespace)) {
            return false;
        }
        // Check tool-specific filters
        var filter = this.toolFilters.get(tool.fullName);
        if (filter && !filter.enabled) {
            return false;
        }
        // Check context requirements
        for (var _i = 0, _a = tool.contextRequirements; _i < _a.length; _i++) {
            var requirement = _a[_i];
            if (!this.checkContextRequirement(requirement, context)) {
                return false;
            }
        }
        // Check domain restrictions
        var contextRules = CONTEXT_FILTERING_RULES[context.contextType];
        if (contextRules && 'disabledDomains' in contextRules) {
            var disabledDomains = contextRules.disabledDomains;
            if (disabledDomains === null || disabledDomains === void 0 ? void 0 : disabledDomains.includes(tool.domain)) {
                return false;
            }
        }
        return true;
    };
    ToolNamespaceManager.prototype.getCurrentMode = function () {
        return this.currentContext.mode;
    };
    ToolNamespaceManager.prototype.getCurrentContext = function () {
        return __assign({}, this.currentContext);
    };
    /**
     * Private configuration methods
     */
    ToolNamespaceManager.prototype.initializeStreamConfiguration = function () {
        var _this = this;
        var streamConfig = STREAM_CONFIGURATIONS[this.config.mode];
        // Enable namespaces based on stream configuration
        streamConfig.enabledNamespaces.forEach(function (ns) {
            // All tool namespaces are enabled by default
            _this.enabledNamespaces.add(ns);
        });
        console.error("\uD83D\uDD27 Initialized ".concat(this.config.mode, " stream with ").concat(this.enabledNamespaces.size, " namespaces"));
    };
    ToolNamespaceManager.prototype.configureSingleUserMode = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Single user: Enable core functionality only
                this.enabledNamespaces.add('mcp-files');
                this.enabledNamespaces.add('mcp-memory');
                // Conditionally enable domain-specific tools
                if (context.activeDomains.includes('cluster')) {
                    this.enabledNamespaces.add('mcp-openshift');
                }
                // Disable collaboration tools by default in single mode
                this.addToolFilter('atlassian_*', {
                    enabled: false,
                    reason: 'Not available in single user mode'
                });
                console.error('🔧 Configured single user mode');
                return [2 /*return*/];
            });
        });
    };
    ToolNamespaceManager.prototype.configureTeamMode = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                // Team mode: Enable collaboration tools
                this.enabledNamespaces.add('mcp-files');
                this.enabledNamespaces.add('mcp-memory');
                // Enable collaboration tools in team mode
                if (!((_a = TOOL_NAMESPACES['mcp-atlassian']) === null || _a === void 0 ? void 0 : _a.disabled)) {
                    this.enabledNamespaces.add('mcp-atlassian');
                }
                if (context.activeDomains.includes('cluster')) {
                    this.enabledNamespaces.add('mcp-openshift');
                }
                if (context.activeDomains.includes('monitoring')) {
                    this.enabledNamespaces.add('mcp-prometheus');
                }
                console.error('🔧 Configured team mode');
                return [2 /*return*/];
            });
        });
    };
    ToolNamespaceManager.prototype.configureRouterMode = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // Router mode: Enable all available tools for orchestration
                Object.keys(TOOL_NAMESPACES).forEach(function (namespace) {
                    // All tool namespaces are enabled in router mode
                    _this.enabledNamespaces.add(namespace);
                });
                console.error('🔧 Configured router mode with full tool access');
                return [2 /*return*/];
            });
        });
    };
    ToolNamespaceManager.prototype.applyContextFiltering = function (context) {
        var _this = this;
        var contextRules = CONTEXT_FILTERING_RULES[context.contextType];
        if (!contextRules)
            return;
        // Disable domains marked as disabled
        if (contextRules && 'disabledDomains' in contextRules) {
            contextRules.disabledDomains.forEach(function (domain) {
                var namespacesToDisable = Object.entries(TOOL_NAMESPACES)
                    .filter(function (_a) {
                    var _ = _a[0], config = _a[1];
                    return config.domain === domain;
                })
                    .map(function (_a) {
                    var namespace = _a[0];
                    return namespace;
                });
                namespacesToDisable.forEach(function (ns) {
                    _this.enabledNamespaces.delete(ns);
                });
            });
        }
        console.error("\uD83C\uDFAF Applied ".concat(context.contextType, " context filtering"));
    };
    ToolNamespaceManager.prototype.addToolFilter = function (pattern, filter) {
        this.toolFilters.set(pattern, filter);
    };
    ToolNamespaceManager.prototype.checkContextRequirement = function (requirement, context) {
        switch (requirement.type) {
            case 'environment':
                return context.environment === requirement.value;
            case 'workflow_state':
                return context.workflowPhase === requirement.value;
            case 'domain_focus':
                return context.activeDomains.includes(requirement.value);
            default:
                return !requirement.required; // Unknown requirements are optional
        }
    };
    return ToolNamespaceManager;
}());
exports.ToolNamespaceManager = ToolNamespaceManager;

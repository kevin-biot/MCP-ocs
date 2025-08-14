"use strict";
/**
 * Read Operations Tools - Safe data retrieval operations
 *
 * Following ADR-004 namespace conventions: oc_read_*
 * Read-only operations for information gathering
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
exports.ReadOpsTools = void 0;
var tool_memory_gateway_1 = require("../../lib/tools/tool-memory-gateway");
var ReadOpsTools = /** @class */ (function () {
    function ReadOpsTools(openshiftClient, memoryManager) {
        this.openshiftClient = openshiftClient;
        this.memoryManager = memoryManager;
        this.category = 'read-ops';
        this.version = 'v2';
        this.memoryGateway = new tool_memory_gateway_1.ToolMemoryGateway('./memory');
    }
    ReadOpsTools.prototype.getTools = function () {
        var _this = this;
        var toolDefinitions = this.getToolDefinitions();
        return toolDefinitions.map(function (tool) { return _this.convertToStandardTool(tool); });
    };
    ReadOpsTools.prototype.getToolDefinitions = function () {
        return [
            {
                name: 'get_pods',
                namespace: 'mcp-openshift',
                fullName: 'oc_read_get_pods',
                domain: 'cluster',
                capabilities: [
                    { type: 'read', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'List pods in a namespace with optional filtering',
                inputSchema: {
                    type: 'object',
                    properties: {
                        namespace: {
                            type: 'string',
                            description: 'Target namespace (optional)'
                        },
                        selector: {
                            type: 'string',
                            description: 'Label selector (optional)'
                        },
                        sessionId: {
                            type: 'string',
                            description: 'Session ID for workflow tracking'
                        }
                    }
                },
                priority: 95
            },
            {
                name: 'describe_resource',
                namespace: 'mcp-openshift',
                fullName: 'oc_read_describe',
                domain: 'cluster',
                capabilities: [
                    { type: 'read', level: 'advanced', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Get detailed information about a specific resource',
                inputSchema: {
                    type: 'object',
                    properties: {
                        resourceType: {
                            type: 'string',
                            description: 'Type of resource (pod, deployment, service, etc.)'
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the resource'
                        },
                        namespace: {
                            type: 'string',
                            description: 'Target namespace (optional)'
                        },
                        sessionId: {
                            type: 'string',
                            description: 'Session ID for workflow tracking'
                        }
                    },
                    required: ['resourceType', 'name']
                },
                priority: 90
            },
            {
                name: 'get_logs',
                namespace: 'mcp-openshift',
                fullName: 'oc_read_logs',
                domain: 'cluster',
                capabilities: [
                    { type: 'read', level: 'advanced', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Retrieve logs from a pod or container',
                inputSchema: {
                    type: 'object',
                    properties: {
                        podName: {
                            type: 'string',
                            description: 'Name of the pod'
                        },
                        namespace: {
                            type: 'string',
                            description: 'Target namespace (optional)'
                        },
                        container: {
                            type: 'string',
                            description: 'Specific container name (optional)'
                        },
                        lines: {
                            type: 'number',
                            description: 'Number of lines to retrieve (default: 100)',
                            default: 100
                        },
                        since: {
                            type: 'string',
                            description: 'Time range (e.g., "1h", "30m")'
                        },
                        sessionId: {
                            type: 'string',
                            description: 'Session ID for workflow tracking'
                        }
                    },
                    required: ['podName']
                },
                priority: 85
            },
            {
                name: 'search_memory',
                namespace: 'mcp-memory',
                fullName: 'memory_search_incidents',
                domain: 'knowledge',
                capabilities: [
                    { type: 'memory', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Search operational memory for similar incidents and patterns',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query for finding similar incidents'
                        },
                        domainFilter: {
                            type: 'string',
                            description: 'Optional domain filter',
                            enum: ['openshift', 'kubernetes', 'devops', 'production']
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of results (default: 5)',
                            default: 5
                        },
                        sessionId: {
                            type: 'string',
                            description: 'Session ID for workflow tracking'
                        }
                    },
                    required: ['query']
                },
                priority: 80
            }
        ];
    };
    ReadOpsTools.prototype.convertToStandardTool = function (toolDef) {
        var _this = this;
        return {
            name: toolDef.name,
            fullName: toolDef.fullName,
            description: toolDef.description,
            inputSchema: toolDef.inputSchema,
            category: 'read-ops',
            version: 'v2',
            execute: function (args) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, this.executeTool(toolDef.fullName, args)];
            }); }); }
        };
    };
    ReadOpsTools.prototype.executeTool = function (toolName, args) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, result, _a, jsonResult, error_1, errorResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sessionId = args.sessionId || "read-".concat(Date.now());
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 12, , 13]);
                        result = void 0;
                        _a = toolName;
                        switch (_a) {
                            case 'oc_read_get_pods': return [3 /*break*/, 2];
                            case 'oc_read_describe': return [3 /*break*/, 4];
                            case 'oc_read_logs': return [3 /*break*/, 6];
                            case 'memory_search_incidents': return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 10];
                    case 2: return [4 /*yield*/, this.getPods(args.namespace, args.selector, sessionId)];
                    case 3:
                        result = _b.sent();
                        return [3 /*break*/, 11];
                    case 4: return [4 /*yield*/, this.describeResource(args.resourceType, args.name, args.namespace, sessionId)];
                    case 5:
                        result = _b.sent();
                        return [3 /*break*/, 11];
                    case 6: return [4 /*yield*/, this.getLogs(args.podName, args.namespace, args.container, args.lines, args.since, sessionId)];
                    case 7:
                        result = _b.sent();
                        return [3 /*break*/, 11];
                    case 8: return [4 /*yield*/, this.searchMemory(args.query, args.limit, sessionId, args.domainFilter)];
                    case 9:
                        result = _b.sent();
                        return [3 /*break*/, 11];
                    case 10: throw new Error("Unknown read operation tool: ".concat(toolName));
                    case 11:
                        // Enhanced error handling: check for method existence before calling
                        if (toolName === 'oc_read_describe' && typeof this.openshiftClient.describeResource !== 'function') {
                            throw new Error('describeResource method not implemented in OpenShiftClient');
                        }
                        jsonResult = this.safeJsonStringify(result);
                        return [2 /*return*/, jsonResult];
                    case 12:
                        error_1 = _b.sent();
                        console.error("\u274C Read operation ".concat(toolName, " failed:"), error_1);
                        errorResult = {
                            success: false,
                            tool: toolName,
                            error: this.sanitizeError(error_1),
                            timestamp: new Date().toISOString(),
                            args: this.sanitizeArgs(args)
                        };
                        return [2 /*return*/, this.safeJsonStringify(errorResult)];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    ReadOpsTools.prototype.getPods = function (namespace, selector, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var pods, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.error("\uD83D\uDCCB Getting pods - namespace: ".concat(namespace, ", selector: ").concat(selector));
                        return [4 /*yield*/, this.openshiftClient.getPods(namespace, selector)];
                    case 1:
                        pods = _a.sent();
                        result = {
                            namespace: namespace || 'default',
                            selector: selector || 'none',
                            totalPods: pods.length,
                            pods: pods,
                            summary: {
                                running: pods.filter(function (p) { return p.status === 'Running'; }).length,
                                pending: pods.filter(function (p) { return p.status === 'Pending'; }).length,
                                failed: pods.filter(function (p) { return p.status === 'Failed'; }).length,
                                unknown: pods.filter(function (p) { return !['Running', 'Pending', 'Failed'].includes(p.status); }).length
                            },
                            timestamp: new Date().toISOString()
                        };
                        // Store via adapter-backed gateway for Chroma v2 integration
                        return [4 /*yield*/, this.memoryGateway.storeToolExecution('oc_read_get_pods', { namespace: namespace || 'default', selector: selector || 'none' }, result, sessionId || 'unknown', ['read_operation', 'pods', 'cluster_state'], 'openshift', 'prod', 'low')];
                    case 2:
                        // Store via adapter-backed gateway for Chroma v2 integration
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    ReadOpsTools.prototype.describeResource = function (resourceType, name, namespace, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var description, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.error("\uD83D\uDD0D Describing ".concat(resourceType, "/").concat(name, " in namespace: ").concat(namespace));
                        return [4 /*yield*/, this.openshiftClient.describeResource(resourceType, name, namespace)];
                    case 1:
                        description = _a.sent();
                        result = {
                            resourceType: resourceType,
                            name: name,
                            namespace: namespace || 'default',
                            description: description,
                            timestamp: new Date().toISOString()
                        };
                        // Store via adapter-backed gateway for Chroma v2 integration
                        return [4 /*yield*/, this.memoryGateway.storeToolExecution('oc_read_describe', { resourceType: resourceType, name: name, namespace: namespace || 'default' }, result, sessionId || 'unknown', ['read_operation', 'describe', resourceType], 'openshift', 'prod', 'low')];
                    case 2:
                        // Store via adapter-backed gateway for Chroma v2 integration
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    ReadOpsTools.prototype.getLogs = function (podName, namespace, container, lines, since, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var logs, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.error("\uD83D\uDCC4 Getting logs from pod: ".concat(podName, ", container: ").concat(container, ", lines: ").concat(lines));
                        return [4 /*yield*/, this.openshiftClient.getLogs(podName, namespace, {
                                container: container,
                                lines: lines || 100,
                                since: since
                            })];
                    case 1:
                        logs = _a.sent();
                        result = {
                            podName: podName,
                            namespace: namespace || 'default',
                            container: container || 'default',
                            lines: lines || 100,
                            since: since,
                            logs: logs,
                            logLines: logs.split('\\n').length,
                            timestamp: new Date().toISOString()
                        };
                        // Store via adapter-backed gateway for Chroma v2 integration
                        return [4 /*yield*/, this.memoryGateway.storeToolExecution('oc_read_logs', { podName: podName, namespace: namespace || 'default', container: container || 'default', lines: lines || 100, since: since }, result, sessionId || 'unknown', ['read_operation', 'logs', 'troubleshooting'], 'openshift', 'prod', 'low')];
                    case 2:
                        // Store via adapter-backed gateway for Chroma v2 integration
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    ReadOpsTools.prototype.searchMemory = function (query, limit, sessionId, domainFilter) {
        return __awaiter(this, void 0, void 0, function () {
            var results, searchResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.error("\uD83E\uDDE0 Searching operational memory for: ".concat(query));
                        return [4 /*yield*/, this.memoryGateway.searchToolIncidents(query, domainFilter, limit || 5)];
                    case 1:
                        results = _a.sent();
                        searchResult = {
                            query: query,
                            limit: limit || 5,
                            resultsFound: results.length,
                            results: results.map(function (r) {
                                var _a, _b;
                                return ({
                                    // Approximate similarity from distance if present
                                    similarity: typeof r.distance === 'number' ? (1 - r.distance) : 0.5,
                                    relevance: typeof r.distance === 'number' ? (1 - r.distance) * 100 : 50,
                                    incidentId: ((_a = r.metadata) === null || _a === void 0 ? void 0 : _a.incidentId) || '',
                                    symptoms: [],
                                    resolution: '',
                                    timestamp: ((_b = r.metadata) === null || _b === void 0 ? void 0 : _b.timestamp) || Date.now()
                                });
                            }),
                            timestamp: new Date().toISOString()
                        };
                        // Store search in memory for analytics
                        return [4 /*yield*/, this.memoryManager.storeConversation({
                                sessionId: sessionId || 'unknown',
                                domain: 'knowledge',
                                timestamp: Date.now(),
                                userMessage: "Search memory for: ".concat(query),
                                assistantResponse: "Found ".concat(results.length, " relevant incidents in operational memory"),
                                context: ['memory_search', query],
                                tags: ['memory_operation', 'knowledge_retrieval', 'pattern_matching']
                            })];
                    case 2:
                        // Store search in memory for analytics
                        _a.sent();
                        return [2 /*return*/, searchResult];
                }
            });
        });
    };
    /**
     * Enhanced error handling and sanitization methods
     */
    ReadOpsTools.prototype.safeJsonStringify = function (obj) {
        try {
            // Check object size before stringifying
            var testStr = JSON.stringify(obj);
            // If response is too large (>500KB), truncate it
            if (testStr.length > 500000) {
                console.error('⚠️ Large response detected, truncating...');
                if (typeof obj === 'object' && obj.description) {
                    // For describe operations, truncate the description field
                    var truncated = __assign(__assign({}, obj), { description: obj.description.substring(0, 100000) + '\n\n[... truncated due to size limit ...]', truncated: true, originalSize: testStr.length });
                    return JSON.stringify(truncated, null, 2);
                }
            }
            return JSON.stringify(obj, null, 2);
        }
        catch (error) {
            console.error('❌ JSON stringify failed:', error);
            // Fallback to safe string representation
            return JSON.stringify({
                success: false,
                error: 'Failed to serialize response',
                message: 'Response contained non-serializable data',
                timestamp: new Date().toISOString()
            }, null, 2);
        }
    };
    ReadOpsTools.prototype.sanitizeError = function (error) {
        if (error instanceof Error) {
            // Clean error message of any potential special characters that could break MCP
            return error.message.replace(/[\r\n\t]/g, ' ').substring(0, 1000);
        }
        if (typeof error === 'string') {
            return error.replace(/[\r\n\t]/g, ' ').substring(0, 1000);
        }
        return 'Unknown error type';
    };
    ReadOpsTools.prototype.sanitizeArgs = function (args) {
        // Remove potentially problematic fields from args for error reporting
        var sanitized = __assign({}, args);
        // Remove large or sensitive fields
        delete sanitized.sessionId;
        return sanitized;
    };
    return ReadOpsTools;
}());
exports.ReadOpsTools = ReadOpsTools;

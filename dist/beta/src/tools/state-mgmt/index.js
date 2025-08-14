"use strict";
/**
 * State Management Tools - Memory and workflow state operations
 *
 * Following ADR-004 namespace conventions: oc_state_*
 * Tools for managing workflow state and operational memory
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
exports.StateMgmtTools = void 0;
var StateMgmtTools = /** @class */ (function () {
    function StateMgmtTools(memoryManager, workflowEngine) {
        this.memoryManager = memoryManager;
        this.workflowEngine = workflowEngine;
        this.category = 'workflow';
        this.version = 'v2';
    }
    StateMgmtTools.prototype.getTools = function () {
        var _this = this;
        var toolDefinitions = this.getToolDefinitions();
        return toolDefinitions.map(function (tool) { return _this.convertToStandardTool(tool); });
    };
    StateMgmtTools.prototype.getToolDefinitions = function () {
        return [
            {
                name: 'store_incident',
                namespace: 'mcp-memory',
                fullName: 'memory_store_operational',
                domain: 'knowledge',
                capabilities: [
                    { type: 'memory', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Store an incident resolution in operational memory for future reference',
                inputSchema: {
                    type: 'object',
                    properties: {
                        incidentId: {
                            type: 'string',
                            description: 'Unique identifier for the incident'
                        },
                        symptoms: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'List of observed symptoms'
                        },
                        rootCause: {
                            type: 'string',
                            description: 'Identified root cause of the incident'
                        },
                        resolution: {
                            type: 'string',
                            description: 'How the incident was resolved'
                        },
                        affectedResources: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'List of affected resources'
                        },
                        environment: {
                            type: 'string',
                            enum: ['dev', 'test', 'staging', 'prod'],
                            description: 'Environment where incident occurred'
                        },
                        sessionId: {
                            type: 'string',
                            description: 'Session ID for workflow tracking'
                        }
                    },
                    required: ['incidentId', 'symptoms', 'environment']
                },
                priority: 70
            },
            {
                name: 'search_operational',
                namespace: 'mcp-memory',
                fullName: 'memory_search_operational',
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
                priority: 75
            },
            {
                name: 'get_workflow_state',
                namespace: 'mcp-core',
                fullName: 'core_workflow_state',
                domain: 'system',
                capabilities: [
                    { type: 'state', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Get current workflow state for a session',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sessionId: {
                            type: 'string',
                            description: 'Session ID to query'
                        }
                    },
                    required: ['sessionId']
                },
                priority: 75
            },
            {
                name: 'memory_stats',
                namespace: 'mcp-memory',
                fullName: 'memory_get_stats',
                domain: 'knowledge',
                capabilities: [
                    { type: 'memory', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Get memory system statistics and health information',
                inputSchema: {
                    type: 'object',
                    properties: {
                        detailed: {
                            type: 'boolean',
                            description: 'Include detailed breakdown of memory usage',
                            default: false
                        }
                    }
                },
                priority: 65
            },
            {
                name: 'search_conversations',
                namespace: 'mcp-memory',
                fullName: 'memory_search_conversations',
                domain: 'knowledge',
                capabilities: [
                    { type: 'memory', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Search conversation memory for relevant context',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query for finding relevant conversations'
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
                priority: 65
            }
        ];
    };
    StateMgmtTools.prototype.convertToStandardTool = function (toolDef) {
        var _this = this;
        return {
            name: toolDef.name,
            fullName: toolDef.fullName,
            description: toolDef.description,
            inputSchema: toolDef.inputSchema,
            category: 'workflow',
            version: 'v2',
            execute: function (args) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, this.executeTool(toolDef.fullName, args)];
            }); }); }
        };
    };
    StateMgmtTools.prototype.storeIncident = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.error("\uD83D\uDCBE Storing incident: ".concat(args.incidentId));
                        return [4 /*yield*/, this.memoryManager.storeOperational({
                                incidentId: args.incidentId,
                                domain: 'operations',
                                timestamp: Date.now(),
                                symptoms: args.symptoms || [],
                                rootCause: args.rootCause || '',
                                resolution: args.resolution || '',
                                affectedResources: args.affectedResources || [],
                                diagnosticSteps: ['Manual incident storage'],
                                tags: ['incident_storage', 'manual_entry', args.environment],
                                environment: args.environment
                            })];
                    case 1:
                        _a.sent();
                        if (!args.sessionId) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.memoryManager.storeConversation({
                                sessionId: args.sessionId,
                                domain: 'operations',
                                timestamp: Date.now(),
                                userMessage: "Store incident: ".concat(args.incidentId),
                                assistantResponse: 'Incident stored successfully',
                                context: ['incident_storage'],
                                tags: ['memory_operation', 'incident_storage']
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, JSON.stringify({
                            operation: 'store_incident',
                            incidentId: args.incidentId,
                            memoryId: "".concat(args.incidentId, "_").concat(Date.now()),
                            status: 'success',
                            timestamp: new Date().toISOString()
                        }, null, 2)];
                }
            });
        });
    };
    StateMgmtTools.prototype.searchOperational = function (query, limit, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.error("\uD83D\uDD0D Searching operational memory for: ".concat(query));
                        return [4 /*yield*/, this.memoryManager.searchOperational(query, limit || 5)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, {
                                query: query,
                                limit: limit || 5,
                                resultsFound: results.length,
                                results: results.map(function (r) {
                                    // Type guard to ensure we're working with OperationalMemory
                                    var memory = r.memory; // Use any for now to bypass type issues
                                    return {
                                        similarity: r.similarity,
                                        incidentId: memory.incidentId || 'unknown',
                                        symptoms: memory.symptoms || [],
                                        rootCause: memory.rootCause || 'not specified',
                                        resolution: memory.resolution || 'not specified',
                                        environment: memory.environment || 'unknown',
                                        timestamp: memory.timestamp
                                    };
                                }),
                                timestamp: new Date().toISOString()
                            }];
                }
            });
        });
    };
    StateMgmtTools.prototype.getWorkflowState = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.error("\uD83D\uDD04 Getting workflow state for session: ".concat(sessionId));
                // For now, return a basic state since getSessionState might not exist
                // TODO: Implement proper workflow state retrieval
                return [2 /*return*/, {
                        sessionId: sessionId,
                        currentState: 'unknown',
                        evidence: [],
                        hypotheses: [],
                        panicSignals: [],
                        startTime: null,
                        lastStateChange: null,
                        timestamp: new Date().toISOString(),
                        note: 'Workflow state tracking not fully implemented yet'
                    }];
            });
        });
    };
    StateMgmtTools.prototype.getMemoryStats = function (detailed) {
        return __awaiter(this, void 0, void 0, function () {
            var stats, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.error("\uD83D\uDCC8 Getting memory system statistics (detailed: ".concat(detailed, ")"));
                        return [4 /*yield*/, this.memoryManager.getStats()];
                    case 1:
                        stats = _a.sent();
                        result = {
                            totalConversations: stats.totalConversations,
                            totalOperational: stats.totalOperational,
                            chromaAvailable: stats.chromaAvailable,
                            storageUsed: stats.storageUsed,
                            lastCleanup: stats.lastCleanup,
                            namespace: stats.namespace,
                            detailed: detailed || false,
                            timestamp: new Date().toISOString()
                        };
                        if (detailed) {
                            result.details = {
                                memoryBreakdown: {
                                    conversationMemory: "".concat(stats.totalConversations, " entries"),
                                    operationalMemory: "".concat(stats.totalOperational, " incidents"),
                                    storageBackend: stats.chromaAvailable ? 'ChromaDB + JSON' : 'JSON only'
                                },
                                systemHealth: {
                                    chromaStatus: stats.chromaAvailable ? 'available' : 'unavailable',
                                    storageLocation: stats.namespace,
                                    lastCleanup: stats.lastCleanup
                                }
                            };
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    StateMgmtTools.prototype.searchConversations = function (query, limit, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var results, searchResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.error("\uD83D\uDD0D Searching conversation memory for: ".concat(query));
                        return [4 /*yield*/, this.memoryManager.searchConversations(query, limit || 5)];
                    case 1:
                        results = _a.sent();
                        searchResult = {
                            query: query,
                            limit: limit || 5,
                            resultsFound: results.length,
                            results: results.map(function (r) { return ({
                                similarity: r.similarity,
                                relevance: r.relevance,
                                sessionId: 'sessionId' in r.memory ? r.memory.sessionId : '',
                                domain: r.memory.domain,
                                userMessage: 'userMessage' in r.memory ? r.memory.userMessage : '',
                                assistantResponse: 'assistantResponse' in r.memory ? r.memory.assistantResponse : '',
                                timestamp: r.memory.timestamp,
                                tags: r.memory.tags
                            }); }),
                            timestamp: new Date().toISOString()
                        };
                        if (!sessionId) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.memoryManager.storeConversation({
                                sessionId: sessionId,
                                domain: 'knowledge',
                                timestamp: Date.now(),
                                userMessage: "Search conversations for: ".concat(query),
                                assistantResponse: "Found ".concat(results.length, " relevant conversations"),
                                context: ['conversation_search', query],
                                tags: ['memory_operation', 'conversation_search']
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, searchResult];
                }
            });
        });
    };
    StateMgmtTools.prototype.executeTool = function (toolName, args) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, _a, operationalResults, workflowState, stats, conversationResults, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sessionId = args.sessionId;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 14, , 16]);
                        _a = toolName;
                        switch (_a) {
                            case 'memory_store_operational': return [3 /*break*/, 2];
                            case 'memory_search_operational': return [3 /*break*/, 4];
                            case 'core_workflow_state': return [3 /*break*/, 6];
                            case 'memory_get_stats': return [3 /*break*/, 8];
                            case 'memory_search_conversations': return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 12];
                    case 2: return [4 /*yield*/, this.storeIncident(args)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4: return [4 /*yield*/, this.searchOperational(args.query, args.limit, sessionId)];
                    case 5:
                        operationalResults = _b.sent();
                        return [2 /*return*/, JSON.stringify(operationalResults, null, 2)];
                    case 6: return [4 /*yield*/, this.getWorkflowState(sessionId)];
                    case 7:
                        workflowState = _b.sent();
                        return [2 /*return*/, JSON.stringify(workflowState, null, 2)];
                    case 8: return [4 /*yield*/, this.getMemoryStats(args.detailed)];
                    case 9:
                        stats = _b.sent();
                        return [2 /*return*/, JSON.stringify(stats, null, 2)];
                    case 10: return [4 /*yield*/, this.searchConversations(args.query, args.limit, sessionId)];
                    case 11:
                        conversationResults = _b.sent();
                        return [2 /*return*/, JSON.stringify(conversationResults, null, 2)];
                    case 12: throw new Error("Unknown state management tool: ".concat(toolName));
                    case 13: return [3 /*break*/, 16];
                    case 14:
                        error_1 = _b.sent();
                        // Store error for analysis
                        return [4 /*yield*/, this.memoryManager.storeOperational({
                                incidentId: "state-mgmt-error-".concat(sessionId, "-").concat(Date.now()),
                                domain: 'system',
                                timestamp: Date.now(),
                                symptoms: ["State management tool error: ".concat(toolName)],
                                rootCause: error_1 instanceof Error ? error_1.message : 'Unknown error',
                                affectedResources: [],
                                diagnosticSteps: ["Failed to execute ".concat(toolName)],
                                tags: ['state_mgmt_error', 'tool_failure', toolName],
                                environment: 'prod'
                            })];
                    case 15:
                        // Store error for analysis
                        _b.sent();
                        console.error("\u274C State management operation ".concat(toolName, " failed:"), error_1);
                        throw error_1;
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    return StateMgmtTools;
}());
exports.StateMgmtTools = StateMgmtTools;

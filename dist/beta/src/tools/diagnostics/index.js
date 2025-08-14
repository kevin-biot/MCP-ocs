"use strict";
/**
 * Enhanced Diagnostic Tools v2 - OpenShift Health and Status Checks
 *
 * Replaces v1 diagnostic tools with enhanced implementations:
 * - Better error handling and caching
 * - Intelligent pattern detection
 * - Comprehensive health analysis
 * - Real-world operational patterns
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticToolsV2 = void 0;
var tool_memory_gateway_1 = require("../../lib/tools/tool-memory-gateway");
var oc_wrapper_v2_1 = require("../../v2/lib/oc-wrapper-v2");
var index_1 = require("../../v2/tools/check-namespace-health/index");
var index_2 = require("../../v2/tools/rca-checklist/index");
var v2_integration_1 = require("../../v2-integration");
var DiagnosticToolsV2 = /** @class */ (function () {
    function DiagnosticToolsV2(openshiftClient, memoryManager) {
        this.openshiftClient = openshiftClient;
        this.memoryManager = memoryManager;
        this.category = 'diagnostic';
        this.version = 'v2';
        // Initialize v2 components
        this.ocWrapperV2 = new oc_wrapper_v2_1.OcWrapperV2();
        this.namespaceHealthChecker = new index_1.NamespaceHealthChecker(this.ocWrapperV2);
        this.rcaChecklistEngine = new index_2.RCAChecklistEngine(this.ocWrapperV2);
        this.memoryGateway = new tool_memory_gateway_1.ToolMemoryGateway('./memory');
    }
    /**
     * Execute the enhanced namespace health tool
     */
    DiagnosticToolsV2.prototype.executeNamespaceHealthV2 = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var v2Args, raw, payload, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        v2Args = {
                            sessionId: args.sessionId,
                            namespace: args.namespace,
                            includeIngressTest: args.includeIngressTest || false,
                            maxLogLinesPerPod: args.maxLogLinesPerPod || 0
                        };
                        return [4 /*yield*/, v2_integration_1.checkNamespaceHealthV2Tool.handler(v2Args)];
                    case 1:
                        raw = _a.sent();
                        payload = void 0;
                        try {
                            payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
                        }
                        catch (_b) {
                            payload = { result: raw };
                        }
                        // Persist via adapter-backed gateway for consistent Chroma v2 integration
                        if (!this.memoryGateway) {
                            this.memoryGateway = new tool_memory_gateway_1.ToolMemoryGateway('./memory');
                        }
                        return [4 /*yield*/, this.memoryGateway.storeToolExecution('oc_diagnostic_namespace_health', { namespace: args.namespace, includeIngressTest: !!args.includeIngressTest }, payload, args.sessionId, ['diagnostic', 'namespace_health', args.namespace, String((payload === null || payload === void 0 ? void 0 : payload.status) || 'unknown')], 'openshift', 'prod', (payload === null || payload === void 0 ? void 0 : payload.status) === 'healthy' ? 'low' : 'medium')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, typeof raw === 'string' ? raw : JSON.stringify(raw)];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, this.formatErrorResponse('enhanced namespace health check', error_1, args.sessionId)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DiagnosticToolsV2.prototype.getTools = function () {
        var _this = this;
        var toolDefinitions = this.getToolDefinitions();
        return toolDefinitions.map(function (tool) { return _this.convertToStandardTool(tool); });
    };
    DiagnosticToolsV2.prototype.getToolDefinitions = function () {
        return [
            {
                name: 'cluster_health',
                namespace: 'mcp-openshift',
                fullName: 'oc_diagnostic_cluster_health',
                domain: 'cluster',
                priority: 90,
                capabilities: [
                    { type: 'diagnostic', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Enhanced cluster health analysis with intelligent issue detection',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sessionId: { type: 'string' },
                        includeNamespaceAnalysis: { type: 'boolean', default: false },
                        maxNamespacesToAnalyze: { type: 'number', default: 10 }
                    },
                    required: ['sessionId']
                }
            },
            {
                name: 'namespace_health',
                namespace: 'mcp-openshift',
                fullName: 'oc_diagnostic_namespace_health',
                domain: 'cluster',
                priority: 80,
                capabilities: [
                    { type: 'diagnostic', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [
                    { type: 'domain_focus', value: 'namespace', required: true }
                ],
                description: 'Comprehensive namespace health analysis with pod, PVC, route diagnostics and ingress testing',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sessionId: { type: 'string' },
                        namespace: { type: 'string' },
                        includeIngressTest: { type: 'boolean', default: false },
                        maxLogLinesPerPod: { type: 'number', default: 0 },
                        deepAnalysis: { type: 'boolean', default: false }
                    },
                    required: ['sessionId', 'namespace']
                }
            },
            {
                name: 'pod_health',
                namespace: 'mcp-openshift',
                fullName: 'oc_diagnostic_pod_health',
                domain: 'cluster',
                priority: 70,
                capabilities: [
                    { type: 'diagnostic', level: 'basic', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [
                    { type: 'domain_focus', value: 'namespace', required: true },
                    { type: 'domain_focus', value: 'pod', required: true }
                ],
                description: 'Enhanced pod health diagnostics with dependency analysis',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sessionId: { type: 'string' },
                        namespace: { type: 'string' },
                        podName: { type: 'string' },
                        includeDependencies: { type: 'boolean', default: true },
                        includeResourceAnalysis: { type: 'boolean', default: true }
                    },
                    required: ['sessionId', 'namespace', 'podName']
                }
            },
            {
                name: 'rca_checklist',
                namespace: 'mcp-openshift',
                fullName: 'oc_diagnostic_rca_checklist',
                domain: 'cluster',
                priority: 100,
                capabilities: [
                    { type: 'diagnostic', level: 'advanced', riskLevel: 'safe' }
                ],
                dependencies: [],
                contextRequirements: [],
                description: 'Guided "First 10 Minutes" RCA workflow for systematic incident response',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sessionId: { type: 'string' },
                        namespace: { type: 'string', description: 'Target namespace (optional for cluster-wide analysis)' },
                        outputFormat: { type: 'string', enum: ['json', 'markdown'], default: 'json' },
                        includeDeepAnalysis: { type: 'boolean', default: false },
                        maxCheckTime: { type: 'number', default: 60000, description: 'Maximum checklist execution time in ms' }
                    },
                    required: ['sessionId']
                }
            }
        ];
    };
    DiagnosticToolsV2.prototype.convertToStandardTool = function (toolDef) {
        var _this = this;
        return {
            name: toolDef.name,
            fullName: toolDef.fullName,
            description: toolDef.description,
            inputSchema: toolDef.inputSchema,
            category: 'diagnostic',
            version: 'v2',
            execute: function (args) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, this.executeTool(toolDef.fullName, args)];
            }); }); }
        };
    };
    DiagnosticToolsV2.prototype.executeTool = function (toolName, args) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, _a, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sessionId = args.sessionId;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 12, , 14]);
                        _a = toolName;
                        switch (_a) {
                            case 'oc_diagnostic_cluster_health': return [3 /*break*/, 2];
                            case 'oc_diagnostic_namespace_health': return [3 /*break*/, 4];
                            case 'oc_diagnostic_pod_health': return [3 /*break*/, 6];
                            case 'oc_diagnostic_rca_checklist': return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 10];
                    case 2: return [4 /*yield*/, this.enhancedClusterHealth(args)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4: return [4 /*yield*/, this.executeNamespaceHealthV2(args)];
                    case 5: return [2 /*return*/, _b.sent()]; // Use V2 implementation
                    case 6: return [4 /*yield*/, this.enhancedPodHealth(args)];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8: return [4 /*yield*/, this.executeRCAChecklist(args)];
                    case 9: return [2 /*return*/, _b.sent()];
                    case 10: throw new Error("Unknown diagnostic tool: ".concat(toolName));
                    case 11: return [3 /*break*/, 14];
                    case 12:
                        error_2 = _b.sent();
                        // Store diagnostic error for analysis
                        return [4 /*yield*/, this.memoryManager.storeOperational({
                                incidentId: "diagnostic-error-".concat(sessionId, "-").concat(Date.now()),
                                domain: 'cluster',
                                timestamp: Date.now(),
                                symptoms: ["Diagnostic tool error: ".concat(toolName)],
                                rootCause: error_2 instanceof Error ? error_2.message : 'Unknown error',
                                affectedResources: [],
                                diagnosticSteps: ["Failed to execute ".concat(toolName)],
                                tags: ['diagnostic_error', 'tool_failure', toolName],
                                environment: 'prod'
                            })];
                    case 13:
                        // Store diagnostic error for analysis
                        _b.sent();
                        throw error_2;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enhanced cluster health check with v2 capabilities
     */
    DiagnosticToolsV2.prototype.enhancedClusterHealth = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, sessionId, _a, includeNamespaceAnalysis, _b, maxNamespacesToAnalyze, clusterInfo, nodeHealth, operatorHealth, systemNamespaceHealth, namespaceAnalysis, healthSummary, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = Date.now();
                        sessionId = args.sessionId, _a = args.includeNamespaceAnalysis, includeNamespaceAnalysis = _a === void 0 ? false : _a, _b = args.maxNamespacesToAnalyze, maxNamespacesToAnalyze = _b === void 0 ? 10 : _b;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, this.openshiftClient.getClusterInfo()];
                    case 2:
                        clusterInfo = _c.sent();
                        return [4 /*yield*/, this.analyzeNodeHealth()];
                    case 3:
                        nodeHealth = _c.sent();
                        return [4 /*yield*/, this.analyzeOperatorHealth()];
                    case 4:
                        operatorHealth = _c.sent();
                        return [4 /*yield*/, this.analyzeSystemNamespaces()];
                    case 5:
                        systemNamespaceHealth = _c.sent();
                        namespaceAnalysis = null;
                        if (!includeNamespaceAnalysis) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.analyzeUserNamespaces(maxNamespacesToAnalyze)];
                    case 6:
                        namespaceAnalysis = _c.sent();
                        _c.label = 7;
                    case 7:
                        healthSummary = {
                            cluster: {
                                status: clusterInfo.status,
                                version: clusterInfo.version,
                                currentUser: clusterInfo.currentUser,
                                serverUrl: clusterInfo.serverUrl,
                                timestamp: new Date().toISOString()
                            },
                            nodes: nodeHealth,
                            operators: operatorHealth,
                            systemNamespaces: systemNamespaceHealth,
                            userNamespaces: namespaceAnalysis,
                            overallHealth: this.calculateOverallHealth(nodeHealth, operatorHealth, systemNamespaceHealth),
                            duration: "".concat(Date.now() - startTime, "ms"),
                            recommendations: this.generateClusterRecommendations(nodeHealth, operatorHealth, systemNamespaceHealth)
                        };
                        // Store diagnostic results via adapter-backed gateway (Chroma v2 aware)
                        return [4 /*yield*/, this.memoryGateway.storeToolExecution('oc_diagnostic_cluster_health', { includeNamespaceAnalysis: includeNamespaceAnalysis, maxNamespacesToAnalyze: maxNamespacesToAnalyze }, healthSummary, sessionId, ['diagnostic', 'cluster_health', String(healthSummary.overallHealth)], 'openshift', 'prod', healthSummary.overallHealth === 'healthy' ? 'low' : 'medium')];
                    case 8:
                        // Store diagnostic results via adapter-backed gateway (Chroma v2 aware)
                        _c.sent();
                        return [2 /*return*/, this.formatClusterHealthResponse(healthSummary, sessionId)];
                    case 9:
                        error_3 = _c.sent();
                        return [2 /*return*/, this.formatErrorResponse('cluster health check', error_3, sessionId)];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enhanced namespace health using v2 implementation
     */
    DiagnosticToolsV2.prototype.enhancedNamespaceHealth = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, namespace, _a, includeIngressTest, _b, deepAnalysis, healthResult, deepAnalysisResults, response, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        sessionId = args.sessionId, namespace = args.namespace, _a = args.includeIngressTest, includeIngressTest = _a === void 0 ? false : _a, _b = args.deepAnalysis, deepAnalysis = _b === void 0 ? false : _b;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.namespaceHealthChecker.checkHealth({
                                namespace: namespace,
                                includeIngressTest: includeIngressTest,
                                maxLogLinesPerPod: deepAnalysis ? 50 : 0
                            })];
                    case 2:
                        healthResult = _c.sent();
                        deepAnalysisResults = null;
                        if (!deepAnalysis) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.performDeepNamespaceAnalysis(namespace)];
                    case 3:
                        deepAnalysisResults = _c.sent();
                        _c.label = 4;
                    case 4:
                        response = {
                            tool: 'oc_diagnostic_namespace_health',
                            sessionId: sessionId,
                            namespace: healthResult.namespace,
                            status: healthResult.status,
                            timestamp: healthResult.timestamp,
                            duration: "".concat(healthResult.duration, "ms"),
                            summary: {
                                pods: "".concat(healthResult.checks.pods.ready, "/").concat(healthResult.checks.pods.total, " ready"),
                                pvcs: "".concat(healthResult.checks.pvcs.bound, "/").concat(healthResult.checks.pvcs.total, " bound"),
                                routes: "".concat(healthResult.checks.routes.total, " configured"),
                                criticalEvents: healthResult.checks.events.length
                            },
                            issues: {
                                crashLoopPods: healthResult.checks.pods.crashloops,
                                imagePullErrors: healthResult.checks.pods.imagePullErrors,
                                pendingPods: healthResult.checks.pods.pending,
                                oomKilledPods: healthResult.checks.pods.oomKilled,
                                pvcErrors: healthResult.checks.pvcs.errors,
                                recentEvents: healthResult.checks.events.slice(0, 5)
                            },
                            suspicions: healthResult.suspicions,
                            human: healthResult.human,
                            deepAnalysis: deepAnalysisResults,
                            nextActions: this.generateNamespaceNextActions(healthResult),
                            // Integration with existing memory system
                            memoryStored: true
                        };
                        // Store in operational memory
                        return [4 /*yield*/, this.memoryManager.storeOperational({
                                incidentId: "namespace-health-".concat(sessionId),
                                domain: 'cluster',
                                timestamp: Date.now(),
                                symptoms: healthResult.suspicions.length > 0 ? healthResult.suspicions : ['namespace_healthy'],
                                affectedResources: ["namespace/".concat(namespace)],
                                diagnosticSteps: ['Enhanced namespace health check completed'],
                                tags: ['namespace_health', 'diagnostic', namespace, healthResult.status],
                                environment: 'prod'
                            })];
                    case 5:
                        // Store in operational memory
                        _c.sent();
                        return [2 /*return*/, JSON.stringify(response, null, 2)];
                    case 6:
                        error_4 = _c.sent();
                        return [2 /*return*/, this.formatErrorResponse('namespace health check', error_4, sessionId)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enhanced pod health with dependency analysis
     */
    DiagnosticToolsV2.prototype.enhancedPodHealth = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, namespace, podName, _a, includeDependencies, _b, includeResourceAnalysis, podData, pod, podAnalysis, dependencies, resourceAnalysis, response, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        sessionId = args.sessionId, namespace = args.namespace, podName = args.podName, _a = args.includeDependencies, includeDependencies = _a === void 0 ? true : _a, _b = args.includeResourceAnalysis, includeResourceAnalysis = _b === void 0 ? true : _b;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, this.ocWrapperV2.executeOc(['get', 'pod', podName, '-o', 'json'], { namespace: namespace })];
                    case 2:
                        podData = _c.sent();
                        pod = JSON.parse(podData.stdout);
                        podAnalysis = this.analyzePodDetails(pod);
                        dependencies = null;
                        if (!includeDependencies) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.analyzePodDependencies(namespace, podName)];
                    case 3:
                        dependencies = _c.sent();
                        _c.label = 4;
                    case 4:
                        resourceAnalysis = null;
                        if (!includeResourceAnalysis) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.analyzePodResources(pod)];
                    case 5:
                        resourceAnalysis = _c.sent();
                        _c.label = 6;
                    case 6:
                        response = {
                            tool: 'oc_diagnostic_pod_health',
                            sessionId: sessionId,
                            namespace: namespace,
                            podName: podName,
                            timestamp: new Date().toISOString(),
                            health: podAnalysis,
                            dependencies: dependencies,
                            resources: resourceAnalysis,
                            recommendations: this.generatePodRecommendations(podAnalysis, dependencies, resourceAnalysis),
                            human: this.generatePodHealthSummary(podName, podAnalysis, dependencies)
                        };
                        // Store pod health check
                        return [4 /*yield*/, this.memoryManager.storeOperational({
                                incidentId: "pod-health-".concat(sessionId),
                                domain: 'cluster',
                                timestamp: Date.now(),
                                symptoms: podAnalysis.issues.length > 0 ? podAnalysis.issues : ['pod_healthy'],
                                affectedResources: ["pod/".concat(podName), "namespace/".concat(namespace)],
                                diagnosticSteps: ['Enhanced pod health check completed'],
                                tags: ['pod_health', 'diagnostic', namespace, podName],
                                environment: 'prod'
                            })];
                    case 7:
                        // Store pod health check
                        _c.sent();
                        return [2 /*return*/, JSON.stringify(response, null, 2)];
                    case 8:
                        error_5 = _c.sent();
                        return [2 /*return*/, this.formatErrorResponse('pod health check', error_5, sessionId)];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // Helper methods for enhanced analysis
    DiagnosticToolsV2.prototype.analyzeNodeHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nodesData, nodes, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.ocWrapperV2.executeOc(['get', 'nodes', '-o', 'json'])];
                    case 1:
                        nodesData = _a.sent();
                        nodes = JSON.parse(nodesData.stdout);
                        return [2 /*return*/, {
                                total: nodes.items.length,
                                ready: nodes.items.filter(function (node) {
                                    return node.status.conditions.some(function (c) { return c.type === 'Ready' && c.status === 'True'; });
                                }).length,
                                issues: nodes.items.filter(function (node) {
                                    return node.status.conditions.some(function (c) { return c.type === 'Ready' && c.status !== 'True'; });
                                }).map(function (node) { return node.metadata.name; })
                            }];
                    case 2:
                        error_6 = _a.sent();
                        return [2 /*return*/, { total: 0, ready: 0, issues: ["Failed to get node status: ".concat(error_6)] }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DiagnosticToolsV2.prototype.analyzeOperatorHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var operatorsData, operators, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.ocWrapperV2.executeOc(['get', 'clusteroperators', '-o', 'json'])];
                    case 1:
                        operatorsData = _a.sent();
                        operators = JSON.parse(operatorsData.stdout);
                        return [2 /*return*/, {
                                total: operators.items.length,
                                degraded: operators.items.filter(function (op) {
                                    return op.status.conditions.some(function (c) { return c.type === 'Degraded' && c.status === 'True'; });
                                }).map(function (op) { return op.metadata.name; })
                            }];
                    case 2:
                        error_7 = _a.sent();
                        return [2 /*return*/, { total: 0, degraded: ["Failed to get operator status: ".concat(error_7)] }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DiagnosticToolsV2.prototype.analyzeSystemNamespaces = function () {
        return __awaiter(this, void 0, void 0, function () {
            var systemNamespaces, results, _i, systemNamespaces_1, ns, health, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        systemNamespaces = ['openshift-apiserver', 'openshift-etcd', 'openshift-kube-apiserver'];
                        results = [];
                        _i = 0, systemNamespaces_1 = systemNamespaces;
                        _a.label = 1;
                    case 1:
                        if (!(_i < systemNamespaces_1.length)) return [3 /*break*/, 6];
                        ns = systemNamespaces_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.namespaceHealthChecker.checkHealth({ namespace: ns })];
                    case 3:
                        health = _a.sent();
                        results.push({
                            namespace: ns,
                            status: health.status,
                            issues: health.suspicions.length
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_8 = _a.sent();
                        results.push({
                            namespace: ns,
                            status: 'error',
                            issues: 1
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, results];
                }
            });
        });
    };
    DiagnosticToolsV2.prototype.analyzeUserNamespaces = function (maxCount) {
        return __awaiter(this, void 0, void 0, function () {
            var namespacesData, namespaces, userNamespaces, results, _i, userNamespaces_1, ns, health, error_9, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.ocWrapperV2.executeOc(['get', 'namespaces', '-o', 'json'])];
                    case 1:
                        namespacesData = _a.sent();
                        namespaces = JSON.parse(namespacesData.stdout);
                        userNamespaces = namespaces.items
                            .filter(function (ns) { return !ns.metadata.name.startsWith('openshift-') &&
                            !ns.metadata.name.startsWith('kube-'); })
                            .slice(0, maxCount);
                        results = [];
                        _i = 0, userNamespaces_1 = userNamespaces;
                        _a.label = 2;
                    case 2:
                        if (!(_i < userNamespaces_1.length)) return [3 /*break*/, 7];
                        ns = userNamespaces_1[_i];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.namespaceHealthChecker.checkHealth({
                                namespace: ns.metadata.name
                            })];
                    case 4:
                        health = _a.sent();
                        results.push({
                            namespace: ns.metadata.name,
                            status: health.status,
                            podCount: health.checks.pods.total,
                            issues: health.suspicions.length
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_9 = _a.sent();
                        results.push({
                            namespace: ns.metadata.name,
                            status: 'error',
                            issues: 1
                        });
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, results];
                    case 8:
                        error_10 = _a.sent();
                        return [2 /*return*/, ["Failed to analyze user namespaces: ".concat(error_10)]];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    DiagnosticToolsV2.prototype.calculateOverallHealth = function (nodeHealth, operatorHealth, systemHealth) {
        if (nodeHealth.issues.length > 0 || operatorHealth.degraded.length > 0) {
            return 'failing';
        }
        var systemIssues = systemHealth.filter(function (ns) { return ns.status !== 'healthy'; }).length;
        if (systemIssues > 0) {
            return 'degraded';
        }
        return 'healthy';
    };
    DiagnosticToolsV2.prototype.generateClusterRecommendations = function (nodeHealth, operatorHealth, systemHealth) {
        var recommendations = [];
        if (nodeHealth.issues.length > 0) {
            recommendations.push("Check node issues: oc describe node ".concat(nodeHealth.issues[0]));
        }
        if (operatorHealth.degraded.length > 0) {
            recommendations.push("Check degraded operators: oc get clusteroperator ".concat(operatorHealth.degraded[0], " -o yaml"));
        }
        var failingSystemNs = systemHealth.filter(function (ns) { return ns.status === 'failing'; });
        if (failingSystemNs.length > 0) {
            recommendations.push("Check system namespace: oc get pods -n ".concat(failingSystemNs[0].namespace));
        }
        return recommendations.slice(0, 3); // Top 3 recommendations
    };
    DiagnosticToolsV2.prototype.generateNamespaceNextActions = function (healthResult) {
        var actions = [];
        if (healthResult.checks.pods.crashloops.length > 0) {
            actions.push("Check crashloop logs: oc logs ".concat(healthResult.checks.pods.crashloops[0], " -n ").concat(healthResult.namespace, " --previous"));
        }
        if (healthResult.checks.pods.imagePullErrors.length > 0) {
            actions.push("Check image pull issues: oc describe pod ".concat(healthResult.checks.pods.imagePullErrors[0], " -n ").concat(healthResult.namespace));
        }
        if (healthResult.checks.pvcs.pending > 0) {
            actions.push("Check PVC status: oc get pvc -n ".concat(healthResult.namespace));
        }
        return actions.slice(0, 3);
    };
    DiagnosticToolsV2.prototype.performDeepNamespaceAnalysis = function (namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {};
                        return [4 /*yield*/, this.checkResourceQuotas(namespace)];
                    case 1:
                        _a.resourceQuotas = _b.sent();
                        return [4 /*yield*/, this.checkNetworkPolicies(namespace)];
                    case 2:
                        _a.networkPolicies = _b.sent();
                        return [4 /*yield*/, this.checkSecrets(namespace)];
                    case 3: 
                    // Placeholder for deep analysis - can be enhanced with resource quotas, network policies, etc.
                    return [2 /*return*/, (_a.secrets = _b.sent(),
                            _a)];
                }
            });
        });
    };
    DiagnosticToolsV2.prototype.checkResourceQuotas = function (namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var quotaData, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.ocWrapperV2.executeOc(['get', 'resourcequota', '-o', 'json'], { namespace: namespace })];
                    case 1:
                        quotaData = _b.sent();
                        return [2 /*return*/, JSON.parse(quotaData.stdout).items.length];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DiagnosticToolsV2.prototype.checkNetworkPolicies = function (namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var npData, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.ocWrapperV2.executeOc(['get', 'networkpolicy', '-o', 'json'], { namespace: namespace })];
                    case 1:
                        npData = _b.sent();
                        return [2 /*return*/, JSON.parse(npData.stdout).items.length];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DiagnosticToolsV2.prototype.checkSecrets = function (namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var secretData, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.ocWrapperV2.executeOc(['get', 'secrets', '-o', 'json'], { namespace: namespace })];
                    case 1:
                        secretData = _b.sent();
                        return [2 /*return*/, JSON.parse(secretData.stdout).items.length];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DiagnosticToolsV2.prototype.analyzePodDetails = function (pod) {
        var _a;
        var containerStatuses = pod.status.containerStatuses || [];
        var issues = [];
        for (var _i = 0, containerStatuses_1 = containerStatuses; _i < containerStatuses_1.length; _i++) {
            var container = containerStatuses_1[_i];
            if ((_a = container.state) === null || _a === void 0 ? void 0 : _a.waiting) {
                issues.push("".concat(container.name, ": ").concat(container.state.waiting.reason));
            }
            if (container.restartCount > 5) {
                issues.push("".concat(container.name, ": High restart count (").concat(container.restartCount, ")"));
            }
        }
        return {
            phase: pod.status.phase,
            ready: containerStatuses.every(function (c) { return c.ready; }),
            restarts: containerStatuses.reduce(function (sum, c) { return sum + c.restartCount; }, 0),
            issues: issues
        };
    };
    DiagnosticToolsV2.prototype.analyzePodDependencies = function (namespace, podName) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {};
                        return [4 /*yield*/, this.findServicesForPod(namespace, podName)];
                    case 1:
                        _a.services = _b.sent();
                        return [4 /*yield*/, this.findConfigMapsForPod(namespace, podName)];
                    case 2:
                        _a.configMaps = _b.sent();
                        return [4 /*yield*/, this.findSecretsForPod(namespace, podName)];
                    case 3: 
                    // Placeholder for dependency analysis - services, configmaps, secrets, etc.
                    return [2 /*return*/, (_a.secrets = _b.sent(),
                            _a)];
                }
            });
        });
    };
    DiagnosticToolsV2.prototype.findServicesForPod = function (namespace, podName) {
        return __awaiter(this, void 0, void 0, function () {
            var servicesData, services, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.ocWrapperV2.executeOc(['get', 'services', '-o', 'json'], { namespace: namespace })];
                    case 1:
                        servicesData = _b.sent();
                        services = JSON.parse(servicesData.stdout);
                        return [2 /*return*/, services.items.length];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DiagnosticToolsV2.prototype.findConfigMapsForPod = function (namespace, podName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Placeholder - would analyze pod spec for configMap references
                return [2 /*return*/, 0];
            });
        });
    };
    DiagnosticToolsV2.prototype.findSecretsForPod = function (namespace, podName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Placeholder - would analyze pod spec for secret references  
                return [2 /*return*/, 0];
            });
        });
    };
    DiagnosticToolsV2.prototype.analyzePodResources = function (pod) {
        return __awaiter(this, void 0, void 0, function () {
            var containers;
            return __generator(this, function (_a) {
                containers = pod.spec.containers || [];
                return [2 /*return*/, {
                        containers: containers.length,
                        hasResourceLimits: containers.some(function (c) { var _a; return (_a = c.resources) === null || _a === void 0 ? void 0 : _a.limits; }),
                        hasResourceRequests: containers.some(function (c) { var _a; return (_a = c.resources) === null || _a === void 0 ? void 0 : _a.requests; })
                    }];
            });
        });
    };
    DiagnosticToolsV2.prototype.generatePodRecommendations = function (analysis, dependencies, resources) {
        var recommendations = [];
        if (analysis.issues.length > 0) {
            recommendations.push('Check pod logs and events for specific error details');
        }
        if (!(resources === null || resources === void 0 ? void 0 : resources.hasResourceLimits)) {
            recommendations.push('Consider adding resource limits to prevent resource contention');
        }
        if (analysis.restarts > 0) {
            recommendations.push('Investigate causes of pod restarts');
        }
        return recommendations;
    };
    DiagnosticToolsV2.prototype.generatePodHealthSummary = function (podName, analysis, dependencies) {
        var status = analysis.ready ? 'healthy' : 'unhealthy';
        var issues = analysis.issues.length > 0 ? " Issues: ".concat(analysis.issues.join(', ')) : '';
        return "Pod ".concat(podName, " is ").concat(status, ". Phase: ").concat(analysis.phase, ", Restarts: ").concat(analysis.restarts, ".").concat(issues);
    };
    DiagnosticToolsV2.prototype.formatClusterHealthResponse = function (healthSummary, sessionId) {
        return JSON.stringify(__assign(__assign({ tool: 'oc_diagnostic_cluster_health', sessionId: sessionId }, healthSummary), { human: "Cluster is ".concat(healthSummary.overallHealth, ". Nodes: ").concat(healthSummary.nodes.ready, "/").concat(healthSummary.nodes.total, " ready. Operators: ").concat(healthSummary.operators.degraded.length, " degraded.") }), null, 2);
    };
    /**
     * Execute RCA checklist workflow
     */
    DiagnosticToolsV2.prototype.executeRCAChecklist = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, namespace, _a, outputFormat, _b, includeDeepAnalysis, _c, maxCheckTime, checklistResult, response, error_11;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        sessionId = args.sessionId, namespace = args.namespace, _a = args.outputFormat, outputFormat = _a === void 0 ? 'json' : _a, _b = args.includeDeepAnalysis, includeDeepAnalysis = _b === void 0 ? false : _b, _c = args.maxCheckTime, maxCheckTime = _c === void 0 ? 60000 : _c;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.rcaChecklistEngine.executeRCAChecklist({
                                namespace: namespace,
                                outputFormat: outputFormat,
                                includeDeepAnalysis: includeDeepAnalysis,
                                maxCheckTime: maxCheckTime
                            })];
                    case 2:
                        checklistResult = _d.sent();
                        // Store RCA session in operational memory
                        return [4 /*yield*/, this.memoryManager.storeOperational({
                                incidentId: "rca-checklist-".concat(sessionId),
                                domain: 'cluster',
                                timestamp: Date.now(),
                                symptoms: checklistResult.evidence.symptoms,
                                affectedResources: checklistResult.evidence.affectedResources,
                                diagnosticSteps: checklistResult.evidence.diagnosticSteps,
                                tags: __spreadArray(['rca_checklist', 'systematic_diagnostic', checklistResult.overallStatus], (namespace ? [namespace] : ['cluster_wide']), true),
                                environment: 'prod'
                            })];
                    case 3:
                        // Store RCA session in operational memory
                        _d.sent();
                        response = __assign(__assign({ tool: 'oc_diagnostic_rca_checklist', sessionId: sessionId, reportId: checklistResult.reportId, timestamp: checklistResult.timestamp, duration: "".concat(checklistResult.duration, "ms"), 
                            // Core findings
                            scope: namespace ? "namespace: ".concat(namespace) : 'cluster-wide', overallStatus: checklistResult.overallStatus, 
                            // Checklist results
                            summary: checklistResult.summary, checksPerformed: checklistResult.checksPerformed.map(function (check) { return ({
                                name: check.name,
                                status: check.status,
                                severity: check.severity,
                                findings: check.findings.slice(0, 3), // Limit for readability
                                recommendations: check.recommendations.slice(0, 2)
                            }); }), 
                            // Priority actions
                            criticalIssues: checklistResult.criticalIssues, nextActions: checklistResult.nextActions, 
                            // Evidence for workflow integration
                            evidence: checklistResult.evidence, 
                            // Human readable summary
                            human: checklistResult.human }, (outputFormat === 'markdown' && { markdown: checklistResult.markdown })), { 
                            // Performance metrics
                            performance: {
                                totalCheckTime: "".concat(checklistResult.duration, "ms"),
                                checksCompleted: checklistResult.summary.totalChecks,
                                averageCheckTime: "".concat(Math.round(checklistResult.duration / Math.max(checklistResult.summary.totalChecks, 1)), "ms")
                            } });
                        // Return proper ToolResult object instead of just JSON string
                        return [2 /*return*/, JSON.stringify({
                                success: true,
                                result: response,
                                timestamp: new Date().toISOString()
                            }, null, 2)];
                    case 4:
                        error_11 = _d.sent();
                        return [2 /*return*/, this.formatErrorResponse('RCA checklist execution', error_11, sessionId)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DiagnosticToolsV2.prototype.formatErrorResponse = function (operation, error, sessionId) {
        return JSON.stringify({
            tool: 'diagnostic_error',
            sessionId: sessionId,
            error: true,
            operation: operation,
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            human: "Failed to perform ".concat(operation, ": ").concat(error instanceof Error ? error.message : 'Unknown error')
        }, null, 2);
    };
    return DiagnosticToolsV2;
}());
exports.DiagnosticToolsV2 = DiagnosticToolsV2;

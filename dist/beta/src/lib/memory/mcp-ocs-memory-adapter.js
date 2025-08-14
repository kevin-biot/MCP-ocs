"use strict";
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
exports.MCPOcsMemoryAdapter = void 0;
/// <reference path="./mcp-files-shim.d.ts" />
// @ts-ignore: external module provided by MCP-files repo
var memory_extension_ts_1 = require("../../../MCP-files/src/memory-extension.ts");
var MCPOcsMemoryAdapter = /** @class */ (function () {
    function MCPOcsMemoryAdapter(memoryDir) {
        this.memoryManager = new memory_extension_ts_1.ChromaMemoryManager(memoryDir);
    }
    MCPOcsMemoryAdapter.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.memoryManager.initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MCPOcsMemoryAdapter.prototype.storeIncidentMemory = function (memory) {
        return __awaiter(this, void 0, void 0, function () {
            var mcpMemory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mcpMemory = {
                            sessionId: memory.sessionId,
                            timestamp: memory.timestamp,
                            userMessage: memory.userMessage,
                            assistantResponse: memory.assistantResponse,
                            context: memory.context,
                            tags: __spreadArray(__spreadArray([], memory.tags, true), [
                                "domain:".concat(memory.domain),
                                "environment:".concat(memory.environment),
                                "severity:".concat(memory.severity),
                                "resource:".concat(memory.resourceType || 'unknown')
                            ], false)
                        };
                        return [4 /*yield*/, this.memoryManager.storeConversation(mcpMemory)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MCPOcsMemoryAdapter.prototype.searchIncidents = function (query_1, domainFilter_1) {
        return __awaiter(this, arguments, void 0, function (query, domainFilter, limit) {
            var results;
            if (limit === void 0) { limit = 5; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.memoryManager.searchRelevantMemories(query, undefined, limit)];
                    case 1:
                        results = _a.sent();
                        if (domainFilter) {
                            return [2 /*return*/, results.filter(function (result) { var _a; return (_a = result.metadata.tags) === null || _a === void 0 ? void 0 : _a.includes("domain:".concat(domainFilter)); })];
                        }
                        return [2 /*return*/, results];
                }
            });
        });
    };
    MCPOcsMemoryAdapter.prototype.generateStructuredIncidentResponse = function (query, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var relevantMemories, relatedIncidents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.memoryManager.searchRelevantMemories(query, sessionId, 10)];
                    case 1:
                        relevantMemories = _a.sent();
                        relatedIncidents = relevantMemories.map(function (result) { return ({
                            sessionId: result.metadata.sessionId,
                            timestamp: result.metadata.timestamp,
                            summary: "User: ".concat(result.metadata.userMessage, "\nAssistant: ").concat(result.metadata.assistantResponse),
                            tags: result.metadata.tags,
                            distance: result.distance
                        }); });
                        return [2 /*return*/, {
                                summary: "Based on ".concat(relevantMemories.length, " similar incidents"),
                                relatedIncidents: relatedIncidents,
                                rootCauseAnalysis: this.generateRootCauseAnalysis(relevantMemories),
                                recommendations: this.extractRecommendations(relevantMemories),
                                severitySummary: this.classifyAggregateSeverity(relevantMemories)
                            }];
                }
            });
        });
    };
    MCPOcsMemoryAdapter.prototype.generateRootCauseAnalysis = function (memories) {
        var text = memories
            .map(function (m) { var _a, _b; return "".concat(((_a = m === null || m === void 0 ? void 0 : m.metadata) === null || _a === void 0 ? void 0 : _a.userMessage) || '', " ").concat(((_b = m === null || m === void 0 ? void 0 : m.metadata) === null || _b === void 0 ? void 0 : _b.assistantResponse) || ''); })
            .join(' ')
            .toLowerCase();
        if (text.includes('oom') || text.includes('out of memory')) {
            return 'Likely OOM conditions causing restarts; check limits/requests and memory leaks.';
        }
        if (text.includes('crashloop') || text.includes('crashloopbackoff')) {
            return 'Pod restart loop suggests startup/config issues or insufficient resources.';
        }
        if (text.includes('image') || text.includes('pull backoff')) {
            return 'Image pull/configuration problems; verify registry access and image references.';
        }
        if (text.includes('timeout') || text.includes('unreachable')) {
            return 'Network/API timeout symptoms; check service endpoints and cluster networking.';
        }
        if (text.includes('quota') || text.includes('limitexceeded')) {
            return 'Quota or limit exceeded; adjust namespace quotas or workload settings.';
        }
        return 'Common patterns suggest resource allocation or configuration issues.';
    };
    MCPOcsMemoryAdapter.prototype.extractRecommendations = function (memories) {
        var _a;
        var tags = new Set();
        for (var _i = 0, _b = memories; _i < _b.length; _i++) {
            var m = _b[_i];
            var mtags = this.normalizeTags((_a = m === null || m === void 0 ? void 0 : m.metadata) === null || _a === void 0 ? void 0 : _a.tags);
            mtags.forEach(function (t) { return tags.add(t); });
        }
        var recs = new Set();
        var hasOpenShift = Array.from(tags).some(function (t) { return t.startsWith('domain:openshift'); });
        var hasK8s = Array.from(tags).some(function (t) { return t.startsWith('domain:kubernetes'); });
        var hasPod = Array.from(tags).some(function (t) { return t.startsWith('resource:pod'); });
        if (hasOpenShift && hasPod) {
            recs.add('Check pod logs: oc logs -n <namespace> <pod>');
            recs.add('Describe the pod: oc describe pod -n <namespace> <pod>');
            recs.add('Inspect events: oc get events -A --sort-by=.lastTimestamp');
        }
        if (hasK8s && hasPod) {
            recs.add('Check pod logs: kubectl logs -n <namespace> <pod>');
            recs.add('Describe the pod: kubectl describe pod -n <namespace> <pod>');
            recs.add('Inspect events: kubectl get events -A --sort-by=.lastTimestamp');
        }
        recs.add('Verify resource limits/requests for affected workloads');
        recs.add('Review recent deployments/rollouts for regressions');
        recs.add('Check node health and capacity in the target cluster');
        return Array.from(recs);
    };
    MCPOcsMemoryAdapter.prototype.classifyAggregateSeverity = function (memories) {
        var _a;
        var order = ['low', 'medium', 'high', 'critical'];
        var maxIndex = 0;
        for (var _i = 0, _b = memories; _i < _b.length; _i++) {
            var m = _b[_i];
            var tags = this.normalizeTags((_a = m === null || m === void 0 ? void 0 : m.metadata) === null || _a === void 0 ? void 0 : _a.tags);
            for (var _c = 0, tags_1 = tags; _c < tags_1.length; _c++) {
                var t = tags_1[_c];
                if (t.startsWith('severity:')) {
                    var sev = t.split(':')[1];
                    var idx = sev ? order.indexOf(sev) : -1;
                    if (idx > maxIndex)
                        maxIndex = idx;
                }
            }
        }
        return order[maxIndex];
    };
    MCPOcsMemoryAdapter.prototype.normalizeTags = function (raw) {
        if (!raw)
            return [];
        if (Array.isArray(raw))
            return raw.filter(function (t) { return typeof t === 'string'; });
        if (typeof raw === 'string')
            return raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        return [];
    };
    MCPOcsMemoryAdapter.prototype.isMemoryAvailable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.memoryManager.isAvailable()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return MCPOcsMemoryAdapter;
}());
exports.MCPOcsMemoryAdapter = MCPOcsMemoryAdapter;

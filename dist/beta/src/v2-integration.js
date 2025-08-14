"use strict";
/**
 * MCP-OCS v2.0 Tool Integration
 *
 * Integrates the new check_namespace_health tool with the existing MCP server
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
exports.checkNamespaceHealthV2Tool = void 0;
exports.checkNamespaceHealthV2 = checkNamespaceHealthV2;
var index_js_1 = require("./v2/tools/check-namespace-health/index.js");
var oc_wrapper_v2_js_1 = require("./v2/lib/oc-wrapper-v2.js");
// Initialize v2 components
var ocWrapperV2 = new oc_wrapper_v2_js_1.OcWrapperV2();
var namespaceHealthChecker = new index_js_1.NamespaceHealthChecker(ocWrapperV2);
/**
 * V2 Tool: check_namespace_health
 *
 * Comprehensive namespace health analysis with:
 * - Pod status analysis (crashloops, image pull errors, OOM kills)
 * - PVC binding validation
 * - Route/Ingress connectivity testing
 * - Event correlation and pattern detection
 * - Intelligent suspicion generation
 */
function checkNamespaceHealthV2(args) {
    return __awaiter(this, void 0, void 0, function () {
        var namespace, _a, includeIngressTest, sessionId, healthResult, response, error_1, errorResponse;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    namespace = args.namespace, _a = args.includeIngressTest, includeIngressTest = _a === void 0 ? false : _a, sessionId = args.sessionId;
                    // Input validation
                    if (!namespace || typeof namespace !== 'string') {
                        throw new Error('namespace parameter is required and must be a string');
                    }
                    return [4 /*yield*/, namespaceHealthChecker.checkHealth({
                            namespace: namespace,
                            includeIngressTest: includeIngressTest,
                            maxLogLinesPerPod: args.maxLogLinesPerPod || 0
                        })];
                case 1:
                    healthResult = _b.sent();
                    response = {
                        tool: 'check_namespace_health_v2',
                        sessionId: sessionId,
                        timestamp: healthResult.timestamp,
                        duration: "".concat(healthResult.duration, "ms"),
                        // Core health data
                        namespace: healthResult.namespace,
                        status: healthResult.status,
                        // Detailed findings
                        summary: {
                            pods: "".concat(healthResult.checks.pods.ready, "/").concat(healthResult.checks.pods.total, " ready"),
                            pvcs: "".concat(healthResult.checks.pvcs.bound, "/").concat(healthResult.checks.pvcs.total, " bound"),
                            routes: "".concat(healthResult.checks.routes.total, " configured"),
                            criticalEvents: healthResult.checks.events.length
                        },
                        // Issues identified
                        issues: {
                            crashLoopPods: healthResult.checks.pods.crashloops,
                            imagePullErrors: healthResult.checks.pods.imagePullErrors,
                            pendingPods: healthResult.checks.pods.pending,
                            oomKilledPods: healthResult.checks.pods.oomKilled,
                            pvcErrors: healthResult.checks.pvcs.errors,
                            recentEvents: healthResult.checks.events.slice(0, 5)
                        },
                        // AI-generated suspicions
                        suspicions: healthResult.suspicions,
                        // Route connectivity (if tested)
                        connectivity: healthResult.checks.routes.probe ? {
                            tested: true,
                            url: healthResult.checks.routes.probe.url,
                            status: healthResult.checks.routes.probe.code,
                            reachable: healthResult.checks.routes.reachable
                        } : { tested: false },
                        // Human readable summary
                        human: healthResult.human,
                        // Next actions (generated based on issues found)
                        nextActions: generateNextActions(healthResult),
                        // Performance metrics
                        performance: {
                            responseTime: "".concat(healthResult.duration, "ms"),
                            cacheStats: ocWrapperV2.getCacheStats()
                        }
                    };
                    return [2 /*return*/, JSON.stringify(response, null, 2)];
                case 2:
                    error_1 = _b.sent();
                    errorResponse = {
                        tool: 'check_namespace_health_v2',
                        sessionId: args.sessionId,
                        timestamp: new Date().toISOString(),
                        error: true,
                        message: error_1 instanceof Error ? error_1.message : 'Unknown error occurred',
                        namespace: args.namespace,
                        human: "Failed to check health of namespace ".concat(args.namespace, ": ").concat(error_1 instanceof Error ? error_1.message : 'Unknown error')
                    };
                    return [2 /*return*/, JSON.stringify(errorResponse, null, 2)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate actionable next steps based on health check results
 */
function generateNextActions(healthResult) {
    var actions = [];
    // Pod-related actions
    if (healthResult.checks.pods.crashloops.length > 0) {
        actions.push("Check logs for crashloop pods: oc logs ".concat(healthResult.checks.pods.crashloops[0], " -n ").concat(healthResult.namespace, " --previous"));
    }
    if (healthResult.checks.pods.imagePullErrors.length > 0) {
        actions.push("Verify image and registry access: oc describe pod ".concat(healthResult.checks.pods.imagePullErrors[0], " -n ").concat(healthResult.namespace));
    }
    if (healthResult.checks.pods.pending.length > 0) {
        actions.push("Check pod scheduling: oc describe pod ".concat(healthResult.checks.pods.pending[0], " -n ").concat(healthResult.namespace));
    }
    // PVC-related actions
    if (healthResult.checks.pvcs.pending > 0) {
        actions.push("Check PVC status: oc get pvc -n ".concat(healthResult.namespace));
        actions.push("Verify storage class: oc get sc");
    }
    // Route-related actions
    if (healthResult.checks.routes.probe && healthResult.checks.routes.probe.code >= 400) {
        actions.push("Check service endpoints: oc get endpoints -n ".concat(healthResult.namespace));
        actions.push("Test pod readiness: oc get pods -n ".concat(healthResult.namespace, " -o wide"));
    }
    // Event investigation
    if (healthResult.checks.events.length > 0) {
        actions.push("Review recent events: oc get events -n ".concat(healthResult.namespace, " --sort-by=.lastTimestamp"));
    }
    // Default action if no specific issues
    if (actions.length === 0 && healthResult.status !== 'healthy') {
        actions.push("Run detailed diagnostics: oc describe namespace ".concat(healthResult.namespace));
    }
    return actions.slice(0, 5); // Limit to top 5 actions
}
// Export for integration with existing tool registry
exports.checkNamespaceHealthV2Tool = {
    name: 'check_namespace_health_v2',
    description: 'V2: Comprehensive namespace health analysis with pod status, PVC binding, route testing, and intelligent issue detection',
    inputSchema: {
        type: 'object',
        properties: {
            sessionId: { type: 'string' },
            namespace: { type: 'string' },
            includeIngressTest: { type: 'boolean', default: false },
            maxLogLinesPerPod: { type: 'number', default: 0 }
        },
        required: ['sessionId', 'namespace']
    },
    handler: checkNamespaceHealthV2
};

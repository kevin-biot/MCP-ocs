"use strict";
/**
 * Namespace Health Checker v2.0
 *
 * Comprehensive health analysis based on CLI mapping patterns:
 * - Pod status analysis (running, crashloop, pending)
 * - PVC binding validation
 * - Event correlation and pattern detection
 * - Route/Ingress connectivity testing
 * - Intelligent suspicion generation
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
exports.NamespaceHealthChecker = void 0;
var NamespaceHealthChecker = /** @class */ (function () {
    function NamespaceHealthChecker(ocWrapper) {
        this.ocWrapper = ocWrapper;
    }
    /**
     * Analyze scale-down patterns to distinguish from application failures
     */
    NamespaceHealthChecker.prototype.analyzeScaleDownPatterns = function (deploymentsData, eventsData, podHealth) {
        var _a, _b;
        var deployments = deploymentsData.items || [];
        var events = eventsData.items || [];
        var analysis = {
            isScaleDown: false,
            evidence: [],
            deploymentStatus: {
                total: deployments.length,
                scaledToZero: 0,
                recentlyScaled: []
            },
            scaleDownEvents: [],
            verdict: 'unknown'
        };
        // Analyze deployment replica status
        for (var _i = 0, deployments_1 = deployments; _i < deployments_1.length; _i++) {
            var deployment = deployments_1[_i];
            var name_1 = deployment.metadata.name;
            var spec = deployment.spec || {};
            var status_1 = deployment.status || {};
            var desiredReplicas = spec.replicas || 0;
            var availableReplicas = status_1.availableReplicas || 0;
            var readyReplicas = status_1.readyReplicas || 0;
            if (desiredReplicas === 0) {
                analysis.deploymentStatus.scaledToZero++;
                analysis.evidence.push("Deployment ".concat(name_1, " intentionally scaled to 0 replicas"));
            }
            // Check for recent scaling activity
            var lastUpdateTime = new Date(deployment.metadata.resourceVersion || 0).getTime();
            var recentThreshold = Date.now() - (2 * 60 * 60 * 1000); // Last 2 hours
            if (lastUpdateTime > recentThreshold && desiredReplicas !== availableReplicas) {
                analysis.deploymentStatus.recentlyScaled.push(name_1);
                analysis.evidence.push("Deployment ".concat(name_1, " recently modified (desired: ").concat(desiredReplicas, ", available: ").concat(availableReplicas, ")"));
            }
        }
        // Analyze events for scale-down indicators
        var recentEvents = events.filter(function (event) {
            var eventTime = new Date(event.lastTimestamp || event.eventTime).getTime();
            var cutoff = Date.now() - (60 * 60 * 1000); // Last hour
            return eventTime > cutoff;
        });
        for (var _c = 0, recentEvents_1 = recentEvents; _c < recentEvents_1.length; _c++) {
            var event_1 = recentEvents_1[_c];
            var reason = event_1.reason;
            var message = event_1.message;
            var objectKind = (_a = event_1.involvedObject) === null || _a === void 0 ? void 0 : _a.kind;
            var objectName = (_b = event_1.involvedObject) === null || _b === void 0 ? void 0 : _b.name;
            // Look for scale-down related events
            if (reason === 'ScalingReplicaSet' && message.includes('scaled down')) {
                analysis.scaleDownEvents.push("".concat(objectKind, "/").concat(objectName, ": ").concat(message));
                analysis.evidence.push("Scale-down event detected: ".concat(message));
            }
            if (reason === 'Killing' && objectKind === 'Pod') {
                analysis.scaleDownEvents.push("Pod termination: ".concat(objectName));
                analysis.evidence.push("Pod ".concat(objectName, " was terminated"));
            }
            // Node-related events that might indicate node scaling
            if (reason.includes('NodeNotReady') || reason.includes('NodeUnavailable')) {
                analysis.evidence.push("Node issue detected: ".concat(message));
            }
        }
        // Determine if this is a scale-down scenario
        analysis.isScaleDown = analysis.deploymentStatus.scaledToZero > 0 || analysis.scaleDownEvents.length > 0;
        // Determine the verdict based on evidence
        if (analysis.deploymentStatus.scaledToZero > 0 && analysis.scaleDownEvents.length > 0) {
            analysis.verdict = 'intentional_scale_down';
        }
        else if (analysis.evidence.some(function (e) { return e.includes('NodeNotReady') || e.includes('NodeUnavailable'); })) {
            analysis.verdict = 'node_failure';
        }
        else if (podHealth.total === 0 && analysis.deploymentStatus.total === 0) {
            analysis.verdict = 'resource_pressure';
        }
        else if (podHealth.total === 0 && analysis.deploymentStatus.total > 0) {
            analysis.verdict = 'application_failure';
        }
        return analysis;
    };
    /**
     * Perform comprehensive namespace health check with scale-down detection
     */
    NamespaceHealthChecker.prototype.checkHealth = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, namespace, _a, includeIngressTest, namespaceExists, _b, podsData, eventsData, pvcsData, routesData, deploymentsData, podHealth, pvcHealth, routeHealth, criticalEvents, scaleDownAnalysis, suspicions, status_2, human, result, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = Date.now();
                        namespace = input.namespace, _a = input.includeIngressTest, includeIngressTest = _a === void 0 ? false : _a;
                        return [4 /*yield*/, this.ocWrapper.validateNamespaceExists(namespace)];
                    case 1:
                        namespaceExists = _c.sent();
                        if (!namespaceExists) {
                            return [2 /*return*/, this.createFailureResult(namespace, 'Namespace does not exist or is not accessible', startTime)];
                        }
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, Promise.all([
                                this.ocWrapper.getPods(namespace),
                                this.ocWrapper.getEvents(namespace),
                                this.ocWrapper.getPVCs(namespace),
                                this.ocWrapper.getRoutes(namespace),
                                this.ocWrapper.getDeployments(namespace) // Add deployments for scale-down detection
                            ])];
                    case 3:
                        _b = _c.sent(), podsData = _b[0], eventsData = _b[1], pvcsData = _b[2], routesData = _b[3], deploymentsData = _b[4];
                        podHealth = this.analyzePods(podsData);
                        pvcHealth = this.analyzePVCs(pvcsData);
                        return [4 /*yield*/, this.analyzeRoutes(routesData, includeIngressTest)];
                    case 4:
                        routeHealth = _c.sent();
                        criticalEvents = this.analyzeCriticalEvents(eventsData);
                        scaleDownAnalysis = this.analyzeScaleDownPatterns(deploymentsData, eventsData, podHealth);
                        suspicions = this.generateSuspicions(podHealth, pvcHealth, routeHealth, criticalEvents, scaleDownAnalysis);
                        status_2 = this.determineOverallStatus(podHealth, pvcHealth, routeHealth, criticalEvents, scaleDownAnalysis);
                        human = this.generateHumanSummary(namespace, status_2, podHealth, pvcHealth, routeHealth, suspicions, scaleDownAnalysis);
                        result = {
                            namespace: namespace,
                            status: status_2,
                            checks: {
                                pods: podHealth,
                                pvcs: pvcHealth,
                                routes: routeHealth,
                                events: criticalEvents
                            },
                            suspicions: suspicions,
                            human: human,
                            timestamp: new Date().toISOString(),
                            duration: Date.now() - startTime
                        };
                        return [2 /*return*/, result];
                    case 5:
                        error_1 = _c.sent();
                        return [2 /*return*/, this.createFailureResult(namespace, "Health check failed: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'), startTime)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyze pod health using CLI mapping patterns
     */
    NamespaceHealthChecker.prototype.analyzePods = function (podsData) {
        var _a, _b;
        var pods = podsData.items || [];
        var summary = {
            ready: 0,
            total: pods.length,
            crashloops: [],
            pending: [],
            imagePullErrors: [],
            oomKilled: []
        };
        for (var _i = 0, pods_1 = pods; _i < pods_1.length; _i++) {
            var pod = pods_1[_i];
            var podName = pod.metadata.name;
            var phase = pod.status.phase;
            var containerStatuses = pod.status.containerStatuses || [];
            // Check if pod is ready
            var isReady = containerStatuses.every(function (container) { return container.ready === true; });
            if (isReady && phase === 'Running') {
                summary.ready++;
            }
            // Analyze container states for issues
            for (var _c = 0, containerStatuses_1 = containerStatuses; _c < containerStatuses_1.length; _c++) {
                var container = containerStatuses_1[_c];
                var waitingState = (_a = container.state) === null || _a === void 0 ? void 0 : _a.waiting;
                var terminatedState = (_b = container.state) === null || _b === void 0 ? void 0 : _b.terminated;
                if (waitingState) {
                    var reason = waitingState.reason;
                    switch (reason) {
                        case 'CrashLoopBackOff':
                            summary.crashloops.push(podName);
                            break;
                        case 'ImagePullBackOff':
                        case 'ErrImagePull':
                            summary.imagePullErrors.push(podName);
                            break;
                        case 'ContainerCreating':
                        case 'PodInitializing':
                            if (this.isPodStuckCreating(pod)) {
                                summary.pending.push(podName);
                            }
                            break;
                    }
                }
                if ((terminatedState === null || terminatedState === void 0 ? void 0 : terminatedState.reason) === 'OOMKilled') {
                    summary.oomKilled.push(podName);
                }
                // Check restart count for frequent restarts
                if (container.restartCount > 5) {
                    if (!summary.crashloops.includes(podName)) {
                        summary.crashloops.push(podName);
                    }
                }
            }
            // Check for pending pods
            if (phase === 'Pending') {
                summary.pending.push(podName);
            }
        }
        return summary;
    };
    /**
     * Analyze PVC health and binding status
     */
    NamespaceHealthChecker.prototype.analyzePVCs = function (pvcsData) {
        var _a;
        var pvcs = pvcsData.items || [];
        var summary = {
            bound: 0,
            pending: 0,
            failed: 0,
            total: pvcs.length,
            errors: []
        };
        for (var _i = 0, pvcs_1 = pvcs; _i < pvcs_1.length; _i++) {
            var pvc = pvcs_1[_i];
            var name_2 = pvc.metadata.name;
            var phase = (_a = pvc.status) === null || _a === void 0 ? void 0 : _a.phase;
            switch (phase) {
                case 'Bound':
                    summary.bound++;
                    break;
                case 'Pending':
                    summary.pending++;
                    summary.errors.push("pvc/".concat(name_2, " pending (").concat(this.getPVCPendingReason(pvc), ")"));
                    break;
                case 'Failed':
                    summary.failed++;
                    summary.errors.push("pvc/".concat(name_2, " failed"));
                    break;
                default:
                    summary.errors.push("pvc/".concat(name_2, " unknown status: ").concat(phase));
            }
        }
        return summary;
    };
    /**
     * Analyze routes and optionally test connectivity
     */
    NamespaceHealthChecker.prototype.analyzeRoutes = function (routesData, includeConnectivityTest) {
        return __awaiter(this, void 0, void 0, function () {
            var routes, summary, firstRoute, host, testUrl, _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        routes = routesData.items || [];
                        summary = {
                            total: routes.length
                        };
                        if (!(includeConnectivityTest && routes.length > 0)) return [3 /*break*/, 2];
                        firstRoute = routes[0];
                        host = (_b = firstRoute.spec) === null || _b === void 0 ? void 0 : _b.host;
                        if (!host) return [3 /*break*/, 2];
                        testUrl = "https://".concat(host);
                        _a = summary;
                        return [4 /*yield*/, this.testRouteConnectivity(testUrl)];
                    case 1:
                        _a.probe = _c.sent();
                        summary.reachable = summary.probe.code < 500;
                        _c.label = 2;
                    case 2: return [2 /*return*/, summary];
                }
            });
        });
    };
    /**
     * Extract critical events for correlation
     */
    NamespaceHealthChecker.prototype.analyzeCriticalEvents = function (eventsData) {
        var _a, _b;
        var events = eventsData.items || [];
        var criticalEvents = [];
        // Focus on recent warning/error events
        var cutoffTime = Date.now() - (10 * 60 * 1000); // Last 10 minutes
        for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
            var event_2 = events_1[_i];
            if (event_2.type !== 'Normal') {
                var eventTime = new Date(event_2.lastTimestamp || event_2.eventTime).getTime();
                if (eventTime > cutoffTime) {
                    var reason = event_2.reason;
                    var message = event_2.message;
                    var objectKind = (_a = event_2.involvedObject) === null || _a === void 0 ? void 0 : _a.kind;
                    var objectName = (_b = event_2.involvedObject) === null || _b === void 0 ? void 0 : _b.name;
                    criticalEvents.push("".concat(reason, ": ").concat(objectKind, "/").concat(objectName, " - ").concat(message));
                }
            }
        }
        return criticalEvents.slice(0, 10); // Limit to most recent 10
    };
    /**
     * Generate intelligent suspicions based on patterns (including scale-down detection)
     */
    NamespaceHealthChecker.prototype.generateSuspicions = function (pods, pvcs, routes, events, scaleDownAnalysis) {
        var suspicions = [];
        // Pod-related suspicions
        if (pods.crashloops.length > 0) {
            suspicions.push("".concat(pods.crashloops.length, " pod(s) in CrashLoopBackOff - check logs and resource limits"));
        }
        if (pods.imagePullErrors.length > 0) {
            suspicions.push('Image pull failures detected - verify registry access and image names');
        }
        if (pods.oomKilled.length > 0) {
            suspicions.push('OOM kills detected - increase memory limits or optimize application memory usage');
        }
        if (pods.pending.length > 0) {
            suspicions.push('Pods stuck in pending - check node resources and scheduling constraints');
        }
        // PVC-related suspicions
        if (pvcs.pending > 0) {
            var storageClassIssue = pvcs.errors.some(function (error) { return error.includes('no storageclass'); });
            if (storageClassIssue) {
                suspicions.push('Missing or invalid StorageClass - create default StorageClass or specify in PVC');
            }
            else {
                suspicions.push('PVC binding issues - check storage provisioner and available capacity');
            }
        }
        // Network-related suspicions
        if (routes.probe && routes.probe.code >= 500) {
            suspicions.push('Route backend not responding - check pod readiness and service endpoints');
        }
        // Scale-down pattern analysis (PRIORITY - check this first!)
        if (scaleDownAnalysis.isScaleDown) {
            switch (scaleDownAnalysis.verdict) {
                case 'intentional_scale_down':
                    suspicions.unshift("\uD83C\uDFAF SCALE-DOWN DETECTED: ".concat(scaleDownAnalysis.deploymentStatus.scaledToZero, " deployment(s) intentionally scaled to 0 - not an application failure"));
                    break;
                case 'node_failure':
                    suspicions.unshift('🔴 NODE FAILURE: Scale-down appears to be due to node availability issues');
                    break;
                case 'resource_pressure':
                    suspicions.unshift('⚠️ RESOURCE PRESSURE: Scale-down may be due to resource constraints');
                    break;
                default:
                    suspicions.unshift('📉 SCALE-DOWN: Detected scaling activity - verify if intentional');
            }
            // Add specific scale-down evidence
            if (scaleDownAnalysis.evidence.length > 0) {
                suspicions.push("Scale-down evidence: ".concat(scaleDownAnalysis.evidence.slice(0, 2).join('; ')));
            }
        }
        // Event pattern analysis
        var eventPatterns = this.analyzeEventPatterns(events);
        suspicions.push.apply(suspicions, eventPatterns);
        return suspicions;
    };
    /**
     * Determine overall health status (with scale-down awareness)
     */
    NamespaceHealthChecker.prototype.determineOverallStatus = function (pods, pvcs, routes, events, scaleDownAnalysis) {
        // Scale-down scenarios should not be considered "failing" if intentional
        if (scaleDownAnalysis.isScaleDown && scaleDownAnalysis.verdict === 'intentional_scale_down') {
            // Intentional scale-down is "degraded" not "failing"
            return 'degraded';
        }
        // Failing conditions
        if (pods.total === 0 && pvcs.total === 0) {
            // If this is a scale-down, it might be intentional
            if (scaleDownAnalysis.isScaleDown) {
                return 'degraded'; // Scale-down scenario
            }
            return 'failing'; // Empty namespace or severe issues
        }
        if (pods.ready === 0 && pods.total > 0) {
            // Check if this is due to scale-down
            if (scaleDownAnalysis.isScaleDown && scaleDownAnalysis.deploymentStatus.scaledToZero > 0) {
                return 'degraded'; // Intentional scale-down
            }
            return 'failing'; // No pods running
        }
        if (pvcs.failed > 0) {
            return 'failing'; // Failed storage
        }
        // Degraded conditions
        if (pods.crashloops.length > 0 || pods.imagePullErrors.length > 0) {
            return 'degraded'; // Application issues
        }
        if (pvcs.pending > 0) {
            return 'degraded'; // Storage issues
        }
        if (pods.ready < pods.total && pods.total > 0) {
            return 'degraded'; // Some pods not ready
        }
        if (routes.probe && routes.probe.code >= 400) {
            return 'degraded'; // Network issues
        }
        return 'healthy';
    };
    /**
     * Generate human-readable summary (with scale-down context)
     */
    NamespaceHealthChecker.prototype.generateHumanSummary = function (namespace, status, pods, pvcs, routes, suspicions, scaleDownAnalysis) {
        var parts = [];
        // Lead with scale-down context if detected
        if (scaleDownAnalysis.isScaleDown) {
            switch (scaleDownAnalysis.verdict) {
                case 'intentional_scale_down':
                    parts.push("Namespace ".concat(namespace, " appears to be intentionally scaled down (").concat(scaleDownAnalysis.deploymentStatus.scaledToZero, "/").concat(scaleDownAnalysis.deploymentStatus.total, " deployments at 0 replicas)."));
                    break;
                case 'node_failure':
                    parts.push("Namespace ".concat(namespace, " is ").concat(status, " due to apparent node failure."));
                    break;
                case 'resource_pressure':
                    parts.push("Namespace ".concat(namespace, " is ").concat(status, ", possibly due to resource pressure."));
                    break;
                default:
                    parts.push("Namespace ".concat(namespace, " is ").concat(status, " with scale-down activity detected."));
            }
        }
        else {
            parts.push("Namespace ".concat(namespace, " is ").concat(status, "."));
        }
        // Pod summary
        if (pods.total > 0) {
            parts.push("Pods: ".concat(pods.ready, "/").concat(pods.total, " ready."));
            if (pods.crashloops.length > 0) {
                parts.push("CrashLoopBackOff: ".concat(pods.crashloops.join(', '), "."));
            }
            if (pods.imagePullErrors.length > 0) {
                parts.push("Image pull issues: ".concat(pods.imagePullErrors.join(', '), "."));
            }
        }
        // PVC summary
        if (pvcs.total > 0) {
            parts.push("Storage: ".concat(pvcs.bound, "/").concat(pvcs.total, " PVCs bound."));
            if (pvcs.pending > 0) {
                parts.push("".concat(pvcs.pending, " PVC(s) pending."));
            }
        }
        // Route summary
        if (routes.total > 0) {
            parts.push("".concat(routes.total, " route(s) configured."));
            if (routes.probe) {
                parts.push("Route test: ".concat(routes.probe.code, " ").concat(routes.probe.message, "."));
            }
        }
        // Top suspicion
        if (suspicions.length > 0) {
            parts.push("Key issue: ".concat(suspicions[0]));
        }
        return parts.join(' ');
    };
    // Helper methods
    NamespaceHealthChecker.prototype.createFailureResult = function (namespace, error, startTime) {
        return {
            namespace: namespace,
            status: 'failing',
            checks: {
                pods: { ready: 0, total: 0, crashloops: [], pending: [], imagePullErrors: [], oomKilled: [] },
                pvcs: { bound: 0, pending: 0, failed: 0, total: 0, errors: [] },
                routes: { total: 0 },
                events: []
            },
            suspicions: [error],
            human: "Namespace ".concat(namespace, " health check failed: ").concat(error),
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime
        };
    };
    NamespaceHealthChecker.prototype.isPodStuckCreating = function (pod) {
        var creationTime = new Date(pod.metadata.creationTimestamp).getTime();
        var stuckThreshold = 5 * 60 * 1000; // 5 minutes
        return Date.now() - creationTime > stuckThreshold;
    };
    NamespaceHealthChecker.prototype.getPVCPendingReason = function (pvc) {
        var _a;
        var events = ((_a = pvc.status) === null || _a === void 0 ? void 0 : _a.conditions) || [];
        for (var _i = 0, events_2 = events; _i < events_2.length; _i++) {
            var condition = events_2[_i];
            if (condition.type === 'Pending') {
                return condition.reason || 'unknown reason';
            }
        }
        return 'no storageclass or provisioner unavailable';
    };
    NamespaceHealthChecker.prototype.testRouteConnectivity = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var https_1, http_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('https'); })];
                    case 1:
                        https_1 = _a.sent();
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('http'); })];
                    case 2:
                        http_1 = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve) {
                                var isHttps = url.startsWith('https');
                                var client = isHttps ? https_1 : http_1;
                                var req = client.request(url, { method: 'HEAD', timeout: 5000 }, function (res) {
                                    resolve({
                                        url: url,
                                        code: res.statusCode || 0,
                                        message: res.statusMessage || 'OK'
                                    });
                                });
                                req.on('error', function (error) {
                                    resolve({
                                        url: url,
                                        code: 0,
                                        message: error.message
                                    });
                                });
                                req.on('timeout', function () {
                                    req.destroy();
                                    resolve({
                                        url: url,
                                        code: 0,
                                        message: 'Connection timeout'
                                    });
                                });
                                req.end();
                            })];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, {
                                url: url,
                                code: 0,
                                message: error_2 instanceof Error ? error_2.message : 'Connection failed'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    NamespaceHealthChecker.prototype.analyzeEventPatterns = function (events) {
        var patterns = [];
        // Common error patterns
        var imagePullPattern = events.filter(function (e) { return e.includes('ImagePull') || e.includes('ErrImagePull'); });
        if (imagePullPattern.length > 2) {
            patterns.push('Frequent image pull failures - check registry connectivity');
        }
        var mountPattern = events.filter(function (e) { return e.includes('FailedMount') || e.includes('MountVolume'); });
        if (mountPattern.length > 0) {
            patterns.push('Volume mount issues detected - verify PVC and storage configuration');
        }
        var schedulingPattern = events.filter(function (e) { return e.includes('FailedScheduling'); });
        if (schedulingPattern.length > 0) {
            patterns.push('Pod scheduling failures - check node capacity and constraints');
        }
        return patterns;
    };
    return NamespaceHealthChecker;
}());
exports.NamespaceHealthChecker = NamespaceHealthChecker;

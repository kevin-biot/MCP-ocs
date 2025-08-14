"use strict";
/**
 * RCA Checklist Tool v2.0
 *
 * Guided "First 10 Minutes" diagnostic workflow for consistent incident response.
 * Eliminates junior engineer panic and provides structured troubleshooting approach.
 *
 * Based on real operational patterns:
 * 1. Quick cluster health overview
 * 2. Namespace-specific pod/event analysis
 * 3. Resource constraint and quota checks
 * 4. Network and connectivity validation
 * 5. Storage and PVC analysis
 * 6. Generate structured findings and next steps
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
exports.RCAChecklistEngine = void 0;
var index_1 = require("../check-namespace-health/index");
var RCAChecklistEngine = /** @class */ (function () {
    function RCAChecklistEngine(ocWrapper) {
        this.ocWrapper = ocWrapper;
        this.namespaceHealthChecker = new index_1.NamespaceHealthChecker(ocWrapper);
    }
    /**
     * Execute the complete RCA checklist
     */
    RCAChecklistEngine.prototype.executeRCAChecklist = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, reportId, namespace, _a, outputFormat, _b, includeDeepAnalysis, _c, maxCheckTime, result, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        startTime = Date.now();
                        reportId = "rca-".concat(Date.now());
                        namespace = input.namespace, _a = input.outputFormat, outputFormat = _a === void 0 ? 'json' : _a, _b = input.includeDeepAnalysis, includeDeepAnalysis = _b === void 0 ? false : _b, _c = input.maxCheckTime, maxCheckTime = _c === void 0 ? 60000 : _c;
                        result = {
                            reportId: reportId,
                            namespace: namespace,
                            timestamp: new Date().toISOString(),
                            duration: 0,
                            overallStatus: 'healthy',
                            checksPerformed: [],
                            summary: { totalChecks: 0, passed: 0, failed: 0, warnings: 0 },
                            criticalIssues: [],
                            nextActions: [],
                            evidence: { symptoms: [], affectedResources: [], diagnosticSteps: [] },
                            human: ''
                        };
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        // Execute checklist with timeout protection
                        return [4 /*yield*/, Promise.race([
                                this.runChecklist(result, namespace, includeDeepAnalysis),
                                this.timeoutPromise(maxCheckTime)
                            ])];
                    case 2:
                        // Execute checklist with timeout protection
                        _d.sent();
                        // Analyze results and generate summary
                        this.analyzeChecklistResults(result);
                        this.generateNextActions(result);
                        this.generateHumanSummary(result);
                        if (outputFormat === 'markdown') {
                            result.markdown = this.generateMarkdownReport(result);
                        }
                        result.duration = Date.now() - startTime;
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _d.sent();
                        result.duration = Date.now() - startTime;
                        result.overallStatus = 'failing';
                        result.criticalIssues.push("RCA checklist failed: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                        result.human = "RCA checklist failed after ".concat(result.duration, "ms: ").concat(error_1 instanceof Error ? error_1.message : 'Unknown error');
                        return [2 /*return*/, result];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute the systematic diagnostic checklist
     */
    RCAChecklistEngine.prototype.runChecklist = function (result_1, namespace_1) {
        return __awaiter(this, arguments, void 0, function (result, namespace, deepAnalysis) {
            if (deepAnalysis === void 0) { deepAnalysis = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Check 1: Cluster-level health overview
                    return [4 /*yield*/, this.checkClusterHealth(result)];
                    case 1:
                        // Check 1: Cluster-level health overview
                        _a.sent();
                        // Check 2: Node capacity and health
                        return [4 /*yield*/, this.checkNodeHealth(result)];
                    case 2:
                        // Check 2: Node capacity and health
                        _a.sent();
                        if (!namespace) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.checkNamespaceSpecific(result, namespace, deepAnalysis)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.checkCriticalNamespaces(result)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: 
                    // Check 4: Storage and PVC health
                    return [4 /*yield*/, this.checkStorageHealth(result, namespace)];
                    case 7:
                        // Check 4: Storage and PVC health
                        _a.sent();
                        // Check 5: Network connectivity patterns
                        return [4 /*yield*/, this.checkNetworkHealth(result, namespace)];
                    case 8:
                        // Check 5: Network connectivity patterns
                        _a.sent();
                        // Check 6: Recent events and alerts
                        return [4 /*yield*/, this.checkRecentEvents(result, namespace)];
                    case 9:
                        // Check 6: Recent events and alerts
                        _a.sent();
                        if (!deepAnalysis) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.checkResourceConstraints(result, namespace)];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check 1: Cluster-level health overview
     */
    RCAChecklistEngine.prototype.checkClusterHealth = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            var checkName, startTime, clusterResult, versionResult, versionData, clusterVersion, check, error_2, check;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        checkName = 'Cluster Health Overview';
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.ocWrapper.executeOc(['cluster-info'], { timeout: 5000 })];
                    case 2:
                        clusterResult = _b.sent();
                        return [4 /*yield*/, this.ocWrapper.executeOc(['version', '-o', 'json'], { timeout: 5000 })];
                    case 3:
                        versionResult = _b.sent();
                        versionData = JSON.parse(versionResult.stdout);
                        clusterVersion = versionData.openshiftVersion || ((_a = versionData.serverVersion) === null || _a === void 0 ? void 0 : _a.gitVersion) || 'unknown';
                        check = {
                            name: checkName,
                            status: 'pass',
                            findings: [
                                "Cluster accessible and responding",
                                "OpenShift version: ".concat(clusterVersion),
                                "API server reachable"
                            ],
                            recommendations: [],
                            duration: Date.now() - startTime,
                            severity: 'low'
                        };
                        result.checksPerformed.push(check);
                        result.evidence.diagnosticSteps.push('Cluster connectivity verified');
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _b.sent();
                        check = {
                            name: checkName,
                            status: 'fail',
                            findings: ["Cluster connection failed: ".concat(error_2 instanceof Error ? error_2.message : 'Unknown error')],
                            recommendations: ['Check cluster connectivity and authentication', 'Verify KUBECONFIG settings'],
                            duration: Date.now() - startTime,
                            severity: 'critical'
                        };
                        result.checksPerformed.push(check);
                        result.evidence.symptoms.push('Cluster connectivity issues');
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check 2: Node capacity and health
     */
    RCAChecklistEngine.prototype.checkNodeHealth = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            var checkName, startTime, nodesResult, nodes, nodeAnalysis, check, error_3, check;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        checkName = 'Node Health and Capacity';
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.ocWrapper.executeOc(['get', 'nodes', '-o', 'json'], { timeout: 10000 })];
                    case 2:
                        nodesResult = _b.sent();
                        nodes = JSON.parse(nodesResult.stdout);
                        nodeAnalysis = this.analyzeNodeHealth(nodes);
                        check = {
                            name: checkName,
                            status: nodeAnalysis.readyNodes === nodeAnalysis.totalNodes ? 'pass' : 'fail',
                            findings: __spreadArray([
                                "Nodes: ".concat(nodeAnalysis.readyNodes, "/").concat(nodeAnalysis.totalNodes, " ready")
                            ], nodeAnalysis.issues, true),
                            recommendations: nodeAnalysis.issues.length > 0 ? [
                                'Check node conditions: oc describe node <node-name>',
                                'Verify node resource availability'
                            ] : [],
                            duration: Date.now() - startTime,
                            severity: nodeAnalysis.issues.length > 0 ? 'high' : 'low'
                        };
                        result.checksPerformed.push(check);
                        if (nodeAnalysis.issues.length > 0) {
                            result.evidence.symptoms.push('Node health issues detected');
                            (_a = result.evidence.affectedResources).push.apply(_a, nodeAnalysis.affectedNodes.map(function (n) { return "node/".concat(n); }));
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _b.sent();
                        check = {
                            name: checkName,
                            status: 'fail',
                            findings: ["Node health check failed: ".concat(error_3 instanceof Error ? error_3.message : 'Unknown error')],
                            recommendations: ['Verify cluster access permissions for node information'],
                            duration: Date.now() - startTime,
                            severity: 'high'
                        };
                        result.checksPerformed.push(check);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check 3: Namespace-specific analysis
     */
    RCAChecklistEngine.prototype.checkNamespaceSpecific = function (result, namespace, deepAnalysis) {
        return __awaiter(this, void 0, void 0, function () {
            var checkName, startTime, healthResult, check, error_4, check;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        checkName = "Namespace Health: ".concat(namespace);
                        startTime = Date.now();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.namespaceHealthChecker.checkHealth({
                                namespace: namespace,
                                includeIngressTest: true,
                                maxLogLinesPerPod: deepAnalysis ? 20 : 0
                            })];
                    case 2:
                        healthResult = _c.sent();
                        check = {
                            name: checkName,
                            status: healthResult.status === 'healthy' ? 'pass' :
                                healthResult.status === 'degraded' ? 'warning' : 'fail',
                            findings: __spreadArray([
                                "Namespace status: ".concat(healthResult.status),
                                "Pods: ".concat(healthResult.checks.pods.ready, "/").concat(healthResult.checks.pods.total, " ready"),
                                "PVCs: ".concat(healthResult.checks.pvcs.bound, "/").concat(healthResult.checks.pvcs.total, " bound"),
                                "Routes: ".concat(healthResult.checks.routes.total, " configured")
                            ], healthResult.suspicions.slice(0, 3), true),
                            recommendations: healthResult.suspicions.length > 0 ? [
                                'Review namespace-specific issues identified above',
                                'Check pod logs for crashloop pods',
                                'Verify PVC and storage configuration'
                            ] : [],
                            duration: Date.now() - startTime,
                            severity: healthResult.status === 'failing' ? 'critical' :
                                healthResult.status === 'degraded' ? 'medium' : 'low'
                        };
                        result.checksPerformed.push(check);
                        // Add evidence from namespace analysis
                        (_a = result.evidence.symptoms).push.apply(_a, healthResult.suspicions);
                        result.evidence.affectedResources.push("namespace/".concat(namespace));
                        if (healthResult.checks.pods.crashloops.length > 0) {
                            (_b = result.evidence.affectedResources).push.apply(_b, healthResult.checks.pods.crashloops.map(function (p) { return "pod/".concat(p); }));
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _c.sent();
                        check = {
                            name: checkName,
                            status: 'fail',
                            findings: ["Namespace analysis failed: ".concat(error_4 instanceof Error ? error_4.message : 'Unknown error')],
                            recommendations: ['Verify namespace exists and is accessible'],
                            duration: Date.now() - startTime,
                            severity: 'high'
                        };
                        result.checksPerformed.push(check);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check 4: Storage health analysis
     */
    RCAChecklistEngine.prototype.checkStorageHealth = function (result, namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var checkName, startTime, storageClassResult, storageClasses, defaultSC, pvcArgs, pvcResult, pvcs, pvcAnalysis, check, error_5, check;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkName = 'Storage and PVC Health';
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.ocWrapper.executeOc(['get', 'storageclass', '-o', 'json'], { timeout: 5000 })];
                    case 2:
                        storageClassResult = _a.sent();
                        storageClasses = JSON.parse(storageClassResult.stdout);
                        defaultSC = storageClasses.items.find(function (sc) { var _a; return ((_a = sc.metadata.annotations) === null || _a === void 0 ? void 0 : _a['storageclass.kubernetes.io/is-default-class']) === 'true'; });
                        pvcArgs = namespace ?
                            ['get', 'pvc', '-o', 'json'] :
                            ['get', 'pvc', '-A', '-o', 'json'];
                        return [4 /*yield*/, this.ocWrapper.executeOc(pvcArgs, namespace ? { namespace: namespace } : {})];
                    case 3:
                        pvcResult = _a.sent();
                        pvcs = JSON.parse(pvcResult.stdout);
                        pvcAnalysis = this.analyzePVCHealth(pvcs);
                        check = {
                            name: checkName,
                            status: pvcAnalysis.pendingPVCs === 0 ? 'pass' : 'warning',
                            findings: __spreadArray([
                                "Storage classes: ".concat(storageClasses.items.length, " available"),
                                "Default storage class: ".concat(defaultSC ? defaultSC.metadata.name : 'NONE (issue!)'),
                                "PVCs: ".concat(pvcAnalysis.boundPvc, "/").concat(pvcAnalysis.totalPVCs, " bound"),
                                "Pending PVCs: ".concat(pvcAnalysis.pendingPVCs)
                            ], pvcAnalysis.issues.slice(0, 3), true),
                            recommendations: pvcAnalysis.pendingPVCs > 0 ? [
                                'Check pending PVC details: oc describe pvc -A',
                                'Verify storage class configuration: oc get sc',
                                'Check storage provisioner status'
                            ] : [],
                            duration: Date.now() - startTime,
                            severity: pvcAnalysis.pendingPVCs > 0 ? 'medium' : 'low'
                        };
                        result.checksPerformed.push(check);
                        if (pvcAnalysis.pendingPVCs > 0) {
                            result.evidence.symptoms.push('Storage binding issues detected');
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        check = {
                            name: checkName,
                            status: 'fail',
                            findings: ["Storage health check failed: ".concat(error_5 instanceof Error ? error_5.message : 'Unknown error')],
                            recommendations: ['Check RBAC permissions for storage resources'],
                            duration: Date.now() - startTime,
                            severity: 'medium'
                        };
                        result.checksPerformed.push(check);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check 5: Network connectivity and service health
     */
    RCAChecklistEngine.prototype.checkNetworkHealth = function (result, namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var checkName, startTime, servicesArgs, servicesResult, services, routes, routesArgs, routesResult, _a, networkAnalysis, check, error_6, check;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        checkName = 'Network and Service Health';
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, , 8]);
                        servicesArgs = namespace ?
                            ['get', 'services', '-o', 'json'] :
                            ['get', 'services', '-A', '-o', 'json'];
                        return [4 /*yield*/, this.ocWrapper.executeOc(servicesArgs, namespace ? { namespace: namespace } : {})];
                    case 2:
                        servicesResult = _b.sent();
                        services = JSON.parse(servicesResult.stdout);
                        routes = { items: [] };
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        routesArgs = namespace ?
                            ['get', 'routes', '-o', 'json'] :
                            ['get', 'routes', '-A', '-o', 'json'];
                        return [4 /*yield*/, this.ocWrapper.executeOc(routesArgs, namespace ? { namespace: namespace } : {})];
                    case 4:
                        routesResult = _b.sent();
                        routes = JSON.parse(routesResult.stdout);
                        return [3 /*break*/, 6];
                    case 5:
                        _a = _b.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        networkAnalysis = this.analyzeNetworkHealth(services, routes);
                        check = {
                            name: checkName,
                            status: networkAnalysis.issues.length === 0 ? 'pass' : 'warning',
                            findings: __spreadArray([
                                "Services: ".concat(networkAnalysis.totalServices, " configured"),
                                "Routes: ".concat(networkAnalysis.totalRoutes, " configured"),
                                "Services without endpoints: ".concat(networkAnalysis.servicesWithoutEndpoints)
                            ], networkAnalysis.issues.slice(0, 3), true),
                            recommendations: networkAnalysis.issues.length > 0 ? [
                                'Check service endpoints: oc get endpoints',
                                'Verify pod readiness and labels',
                                'Test route connectivity if applicable'
                            ] : [],
                            duration: Date.now() - startTime,
                            severity: networkAnalysis.servicesWithoutEndpoints > 0 ? 'medium' : 'low'
                        };
                        result.checksPerformed.push(check);
                        if (networkAnalysis.issues.length > 0) {
                            result.evidence.symptoms.push('Network connectivity issues detected');
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        error_6 = _b.sent();
                        check = {
                            name: checkName,
                            status: 'fail',
                            findings: ["Network health check failed: ".concat(error_6 instanceof Error ? error_6.message : 'Unknown error')],
                            recommendations: ['Check network access and RBAC permissions'],
                            duration: Date.now() - startTime,
                            severity: 'medium'
                        };
                        result.checksPerformed.push(check);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check 6: Recent events analysis
     */
    RCAChecklistEngine.prototype.checkRecentEvents = function (result, namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var checkName, startTime, eventsArgs, eventsResult, events, eventAnalysis, check, error_7, check;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        checkName = 'Recent Events Analysis';
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        eventsArgs = namespace ?
                            ['get', 'events', '--field-selector=type!=Normal', '-o', 'json'] :
                            ['get', 'events', '-A', '--field-selector=type!=Normal', '-o', 'json'];
                        return [4 /*yield*/, this.ocWrapper.executeOc(eventsArgs, namespace ? { namespace: namespace } : {})];
                    case 2:
                        eventsResult = _b.sent();
                        events = JSON.parse(eventsResult.stdout);
                        eventAnalysis = this.analyzeRecentEvents(events);
                        check = {
                            name: checkName,
                            status: eventAnalysis.criticalEvents === 0 ? 'pass' : 'warning',
                            findings: __spreadArray([
                                "Recent events: ".concat(eventAnalysis.totalEvents, " warning/error events"),
                                "Critical events: ".concat(eventAnalysis.criticalEvents),
                                "Most common: ".concat(eventAnalysis.commonPatterns.slice(0, 3).join(', '))
                            ], eventAnalysis.topEvents.slice(0, 3), true),
                            recommendations: eventAnalysis.criticalEvents > 0 ? [
                                'Review recent critical events for patterns',
                                'Check involved objects for event clusters',
                                'Correlate events with pod/deployment changes'
                            ] : [],
                            duration: Date.now() - startTime,
                            severity: eventAnalysis.criticalEvents > 5 ? 'high' :
                                eventAnalysis.criticalEvents > 0 ? 'medium' : 'low'
                        };
                        result.checksPerformed.push(check);
                        if (eventAnalysis.criticalEvents > 0) {
                            (_a = result.evidence.symptoms).push.apply(_a, eventAnalysis.topEvents.slice(0, 2));
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _b.sent();
                        check = {
                            name: checkName,
                            status: 'fail',
                            findings: ["Events analysis failed: ".concat(error_7 instanceof Error ? error_7.message : 'Unknown error')],
                            recommendations: ['Check event access permissions'],
                            duration: Date.now() - startTime,
                            severity: 'low'
                        };
                        result.checksPerformed.push(check);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check critical system namespaces
     */
    RCAChecklistEngine.prototype.checkCriticalNamespaces = function (result) {
        return __awaiter(this, void 0, void 0, function () {
            var criticalNamespaces, _i, criticalNamespaces_1, ns, healthResult, check, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        criticalNamespaces = ['openshift-apiserver', 'openshift-etcd', 'openshift-kube-apiserver'];
                        _i = 0, criticalNamespaces_1 = criticalNamespaces;
                        _a.label = 1;
                    case 1:
                        if (!(_i < criticalNamespaces_1.length)) return [3 /*break*/, 6];
                        ns = criticalNamespaces_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.namespaceHealthChecker.checkHealth({ namespace: ns })];
                    case 3:
                        healthResult = _a.sent();
                        if (healthResult.status !== 'healthy') {
                            check = {
                                name: "Critical Namespace: ".concat(ns),
                                status: healthResult.status === 'degraded' ? 'warning' : 'fail',
                                findings: __spreadArray([
                                    "Status: ".concat(healthResult.status)
                                ], healthResult.suspicions.slice(0, 2), true),
                                recommendations: [
                                    "Check ".concat(ns, " pod status: oc get pods -n ").concat(ns),
                                    "Review ".concat(ns, " events: oc get events -n ").concat(ns)
                                ],
                                duration: 0,
                                severity: healthResult.status === 'failing' ? 'critical' : 'high'
                            };
                            result.checksPerformed.push(check);
                            result.evidence.symptoms.push("Critical namespace ".concat(ns, " is ").concat(healthResult.status));
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_8 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check 7: Resource constraints and quotas (deep analysis)
     */
    RCAChecklistEngine.prototype.checkResourceConstraints = function (result, namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var checkName, startTime, quotaArgs, quotaResult, quotas, limitsArgs, limitsResult, limits, resourceAnalysis, check, error_9, check;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkName = 'Resource Constraints and Quotas';
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        quotaArgs = namespace ?
                            ['get', 'resourcequota', '-o', 'json'] :
                            ['get', 'resourcequota', '-A', '-o', 'json'];
                        return [4 /*yield*/, this.ocWrapper.executeOc(quotaArgs, namespace ? { namespace: namespace } : {})];
                    case 2:
                        quotaResult = _a.sent();
                        quotas = JSON.parse(quotaResult.stdout);
                        limitsArgs = namespace ?
                            ['get', 'limitrange', '-o', 'json'] :
                            ['get', 'limitrange', '-A', '-o', 'json'];
                        return [4 /*yield*/, this.ocWrapper.executeOc(limitsArgs, namespace ? { namespace: namespace } : {})];
                    case 3:
                        limitsResult = _a.sent();
                        limits = JSON.parse(limitsResult.stdout);
                        resourceAnalysis = this.analyzeResourceConstraints(quotas, limits);
                        check = {
                            name: checkName,
                            status: resourceAnalysis.constraintsViolated === 0 ? 'pass' : 'warning',
                            findings: __spreadArray([
                                "Resource quotas: ".concat(resourceAnalysis.totalQuotas, " configured"),
                                "Limit ranges: ".concat(resourceAnalysis.totalLimits, " configured"),
                                "Quota violations: ".concat(resourceAnalysis.constraintsViolated)
                            ], resourceAnalysis.issues.slice(0, 3), true),
                            recommendations: resourceAnalysis.constraintsViolated > 0 ? [
                                'Review quota usage: oc describe quota',
                                'Check pod resource requests and limits',
                                'Consider adjusting resource quotas if needed'
                            ] : [],
                            duration: Date.now() - startTime,
                            severity: resourceAnalysis.constraintsViolated > 0 ? 'medium' : 'low'
                        };
                        result.checksPerformed.push(check);
                        if (resourceAnalysis.constraintsViolated > 0) {
                            result.evidence.symptoms.push('Resource quota constraints detected');
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_9 = _a.sent();
                        check = {
                            name: checkName,
                            status: 'fail',
                            findings: ["Resource constraints check failed: ".concat(error_9 instanceof Error ? error_9.message : 'Unknown error')],
                            recommendations: ['Check RBAC permissions for quota and limit resources'],
                            duration: Date.now() - startTime,
                            severity: 'low'
                        };
                        result.checksPerformed.push(check);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Analysis helper methods
    RCAChecklistEngine.prototype.analyzeNodeHealth = function (nodes) {
        var _a;
        var totalNodes = nodes.items.length;
        var readyNodes = 0;
        var issues = [];
        var affectedNodes = [];
        for (var _i = 0, _b = nodes.items; _i < _b.length; _i++) {
            var node = _b[_i];
            var conditions = ((_a = node.status) === null || _a === void 0 ? void 0 : _a.conditions) || [];
            var readyCondition = conditions.find(function (c) { return c.type === 'Ready'; });
            if ((readyCondition === null || readyCondition === void 0 ? void 0 : readyCondition.status) === 'True') {
                readyNodes++;
            }
            else {
                issues.push("Node ".concat(node.metadata.name, " not ready: ").concat((readyCondition === null || readyCondition === void 0 ? void 0 : readyCondition.reason) || 'Unknown'));
                affectedNodes.push(node.metadata.name);
            }
            // Check for other concerning conditions
            var concerningConditions = ['MemoryPressure', 'DiskPressure', 'PIDPressure'];
            var _loop_1 = function (condType) {
                var condition = conditions.find(function (c) { return c.type === condType; });
                if ((condition === null || condition === void 0 ? void 0 : condition.status) === 'True') {
                    issues.push("Node ".concat(node.metadata.name, " has ").concat(condType));
                    affectedNodes.push(node.metadata.name);
                }
            };
            for (var _c = 0, concerningConditions_1 = concerningConditions; _c < concerningConditions_1.length; _c++) {
                var condType = concerningConditions_1[_c];
                _loop_1(condType);
            }
        }
        return { totalNodes: totalNodes, readyNodes: readyNodes, issues: issues, affectedNodes: affectedNodes };
    };
    RCAChecklistEngine.prototype.analyzePVCHealth = function (pvcs) {
        var _a;
        var totalPVCs = pvcs.items.length;
        var boundPVCs = 0;
        var pendingPVCs = 0;
        var issues = [];
        for (var _i = 0, _b = pvcs.items; _i < _b.length; _i++) {
            var pvc = _b[_i];
            var name_1 = pvc.metadata.name;
            var phase = (_a = pvc.status) === null || _a === void 0 ? void 0 : _a.phase;
            switch (phase) {
                case 'Bound':
                    boundPVCs++;
                    break;
                case 'Pending':
                    pendingPVCs++;
                    issues.push("PVC ".concat(pvc.metadata.name, " pending in ").concat(pvc.metadata.namespace));
                    break;
                default:
                    issues.push("PVC ".concat(pvc.metadata.name, " in unknown state: ").concat(phase));
            }
        }
        return { totalPVCs: totalPVCs, boundPvc: boundPVCs, pendingPVCs: pendingPVCs, issues: issues };
    };
    RCAChecklistEngine.prototype.analyzeNetworkHealth = function (services, routes) {
        var totalServices = services.items.length;
        var totalRoutes = routes.items.length;
        var servicesWithoutEndpoints = 0;
        var issues = [];
        // Placeholder for endpoint analysis
        // Would need to check endpoints for each service
        return { totalServices: totalServices, totalRoutes: totalRoutes, servicesWithoutEndpoints: servicesWithoutEndpoints, issues: issues };
    };
    RCAChecklistEngine.prototype.analyzeRecentEvents = function (events) {
        var totalEvents = events.items.length;
        var criticalEvents = events.items.filter(function (e) {
            return e.type === 'Warning' &&
                ['Failed', 'Error', 'FailedMount', 'FailedScheduling'].some(function (reason) {
                    return e.reason.includes(reason);
                });
        }).length;
        var commonPatterns = this.extractEventPatterns(events.items);
        var topEvents = events.items.slice(0, 5).map(function (e) { var _a, _b; return "".concat(e.reason, ": ").concat((_a = e.involvedObject) === null || _a === void 0 ? void 0 : _a.kind, "/").concat((_b = e.involvedObject) === null || _b === void 0 ? void 0 : _b.name); });
        return { totalEvents: totalEvents, criticalEvents: criticalEvents, commonPatterns: commonPatterns, topEvents: topEvents };
    };
    RCAChecklistEngine.prototype.analyzeResourceConstraints = function (quotas, limits) {
        var totalQuotas = quotas.items.length;
        var totalLimits = limits.items.length;
        var constraintsViolated = 0;
        var issues = [];
        // Analyze quota utilization
        for (var _i = 0, _a = quotas.items; _i < _a.length; _i++) {
            var quota = _a[_i];
            var status_1 = quota.status;
            if ((status_1 === null || status_1 === void 0 ? void 0 : status_1.hard) && (status_1 === null || status_1 === void 0 ? void 0 : status_1.used)) {
                var quotaName = quota.metadata.name;
                var namespace = quota.metadata.namespace;
                for (var _b = 0, _c = Object.entries(status_1.hard); _b < _c.length; _b++) {
                    var _d = _c[_b], resource = _d[0], hardLimit = _d[1];
                    var used = status_1.used[resource];
                    if (used && hardLimit) {
                        // Parse resource values (handle units like Mi, Gi, etc.)
                        var usedNum = this.parseResourceValue(used);
                        var hardNum = this.parseResourceValue(hardLimit);
                        if (usedNum && hardNum && usedNum / hardNum > 0.8) {
                            constraintsViolated++;
                            var percentage = Math.round((usedNum / hardNum) * 100);
                            issues.push("Quota ".concat(quotaName, " in ").concat(namespace, ": ").concat(resource, " at ").concat(percentage, "% (").concat(used, "/").concat(hardLimit, ")"));
                        }
                    }
                }
            }
        }
        return { totalQuotas: totalQuotas, totalLimits: totalLimits, constraintsViolated: constraintsViolated, issues: issues };
    };
    RCAChecklistEngine.prototype.parseResourceValue = function (value) {
        // Simple parser for Kubernetes resource values
        if (!value || typeof value !== 'string')
            return null;
        // Handle memory units (Ki, Mi, Gi, Ti)
        var memoryMatch = value.match(/^(\\d+(?:\\.\\d+)?)(Ki|Mi|Gi|Ti|k|M|G|T)?$/);
        if (memoryMatch) {
            var num_1 = parseFloat(memoryMatch[1]);
            var unit = memoryMatch[2] || '';
            var multipliers = {
                'Ki': 1024, 'Mi': 1024 * 1024, 'Gi': 1024 * 1024 * 1024, 'Ti': 1024 * 1024 * 1024 * 1024,
                'k': 1000, 'M': 1000 * 1000, 'G': 1000 * 1000 * 1000, 'T': 1000 * 1000 * 1000 * 1000
            };
            return num_1 * (multipliers[unit] || 1);
        }
        // Handle CPU units (m for millicores)
        var cpuMatch = value.match(/^(\\d+(?:\\.\\d+)?)m?$/);
        if (cpuMatch) {
            var num_2 = parseFloat(cpuMatch[1]);
            return value.includes('m') ? num_2 : num_2 * 1000; // Convert to millicores
        }
        // Plain numbers
        var num = parseFloat(value);
        return isNaN(num) ? null : num;
    };
    RCAChecklistEngine.prototype.extractEventPatterns = function (events) {
        var patternCounts = new Map();
        for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
            var event_1 = events_1[_i];
            var pattern = event_1.reason;
            patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
        }
        return Array.from(patternCounts.entries())
            .sort(function (a, b) { return b[1] - a[1]; })
            .slice(0, 5)
            .map(function (_a) {
            var pattern = _a[0], count = _a[1];
            return "".concat(pattern, " (").concat(count, ")");
        });
    };
    RCAChecklistEngine.prototype.analyzeChecklistResults = function (result) {
        var checksPerformed = result.checksPerformed;
        result.summary = {
            totalChecks: checksPerformed.length,
            passed: checksPerformed.filter(function (c) { return c.status === 'pass'; }).length,
            failed: checksPerformed.filter(function (c) { return c.status === 'fail'; }).length,
            warnings: checksPerformed.filter(function (c) { return c.status === 'warning'; }).length
        };
        // Determine overall status
        if (result.summary.failed > 0) {
            result.overallStatus = 'failing';
        }
        else if (result.summary.warnings > 0) {
            result.overallStatus = 'degraded';
        }
        else {
            result.overallStatus = 'healthy';
        }
        // Extract critical issues
        result.criticalIssues = checksPerformed
            .filter(function (c) { return c.severity === 'critical' || c.status === 'fail'; })
            .flatMap(function (c) { return c.findings; });
    };
    RCAChecklistEngine.prototype.generateNextActions = function (result) {
        var actions = [];
        // Priority: Critical failures first
        var criticalChecks = result.checksPerformed.filter(function (c) { return c.severity === 'critical'; });
        for (var _i = 0, criticalChecks_1 = criticalChecks; _i < criticalChecks_1.length; _i++) {
            var check = criticalChecks_1[_i];
            actions.push.apply(actions, check.recommendations.slice(0, 2));
        }
        // High severity warnings
        var highSeverityChecks = result.checksPerformed.filter(function (c) { return c.severity === 'high'; });
        for (var _a = 0, highSeverityChecks_1 = highSeverityChecks; _a < highSeverityChecks_1.length; _a++) {
            var check = highSeverityChecks_1[_a];
            actions.push.apply(actions, check.recommendations.slice(0, 1));
        }
        // Default action if no specific issues
        if (actions.length === 0 && result.overallStatus !== 'healthy') {
            actions.push('Review detailed findings above for specific recommendations');
        }
        result.nextActions = actions.slice(0, 5); // Top 5 actions
    };
    RCAChecklistEngine.prototype.generateHumanSummary = function (result) {
        var summary = result.summary, overallStatus = result.overallStatus, namespace = result.namespace;
        var scopeText = namespace ? "Namespace ".concat(namespace) : 'Cluster';
        var statusText = overallStatus;
        var checksText = "".concat(summary.passed, "/").concat(summary.totalChecks, " checks passed");
        var issuesText = '';
        if (summary.failed > 0) {
            issuesText = ", ".concat(summary.failed, " critical issues");
        }
        else if (summary.warnings > 0) {
            issuesText = ", ".concat(summary.warnings, " warnings");
        }
        result.human = "".concat(scopeText, " is ").concat(statusText, ". ").concat(checksText).concat(issuesText, ". ") +
            "".concat(result.nextActions.length > 0 ? 'Next: ' + result.nextActions[0] : 'No immediate action required.');
    };
    RCAChecklistEngine.prototype.generateMarkdownReport = function (result) {
        var markdown = "# RCA Checklist Report\\n\\n";
        markdown += "**Report ID**: ".concat(result.reportId, "\\n");
        markdown += "**Timestamp**: ".concat(result.timestamp, "\\n");
        markdown += "**Duration**: ".concat(result.duration, "ms\\n");
        markdown += "**Status**: ".concat(result.overallStatus.toUpperCase(), "\\n\\n");
        if (result.namespace) {
            markdown += "**Namespace**: ".concat(result.namespace, "\\n\\n");
        }
        markdown += "## Summary\\n";
        markdown += "- **Checks**: ".concat(result.summary.passed, "/").concat(result.summary.totalChecks, " passed\\n");
        markdown += "- **Warnings**: ".concat(result.summary.warnings, "\\n");
        markdown += "- **Failures**: ".concat(result.summary.failed, "\\n\\n");
        if (result.criticalIssues.length > 0) {
            markdown += "## Critical Issues\\n";
            result.criticalIssues.forEach(function (issue) {
                markdown += "- ".concat(issue, "\\n");
            });
            markdown += "\\n";
        }
        if (result.nextActions.length > 0) {
            markdown += "## Next Actions\\n";
            result.nextActions.forEach(function (action, index) {
                markdown += "".concat(index + 1, ". ").concat(action, "\\n");
            });
            markdown += "\\n";
        }
        markdown += "## Detailed Findings\\n";
        result.checksPerformed.forEach(function (check) {
            var statusIcon = check.status === 'pass' ? '✅' :
                check.status === 'warning' ? '⚠️' : '❌';
            markdown += "### ".concat(statusIcon, " ").concat(check.name, "\\n");
            check.findings.forEach(function (finding) {
                markdown += "- ".concat(finding, "\\n");
            });
            if (check.recommendations.length > 0) {
                markdown += "**Recommendations**:\\n";
                check.recommendations.forEach(function (rec) {
                    markdown += "- ".concat(rec, "\\n");
                });
            }
            markdown += "\\n";
        });
        return markdown;
    };
    RCAChecklistEngine.prototype.timeoutPromise = function (ms) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (_, reject) {
                        setTimeout(function () { return reject(new Error("RCA checklist timed out after ".concat(ms, "ms"))); }, ms);
                    })];
            });
        });
    };
    return RCAChecklistEngine;
}());
exports.RCAChecklistEngine = RCAChecklistEngine;

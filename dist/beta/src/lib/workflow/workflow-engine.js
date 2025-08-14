"use strict";
/**
 * Workflow Engine - ADR-005 Implementation
 *
 * Hierarchical State Machine with Panic Detection
 * Prevents "4 AM panic operations" through structured diagnostic workflows
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngine = exports.PanicType = exports.DiagnosticState = void 0;
var DiagnosticState;
(function (DiagnosticState) {
    DiagnosticState["GATHERING"] = "gathering";
    DiagnosticState["ANALYZING"] = "analyzing";
    DiagnosticState["HYPOTHESIZING"] = "hypothesizing";
    DiagnosticState["TESTING"] = "testing";
    DiagnosticState["RESOLVING"] = "resolving";
})(DiagnosticState || (exports.DiagnosticState = DiagnosticState = {}));
var PanicType;
(function (PanicType) {
    PanicType["RAPID_FIRE_COMMANDS"] = "rapid_fire_commands";
    PanicType["JUMPING_BETWEEN_DOMAINS"] = "jumping_between_domains";
    PanicType["BYPASSING_DIAGNOSTICS"] = "bypassing_diagnostics";
    PanicType["ESCALATING_PERMISSIONS"] = "escalating_permissions";
    PanicType["DESTRUCTIVE_WITHOUT_EVIDENCE"] = "destructive_without_evidence";
})(PanicType || (exports.PanicType = PanicType = {}));
/**
 * State machine configuration
 */
var STATE_MACHINE = (_a = {},
    _a[DiagnosticState.GATHERING] = {
        description: "Collecting evidence and symptoms",
        allowedTools: ['oc_get_pods', 'oc_describe_pod', 'oc_get_logs', 'oc_get_events', 'memory_search_operational'],
        blockedTools: ['oc_apply_*', 'oc_scale_*', 'oc_restart_*'],
        requiredEvidence: ['symptoms', 'affected_resources'],
        nextStates: [DiagnosticState.ANALYZING],
        minTimeInState: 30,
        guidanceMessage: "Let's gather evidence about what's happening before making changes."
    },
    _a[DiagnosticState.ANALYZING] = {
        description: "Searching for similar patterns and root causes",
        allowedTools: ['memory_search_operational', 'memory_search_conversations'],
        blockedTools: ['oc_apply_*', 'oc_scale_*', 'oc_restart_*'],
        requiredEvidence: ['similar_incidents', 'pattern_analysis'],
        nextStates: [DiagnosticState.HYPOTHESIZING, DiagnosticState.GATHERING],
        guidanceMessage: "Based on the evidence, let's look for similar patterns we've seen before."
    },
    _a[DiagnosticState.HYPOTHESIZING] = {
        description: "Forming testable theories about root causes",
        allowedTools: ['oc_get_*', 'oc_describe_*', 'oc_analyze_*'],
        blockedTools: ['oc_apply_*', 'oc_scale_*', 'oc_restart_*'],
        requiredEvidence: ['root_cause_theory', 'supporting_evidence'],
        nextStates: [DiagnosticState.TESTING, DiagnosticState.ANALYZING],
        guidanceMessage: "Let's form a specific theory about what's causing this issue."
    },
    _a[DiagnosticState.TESTING] = {
        description: "Testing hypotheses with targeted investigation",
        allowedTools: ['oc_get_*', 'oc_describe_*', 'oc_logs_*', 'oc_exec'],
        blockedTools: ['oc_apply_*', 'oc_scale_*', 'oc_restart_*'],
        requiredEvidence: ['hypothesis_test_results'],
        nextStates: [DiagnosticState.RESOLVING, DiagnosticState.HYPOTHESIZING],
        guidanceMessage: "Let's test our theory with specific diagnostic commands."
    },
    _a[DiagnosticState.RESOLVING] = {
        description: "Applying approved solutions with proper authorization",
        allowedTools: ['oc_apply_config', 'oc_scale_deployment', 'oc_restart_deployment', 'memory_store_operational'],
        blockedTools: [],
        requiredEvidence: ['confirmed_root_cause', 'solution_plan', 'rollback_plan'],
        nextStates: [DiagnosticState.GATHERING],
        guidanceMessage: "Now we can apply the fix, with proper approval and rollback plan."
    },
    _a);
/**
 * Panic Detection System
 */
var PanicDetector = /** @class */ (function () {
    function PanicDetector() {
    }
    PanicDetector.prototype.detectPanicSignals = function (session, newToolCall) {
        return __awaiter(this, void 0, void 0, function () {
            var signals;
            return __generator(this, function (_a) {
                signals = [];
                if (this.isRapidFireDangerous(session, newToolCall)) {
                    signals.push({
                        type: PanicType.RAPID_FIRE_COMMANDS,
                        severity: 'high',
                        timestamp: new Date(),
                        description: 'Multiple high-risk operations requested in quick succession',
                        evidence: this.getRecentToolCalls(session, 60)
                    });
                }
                if (this.isBypassingDiagnostics(session, newToolCall)) {
                    signals.push({
                        type: PanicType.BYPASSING_DIAGNOSTICS,
                        severity: 'critical',
                        timestamp: new Date(),
                        description: 'Attempting write operations without completing evidence gathering',
                        evidence: { currentState: session.currentState, requestedTool: newToolCall.name }
                    });
                }
                return [2 /*return*/, signals];
            });
        });
    };
    PanicDetector.prototype.isRapidFireDangerous = function (session, newTool) {
        var recentCalls = this.getRecentToolCalls(session, 30);
        var dangerousOps = recentCalls.filter(function (call) {
            return call.name.includes('apply') || call.name.includes('delete') ||
                call.name.includes('restart') || call.name.includes('scale');
        });
        return dangerousOps.length >= 2;
    };
    PanicDetector.prototype.isBypassingDiagnostics = function (session, newTool) {
        var isWriteOperation = newTool.name.includes('apply') ||
            newTool.name.includes('scale') ||
            newTool.name.includes('restart');
        var hasMinimalEvidence = session.evidence.length < 3;
        var inEarlyState = [DiagnosticState.GATHERING, DiagnosticState.ANALYZING].includes(session.currentState);
        return isWriteOperation && (hasMinimalEvidence || inEarlyState);
    };
    PanicDetector.prototype.getRecentToolCalls = function (session, seconds) {
        var cutoff = new Date(Date.now() - seconds * 1000);
        return session.toolCalls.filter(function (call) { return call.timestamp >= cutoff; });
    };
    return PanicDetector;
}());
/**
 * Memory-Guided Workflow Assistant
 */
var MemoryGuidedWorkflow = /** @class */ (function () {
    function MemoryGuidedWorkflow(memoryManager) {
        this.memoryManager = memoryManager;
    }
    MemoryGuidedWorkflow.prototype.suggestNextSteps = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var suggestions, similarIncidents, evidenceGaps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        suggestions = [];
                        return [4 /*yield*/, this.searchSimilarIncidents(session.evidence)];
                    case 1:
                        similarIncidents = _a.sent();
                        if (similarIncidents.length > 0) {
                            suggestions.push({
                                type: 'pattern_match',
                                priority: 'high',
                                message: "I found ".concat(similarIncidents.length, " similar incidents."),
                                recommendedActions: similarIncidents.map(function (incident) { return ({
                                    action: 'review_resolution',
                                    description: "Review incident ".concat(incident.incidentId),
                                    evidence: incident.resolution
                                }); })
                            });
                        }
                        evidenceGaps = this.identifyEvidenceGaps(session);
                        if (evidenceGaps.length > 0) {
                            suggestions.push({
                                type: 'evidence_gap',
                                priority: 'medium',
                                message: "We're missing some key evidence for diagnosis.",
                                recommendedActions: evidenceGaps.map(function (gap) { return ({
                                    action: 'gather_evidence',
                                    description: gap.description,
                                    suggestedTool: gap.suggestedTool
                                }); })
                            });
                        }
                        return [2 /*return*/, suggestions];
                }
            });
        });
    };
    MemoryGuidedWorkflow.prototype.searchSimilarIncidents = function (evidence) {
        return __awaiter(this, void 0, void 0, function () {
            var symptoms, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        symptoms = evidence.filter(function (e) { return e.type === 'symptoms'; }).map(function (e) { return e.description; }).join(' ');
                        if (symptoms.length === 0)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, this.memoryManager.searchOperational(symptoms, 5)];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.map(function (r) { return r.memory; }).filter(function (m) { return 'resolution' in m && m.resolution; })];
                }
            });
        });
    };
    MemoryGuidedWorkflow.prototype.identifyEvidenceGaps = function (session) {
        var gaps = [];
        var stateConfig = STATE_MACHINE[session.currentState];
        var _loop_1 = function (requiredType) {
            var hasEvidence = session.evidence.some(function (e) { return e.type === requiredType; });
            if (!hasEvidence) {
                gaps.push({
                    description: "Missing ".concat(requiredType, " evidence"),
                    suggestedTool: this_1.suggestToolForEvidence(requiredType)
                });
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = stateConfig.requiredEvidence; _i < _a.length; _i++) {
            var requiredType = _a[_i];
            _loop_1(requiredType);
        }
        return gaps;
    };
    MemoryGuidedWorkflow.prototype.suggestToolForEvidence = function (evidenceType) {
        var suggestions = {
            symptoms: 'oc_diagnostic_cluster_health',
            affected_resources: 'oc_read_get_pods',
            logs: 'oc_read_logs',
            events: 'oc_diagnostic_events',
            similar_incidents: 'memory_search_operational',
            pattern_analysis: 'oc_diagnostic_cluster_health'
        };
        return suggestions[evidenceType] || 'oc_get_pods';
    };
    return MemoryGuidedWorkflow;
}());
/**
 * Main Workflow Engine
 */
var WorkflowEngine = /** @class */ (function () {
    function WorkflowEngine(config) {
        this.sessions = new Map();
        this.config = config;
        this.panicDetector = new PanicDetector();
        this.memoryGuided = new MemoryGuidedWorkflow(config.memoryManager);
    }
    WorkflowEngine.prototype.processToolRequest = function (sessionId, toolCall) {
        return __awaiter(this, void 0, void 0, function () {
            var session, panicSignals, stateConfig, guidance;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        session = this.sessions.get(sessionId);
                        if (!session) {
                            session = this.createNewSession(sessionId);
                            this.sessions.set(sessionId, session);
                        }
                        return [4 /*yield*/, this.panicDetector.detectPanicSignals(session, toolCall)];
                    case 1:
                        panicSignals = _b.sent();
                        if (!(panicSignals.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.handlePanicIntervention(session, toolCall, panicSignals)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        stateConfig = STATE_MACHINE[session.currentState];
                        if (!!this.isToolAllowed(toolCall, stateConfig)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.handleBlockedTool(session, toolCall, stateConfig)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5:
                        session.toolCalls.push(__assign(__assign({}, toolCall), { timestamp: new Date() }));
                        return [4 /*yield*/, this.updateSessionEvidence(session, toolCall)];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, this.checkStateTransitions(session)];
                    case 7:
                        _b.sent();
                        return [4 /*yield*/, this.generateWorkflowGuidance(session)];
                    case 8:
                        guidance = _b.sent();
                        _a = {
                            workflowGuidance: guidance,
                            currentState: session.currentState
                        };
                        return [4 /*yield*/, this.getNextRecommendedActions(session)];
                    case 9: return [2 /*return*/, (_a.nextRecommendedActions = _b.sent(),
                            _a)];
                }
            });
        });
    };
    WorkflowEngine.prototype.getCurrentContext = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        mode: 'single',
                        primaryDomain: 'cluster',
                        activeDomains: ['cluster', 'filesystem', 'knowledge', 'system'],
                        workflowPhase: 'diagnostic',
                        environment: 'dev',
                        contextType: 'cluster_ops'
                    }];
            });
        });
    };
    WorkflowEngine.prototype.getEnforcementLevel = function () {
        return this.config.enforcementLevel;
    };
    WorkflowEngine.prototype.getActiveStates = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        activeSessions: this.sessions.size,
                        sessions: Array.from(this.sessions.values()).map(function (session) { return ({
                            sessionId: session.sessionId,
                            currentState: session.currentState,
                            evidenceCount: session.evidence.length,
                            lastActivity: session.lastStateChange
                        }); })
                    }];
            });
        });
    };
    WorkflowEngine.prototype.createNewSession = function (sessionId) {
        return {
            sessionId: sessionId,
            currentState: DiagnosticState.GATHERING,
            evidence: [],
            hypotheses: [],
            testedHypotheses: [],
            proposedSolutions: [],
            panicSignals: [],
            startTime: new Date(),
            lastStateChange: new Date(),
            toolCalls: []
        };
    };
    WorkflowEngine.prototype.handlePanicIntervention = function (session, toolCall, signals) {
        return __awaiter(this, void 0, void 0, function () {
            var highSeveritySignals;
            return __generator(this, function (_a) {
                highSeveritySignals = signals.filter(function (s) { return s.severity === 'high' || s.severity === 'critical'; });
                if (highSeveritySignals.length > 0 && this.config.enforcementLevel === 'blocking') {
                    return [2 /*return*/, {
                            blocked: true,
                            panicDetected: true,
                            interventionMessage: this.generateCalmingMessage(signals),
                            nextRecommendedActions: [
                                "Take a deep breath - let's approach this methodically",
                                "Review the evidence we've gathered so far",
                                "Look for similar incidents in our memory system"
                            ],
                            forcedStateTransition: DiagnosticState.ANALYZING
                        }];
                }
                return [2 /*return*/, {
                        warning: true,
                        panicSignals: signals,
                        cautionMessage: "I notice we might be moving quickly. Let's make sure we have enough evidence."
                    }];
            });
        });
    };
    WorkflowEngine.prototype.generateCalmingMessage = function (signals) {
        var messages = [
            "🛑 Hold on - I'm detecting concerning patterns in our troubleshooting approach.",
            "",
            "It looks like we might be:"
        ];
        signals.forEach(function (signal) {
            switch (signal.type) {
                case PanicType.RAPID_FIRE_COMMANDS:
                    messages.push("• Moving too quickly between operations");
                    break;
                case PanicType.BYPASSING_DIAGNOSTICS:
                    messages.push("• Trying to apply fixes before understanding the problem");
                    break;
            }
        });
        messages.push("", "Let's slow down and work through this systematically.", "What symptoms are we seeing? Let's start there.");
        return messages.join("\\n");
    };
    WorkflowEngine.prototype.isToolAllowed = function (toolCall, stateConfig) {
        var _this = this;
        for (var _i = 0, _a = stateConfig.blockedTools; _i < _a.length; _i++) {
            var blockedPattern = _a[_i];
            if (this.matchesPattern(toolCall.name, blockedPattern)) {
                return false;
            }
        }
        if (stateConfig.allowedTools.length > 0) {
            return stateConfig.allowedTools.some(function (pattern) {
                return _this.matchesPattern(toolCall.name, pattern);
            });
        }
        return true;
    };
    WorkflowEngine.prototype.matchesPattern = function (toolName, pattern) {
        if (pattern.endsWith('*')) {
            return toolName.startsWith(pattern.slice(0, -1));
        }
        return toolName === pattern;
    };
    WorkflowEngine.prototype.handleBlockedTool = function (session, toolCall, stateConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.config.enforcementLevel === 'blocking')) return [3 /*break*/, 2];
                        _a = {
                            blocked: true,
                            interventionMessage: "Tool '".concat(toolCall.name, "' is not allowed in ").concat(session.currentState, " state. ").concat(stateConfig.guidanceMessage)
                        };
                        return [4 /*yield*/, this.getNextRecommendedActions(session)];
                    case 1: return [2 /*return*/, (_a.nextRecommendedActions = _b.sent(),
                            _a)];
                    case 2: return [2 /*return*/, {
                            warning: true,
                            cautionMessage: "Consider if '".concat(toolCall.name, "' is appropriate for ").concat(session.currentState, " state. ").concat(stateConfig.guidanceMessage)
                        }];
                }
            });
        });
    };
    WorkflowEngine.prototype.updateSessionEvidence = function (session, toolCall) {
        return __awaiter(this, void 0, void 0, function () {
            var evidence;
            return __generator(this, function (_a) {
                evidence = {
                    type: 'symptoms',
                    description: "Evidence from ".concat(toolCall.name),
                    source: toolCall.name,
                    timestamp: new Date(),
                    quality: 'basic',
                    data: toolCall.arguments
                };
                session.evidence.push(evidence);
                session.lastStateChange = new Date();
                return [2 /*return*/];
            });
        });
    };
    WorkflowEngine.prototype.checkStateTransitions = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var stateConfig, hasRequiredEvidence;
            return __generator(this, function (_a) {
                stateConfig = STATE_MACHINE[session.currentState];
                hasRequiredEvidence = stateConfig.requiredEvidence.every(function (evidenceType) {
                    return session.evidence.some(function (e) { return e.type === evidenceType; });
                });
                if (hasRequiredEvidence && session.evidence.length >= this.config.minEvidenceThreshold) {
                    console.error("\uD83D\uDD04 Session ".concat(session.sessionId, " ready for state transition from ").concat(session.currentState));
                }
                return [2 /*return*/];
            });
        });
    };
    WorkflowEngine.prototype.generateWorkflowGuidance = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var stateConfig, suggestions, guidance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stateConfig = STATE_MACHINE[session.currentState];
                        return [4 /*yield*/, this.memoryGuided.suggestNextSteps(session)];
                    case 1:
                        suggestions = _a.sent();
                        guidance = stateConfig.guidanceMessage;
                        if (suggestions.length > 0) {
                            guidance += "\\n\\n" + suggestions[0].message;
                        }
                        return [2 /*return*/, guidance];
                }
            });
        });
    };
    WorkflowEngine.prototype.getNextRecommendedActions = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var suggestions, stateConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.memoryGuided.suggestNextSteps(session)];
                    case 1:
                        suggestions = _a.sent();
                        if (suggestions.length > 0) {
                            return [2 /*return*/, suggestions[0].recommendedActions.map(function (action) { return action.description; })];
                        }
                        stateConfig = STATE_MACHINE[session.currentState];
                        return [2 /*return*/, [stateConfig.guidanceMessage]];
                }
            });
        });
    };
    return WorkflowEngine;
}());
exports.WorkflowEngine = WorkflowEngine;

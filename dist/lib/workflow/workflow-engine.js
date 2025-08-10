/**
 * Workflow Engine - ADR-005 Implementation
 *
 * Hierarchical State Machine with Panic Detection
 * Prevents "4 AM panic operations" through structured diagnostic workflows
 */
export var DiagnosticState;
(function (DiagnosticState) {
    DiagnosticState["GATHERING"] = "gathering";
    DiagnosticState["ANALYZING"] = "analyzing";
    DiagnosticState["HYPOTHESIZING"] = "hypothesizing";
    DiagnosticState["TESTING"] = "testing";
    DiagnosticState["RESOLVING"] = "resolving";
})(DiagnosticState || (DiagnosticState = {}));
export var PanicType;
(function (PanicType) {
    PanicType["RAPID_FIRE_COMMANDS"] = "rapid_fire_commands";
    PanicType["JUMPING_BETWEEN_DOMAINS"] = "jumping_between_domains";
    PanicType["BYPASSING_DIAGNOSTICS"] = "bypassing_diagnostics";
    PanicType["ESCALATING_PERMISSIONS"] = "escalating_permissions";
    PanicType["DESTRUCTIVE_WITHOUT_EVIDENCE"] = "destructive_without_evidence";
})(PanicType || (PanicType = {}));
/**
 * State machine configuration
 */
const STATE_MACHINE = {
    [DiagnosticState.GATHERING]: {
        description: "Collecting evidence and symptoms",
        allowedTools: ['oc_get_pods', 'oc_describe_pod', 'oc_get_logs', 'oc_get_events', 'memory_search_operational'],
        blockedTools: ['oc_apply_*', 'oc_scale_*', 'oc_restart_*'],
        requiredEvidence: ['symptoms', 'affected_resources'],
        nextStates: [DiagnosticState.ANALYZING],
        minTimeInState: 30,
        guidanceMessage: "Let's gather evidence about what's happening before making changes."
    },
    [DiagnosticState.ANALYZING]: {
        description: "Searching for similar patterns and root causes",
        allowedTools: ['memory_search_operational', 'memory_search_conversations'],
        blockedTools: ['oc_apply_*', 'oc_scale_*', 'oc_restart_*'],
        requiredEvidence: ['similar_incidents', 'pattern_analysis'],
        nextStates: [DiagnosticState.HYPOTHESIZING, DiagnosticState.GATHERING],
        guidanceMessage: "Based on the evidence, let's look for similar patterns we've seen before."
    },
    [DiagnosticState.HYPOTHESIZING]: {
        description: "Forming testable theories about root causes",
        allowedTools: ['oc_get_*', 'oc_describe_*', 'oc_analyze_*'],
        blockedTools: ['oc_apply_*', 'oc_scale_*', 'oc_restart_*'],
        requiredEvidence: ['root_cause_theory', 'supporting_evidence'],
        nextStates: [DiagnosticState.TESTING, DiagnosticState.ANALYZING],
        guidanceMessage: "Let's form a specific theory about what's causing this issue."
    },
    [DiagnosticState.TESTING]: {
        description: "Testing hypotheses with targeted investigation",
        allowedTools: ['oc_get_*', 'oc_describe_*', 'oc_logs_*', 'oc_exec'],
        blockedTools: ['oc_apply_*', 'oc_scale_*', 'oc_restart_*'],
        requiredEvidence: ['hypothesis_test_results'],
        nextStates: [DiagnosticState.RESOLVING, DiagnosticState.HYPOTHESIZING],
        guidanceMessage: "Let's test our theory with specific diagnostic commands."
    },
    [DiagnosticState.RESOLVING]: {
        description: "Applying approved solutions with proper authorization",
        allowedTools: ['oc_apply_config', 'oc_scale_deployment', 'oc_restart_deployment', 'memory_store_operational'],
        blockedTools: [],
        requiredEvidence: ['confirmed_root_cause', 'solution_plan', 'rollback_plan'],
        nextStates: [DiagnosticState.GATHERING],
        guidanceMessage: "Now we can apply the fix, with proper approval and rollback plan."
    }
};
/**
 * Panic Detection System
 */
class PanicDetector {
    async detectPanicSignals(session, newToolCall) {
        const signals = [];
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
        return signals;
    }
    isRapidFireDangerous(session, newTool) {
        const recentCalls = this.getRecentToolCalls(session, 30);
        const dangerousOps = recentCalls.filter(call => call.name.includes('apply') || call.name.includes('delete') ||
            call.name.includes('restart') || call.name.includes('scale'));
        return dangerousOps.length >= 2;
    }
    isBypassingDiagnostics(session, newTool) {
        const isWriteOperation = newTool.name.includes('apply') ||
            newTool.name.includes('scale') ||
            newTool.name.includes('restart');
        const hasMinimalEvidence = session.evidence.length < 3;
        const inEarlyState = [DiagnosticState.GATHERING, DiagnosticState.ANALYZING].includes(session.currentState);
        return isWriteOperation && (hasMinimalEvidence || inEarlyState);
    }
    getRecentToolCalls(session, seconds) {
        const cutoff = new Date(Date.now() - seconds * 1000);
        return session.toolCalls.filter(call => call.timestamp >= cutoff);
    }
}
/**
 * Memory-Guided Workflow Assistant
 */
class MemoryGuidedWorkflow {
    memoryManager;
    constructor(memoryManager) {
        this.memoryManager = memoryManager;
    }
    async suggestNextSteps(session) {
        const suggestions = [];
        const similarIncidents = await this.searchSimilarIncidents(session.evidence);
        if (similarIncidents.length > 0) {
            suggestions.push({
                type: 'pattern_match',
                priority: 'high',
                message: `I found ${similarIncidents.length} similar incidents.`,
                recommendedActions: similarIncidents.map(incident => ({
                    action: 'review_resolution',
                    description: `Review incident ${incident.incidentId}`,
                    evidence: incident.resolution
                }))
            });
        }
        const evidenceGaps = this.identifyEvidenceGaps(session);
        if (evidenceGaps.length > 0) {
            suggestions.push({
                type: 'evidence_gap',
                priority: 'medium',
                message: "We're missing some key evidence for diagnosis.",
                recommendedActions: evidenceGaps.map(gap => ({
                    action: 'gather_evidence',
                    description: gap.description,
                    suggestedTool: gap.suggestedTool
                }))
            });
        }
        return suggestions;
    }
    async searchSimilarIncidents(evidence) {
        const symptoms = evidence.filter(e => e.type === 'symptoms').map(e => e.description).join(' ');
        if (symptoms.length === 0)
            return [];
        const results = await this.memoryManager.searchOperational(symptoms, 5);
        return results.map(r => r.memory).filter(m => 'resolution' in m && m.resolution);
    }
    identifyEvidenceGaps(session) {
        const gaps = [];
        const stateConfig = STATE_MACHINE[session.currentState];
        for (const requiredType of stateConfig.requiredEvidence) {
            const hasEvidence = session.evidence.some(e => e.type === requiredType);
            if (!hasEvidence) {
                gaps.push({
                    description: `Missing ${requiredType} evidence`,
                    suggestedTool: this.suggestToolForEvidence(requiredType)
                });
            }
        }
        return gaps;
    }
    suggestToolForEvidence(evidenceType) {
        const suggestions = {
            symptoms: 'oc_diagnostic_cluster_health',
            affected_resources: 'oc_read_get_pods',
            logs: 'oc_read_logs',
            events: 'oc_diagnostic_events',
            similar_incidents: 'memory_search_operational',
            pattern_analysis: 'oc_diagnostic_cluster_health'
        };
        return suggestions[evidenceType] || 'oc_get_pods';
    }
}
/**
 * Main Workflow Engine
 */
export class WorkflowEngine {
    config;
    sessions = new Map();
    panicDetector;
    memoryGuided;
    constructor(config) {
        this.config = config;
        this.panicDetector = new PanicDetector();
        this.memoryGuided = new MemoryGuidedWorkflow(config.memoryManager);
    }
    async processToolRequest(sessionId, toolCall) {
        let session = this.sessions.get(sessionId);
        if (!session) {
            session = this.createNewSession(sessionId);
            this.sessions.set(sessionId, session);
        }
        const panicSignals = await this.panicDetector.detectPanicSignals(session, toolCall);
        if (panicSignals.length > 0) {
            return await this.handlePanicIntervention(session, toolCall, panicSignals);
        }
        const stateConfig = STATE_MACHINE[session.currentState];
        if (!this.isToolAllowed(toolCall, stateConfig)) {
            return await this.handleBlockedTool(session, toolCall, stateConfig);
        }
        session.toolCalls.push({ ...toolCall, timestamp: new Date() });
        await this.updateSessionEvidence(session, toolCall);
        await this.checkStateTransitions(session);
        const guidance = await this.generateWorkflowGuidance(session);
        return {
            workflowGuidance: guidance,
            currentState: session.currentState,
            nextRecommendedActions: await this.getNextRecommendedActions(session)
        };
    }
    async getCurrentContext() {
        return {
            mode: 'single',
            primaryDomain: 'cluster',
            activeDomains: ['cluster', 'filesystem', 'knowledge', 'system'],
            workflowPhase: 'diagnostic',
            environment: 'dev',
            contextType: 'cluster_ops'
        };
    }
    getEnforcementLevel() {
        return this.config.enforcementLevel;
    }
    async getActiveStates() {
        return {
            activeSessions: this.sessions.size,
            sessions: Array.from(this.sessions.values()).map(session => ({
                sessionId: session.sessionId,
                currentState: session.currentState,
                evidenceCount: session.evidence.length,
                lastActivity: session.lastStateChange
            }))
        };
    }
    createNewSession(sessionId) {
        return {
            sessionId,
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
    }
    async handlePanicIntervention(session, toolCall, signals) {
        const highSeveritySignals = signals.filter(s => s.severity === 'high' || s.severity === 'critical');
        if (highSeveritySignals.length > 0 && this.config.enforcementLevel === 'blocking') {
            return {
                blocked: true,
                panicDetected: true,
                interventionMessage: this.generateCalmingMessage(signals),
                nextRecommendedActions: [
                    "Take a deep breath - let's approach this methodically",
                    "Review the evidence we've gathered so far",
                    "Look for similar incidents in our memory system"
                ],
                forcedStateTransition: DiagnosticState.ANALYZING
            };
        }
        return {
            warning: true,
            panicSignals: signals,
            cautionMessage: "I notice we might be moving quickly. Let's make sure we have enough evidence."
        };
    }
    generateCalmingMessage(signals) {
        const messages = [
            "🛑 Hold on - I'm detecting concerning patterns in our troubleshooting approach.",
            "",
            "It looks like we might be:"
        ];
        signals.forEach(signal => {
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
    }
    isToolAllowed(toolCall, stateConfig) {
        for (const blockedPattern of stateConfig.blockedTools) {
            if (this.matchesPattern(toolCall.name, blockedPattern)) {
                return false;
            }
        }
        if (stateConfig.allowedTools.length > 0) {
            return stateConfig.allowedTools.some(pattern => this.matchesPattern(toolCall.name, pattern));
        }
        return true;
    }
    matchesPattern(toolName, pattern) {
        if (pattern.endsWith('*')) {
            return toolName.startsWith(pattern.slice(0, -1));
        }
        return toolName === pattern;
    }
    async handleBlockedTool(session, toolCall, stateConfig) {
        if (this.config.enforcementLevel === 'blocking') {
            return {
                blocked: true,
                interventionMessage: `Tool '${toolCall.name}' is not allowed in ${session.currentState} state. ${stateConfig.guidanceMessage}`,
                nextRecommendedActions: await this.getNextRecommendedActions(session)
            };
        }
        else {
            return {
                warning: true,
                cautionMessage: `Consider if '${toolCall.name}' is appropriate for ${session.currentState} state. ${stateConfig.guidanceMessage}`
            };
        }
    }
    async updateSessionEvidence(session, toolCall) {
        const evidence = {
            type: 'symptoms',
            description: `Evidence from ${toolCall.name}`,
            source: toolCall.name,
            timestamp: new Date(),
            quality: 'basic',
            data: toolCall.arguments
        };
        session.evidence.push(evidence);
        session.lastStateChange = new Date();
    }
    async checkStateTransitions(session) {
        const stateConfig = STATE_MACHINE[session.currentState];
        const hasRequiredEvidence = stateConfig.requiredEvidence.every(evidenceType => session.evidence.some(e => e.type === evidenceType));
        if (hasRequiredEvidence && session.evidence.length >= this.config.minEvidenceThreshold) {
            console.error(`🔄 Session ${session.sessionId} ready for state transition from ${session.currentState}`);
        }
    }
    async generateWorkflowGuidance(session) {
        const stateConfig = STATE_MACHINE[session.currentState];
        const suggestions = await this.memoryGuided.suggestNextSteps(session);
        let guidance = stateConfig.guidanceMessage;
        if (suggestions.length > 0) {
            guidance += "\\n\\n" + suggestions[0].message;
        }
        return guidance;
    }
    async getNextRecommendedActions(session) {
        const suggestions = await this.memoryGuided.suggestNextSteps(session);
        if (suggestions.length > 0) {
            return suggestions[0].recommendedActions.map(action => action.description);
        }
        const stateConfig = STATE_MACHINE[session.currentState];
        return [stateConfig.guidanceMessage];
    }
}

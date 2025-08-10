# ADR-005: Workflow State Machine Design

**Status:** Accepted  
**Date:** August 10, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor)

## Context

MCP-ocs needs to prevent "4 AM panic operations" by enforcing structured diagnostic workflows. The system must guide users through methodical troubleshooting while detecting and interrupting destructive patterns.

### Problem Statement
Operations teams under pressure often:
- **Skip diagnostic steps** and jump to solutions
- **Perform random actions** without evidence gathering
- **Apply fixes without understanding** root causes
- **Escalate permissions** unnecessarily during incidents
- **Repeat resolved incidents** due to lack of knowledge capture

### Requirements
- **Enforce structured diagnostics** before allowing write operations
- **Detect panic patterns** and provide calming intervention
- **Guide evidence collection** before suggesting solutions
- **Learn from successful resolutions** for future incidents
- **Maintain emergency flexibility** for critical situations

## Decision

**Hierarchical State Machine with Panic Detection**

### Core State Machine

```typescript
enum DiagnosticState {
  GATHERING = 'gathering',           // Evidence collection phase
  ANALYZING = 'analyzing',           // Pattern matching against memory
  HYPOTHESIZING = 'hypothesizing',   // Forming testable theories
  TESTING = 'testing',               // Targeted investigation
  RESOLVING = 'resolving'            // Approved remediation
}

interface WorkflowSession {
  sessionId: string;
  currentState: DiagnosticState;
  evidence: Evidence[];
  hypotheses: Hypothesis[];
  testedHypotheses: TestedHypothesis[];
  proposedSolutions: Solution[];
  panicSignals: PanicSignal[];
  startTime: Date;
  lastStateChange: Date;
}
```

### State Transitions and Tool Availability

```typescript
const STATE_MACHINE: Record<DiagnosticState, WorkflowStateConfig> = {
  [DiagnosticState.GATHERING]: {
    description: "Collecting evidence and symptoms",
    allowedTools: [
      'oc_get_pods', 'oc_describe_pod', 'oc_get_logs', 
      'oc_get_events', 'oc_check_health'
    ],
    blockedTools: ['oc_apply_*', 'oc_scale_*', 'oc_restart_*'],
    requiredEvidence: ['symptoms', 'affected_resources'],
    nextStates: [DiagnosticState.ANALYZING],
    minTimeInState: 30, // seconds
    guidanceMessage: "Let's gather evidence about what's happening before making changes."
  },
  
  [DiagnosticState.ANALYZING]: {
    description: "Searching for similar patterns and root causes",
    allowedTools: [
      'search_operational_memory', 'search_conversation_memory',
      'oc_analyze_resource_usage', 'oc_trace_network_path'
    ],
    blockedTools: ['oc_apply_*', 'oc_scale_*', 'oc_restart_*'],
    requiredEvidence: ['similar_incidents', 'pattern_analysis'],
    nextStates: [DiagnosticState.HYPOTHESIZING, DiagnosticState.GATHERING],
    guidanceMessage: "Based on the evidence, let's look for similar patterns we've seen before."
  },
  
  [DiagnosticState.HYPOTHESIZING]: {
    description: "Forming testable theories about root causes",
    allowedTools: [
      'oc_get_*', 'oc_describe_*', 'oc_analyze_*'
    ],
    blockedTools: ['oc_apply_*', 'oc_scale_*', 'oc_restart_*'],
    requiredEvidence: ['root_cause_theory', 'supporting_evidence'],
    nextStates: [DiagnosticState.TESTING, DiagnosticState.ANALYZING],
    guidanceMessage: "Let's form a specific theory about what's causing this issue."
  },
  
  [DiagnosticState.TESTING]: {
    description: "Testing hypotheses with targeted investigation",
    allowedTools: [
      'oc_get_*', 'oc_describe_*', 'oc_logs_*', 'oc_exec',
      'oc_port_forward'
    ],
    blockedTools: ['oc_apply_*', 'oc_scale_*', 'oc_restart_*'],
    requiredEvidence: ['hypothesis_test_results'],
    nextStates: [DiagnosticState.RESOLVING, DiagnosticState.HYPOTHESIZING],
    guidanceMessage: "Let's test our theory with specific diagnostic commands."
  },
  
  [DiagnosticState.RESOLVING]: {
    description: "Applying approved solutions with proper authorization",
    allowedTools: [
      'oc_apply_config', 'oc_scale_deployment', 'oc_restart_deployment',
      'store_operational_memory'
    ],
    blockedTools: [],
    requiredEvidence: ['confirmed_root_cause', 'solution_plan', 'rollback_plan'],
    nextStates: [DiagnosticState.GATHERING], // For validation
    guidanceMessage: "Now we can apply the fix, with proper approval and rollback plan."
  }
};
```

### Panic Detection System

```typescript
interface PanicSignal {
  type: PanicType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  evidence: any;
}

enum PanicType {
  RAPID_FIRE_COMMANDS = 'rapid_fire_commands',
  JUMPING_BETWEEN_DOMAINS = 'jumping_between_domains',
  BYPASSING_DIAGNOSTICS = 'bypassing_diagnostics',
  ESCALATING_PERMISSIONS = 'escalating_permissions',
  DESTRUCTIVE_WITHOUT_EVIDENCE = 'destructive_without_evidence'
}

class PanicDetector {
  async detectPanicSignals(session: WorkflowSession, newToolCall: ToolCall): Promise<PanicSignal[]> {
    const signals: PanicSignal[] = [];
    
    // Detect rapid-fire dangerous operations
    if (this.isRapidFireDangerous(session, newToolCall)) {
      signals.push({
        type: PanicType.RAPID_FIRE_COMMANDS,
        severity: 'high',
        timestamp: new Date(),
        description: 'Multiple high-risk operations requested in quick succession',
        evidence: this.getRecentToolCalls(session, 60) // Last 60 seconds
      });
    }
    
    // Detect attempts to bypass diagnostic workflow
    if (this.isBypassingDiagnostics(session, newToolCall)) {
      signals.push({
        type: PanicType.BYPASSING_DIAGNOSTICS,
        severity: 'critical',
        timestamp: new Date(),
        description: 'Attempting write operations without completing evidence gathering',
        evidence: { currentState: session.currentState, requestedTool: newToolCall.name }
      });
    }
    
    // Detect jumping between unrelated investigation paths
    if (this.isJumpingBetweenDomains(session, newToolCall)) {
      signals.push({
        type: PanicType.JUMPING_BETWEEN_DOMAINS,
        severity: 'medium',
        timestamp: new Date(),
        description: 'Switching between unrelated diagnostic areas without completing investigation',
        evidence: this.getInvestigationPath(session)
      });
    }
    
    return signals;
  }
  
  private isRapidFireDangerous(session: WorkflowSession, newTool: ToolCall): boolean {
    const recentCalls = this.getRecentToolCalls(session, 30); // Last 30 seconds
    const dangerousOps = recentCalls.filter(call => 
      call.name.includes('apply') || 
      call.name.includes('delete') || 
      call.name.includes('restart')
    );
    
    return dangerousOps.length >= 2; // 2+ dangerous ops in 30 seconds
  }
  
  private isBypassingDiagnostics(session: WorkflowSession, newTool: ToolCall): boolean {
    const isWriteOperation = newTool.name.includes('apply') || 
                            newTool.name.includes('scale') || 
                            newTool.name.includes('restart');
    
    const hasMinimalEvidence = session.evidence.length < 3;
    const inEarlyState = [DiagnosticState.GATHERING, DiagnosticState.ANALYZING].includes(session.currentState);
    
    return isWriteOperation && (hasMinimalEvidence || inEarlyState);
  }
}
```

### Workflow Enforcement Engine

```typescript
class WorkflowEngine {
  async processToolRequest(sessionId: string, toolCall: ToolCall): Promise<WorkflowResponse> {
    const session = await this.getSession(sessionId);
    
    // 1. Detect panic signals
    const panicSignals = await this.panicDetector.detectPanicSignals(session, toolCall);
    
    // 2. Handle panic intervention if needed
    if (panicSignals.length > 0) {
      return await this.handlePanicIntervention(session, toolCall, panicSignals);
    }
    
    // 3. Check if tool is allowed in current state
    const stateConfig = STATE_MACHINE[session.currentState];
    if (!this.isToolAllowed(toolCall, stateConfig)) {
      return await this.handleBlockedTool(session, toolCall, stateConfig);
    }
    
    // 4. Execute tool call
    const result = await this.executeToolCall(toolCall);
    
    // 5. Update session with new evidence
    await this.updateSessionEvidence(session, toolCall, result);
    
    // 6. Check for state transition conditions
    await this.checkStateTransitions(session);
    
    // 7. Provide workflow guidance
    const guidance = await this.generateWorkflowGuidance(session);
    
    return {
      toolResult: result,
      workflowGuidance: guidance,
      currentState: session.currentState,
      nextRecommendedActions: await this.getNextRecommendedActions(session)
    };
  }
  
  private async handlePanicIntervention(
    session: WorkflowSession, 
    toolCall: ToolCall, 
    signals: PanicSignal[]
  ): Promise<WorkflowResponse> {
    
    const highSeveritySignals = signals.filter(s => s.severity === 'high' || s.severity === 'critical');
    
    if (highSeveritySignals.length > 0) {
      // Block the operation and provide calming guidance
      return {
        blocked: true,
        panicDetected: true,
        interventionMessage: this.generateCalmingMessage(signals),
        recommendedActions: [
          "Take a deep breath - let's approach this methodically",
          "Review the evidence we've gathered so far",
          "Consider if we have enough information to understand the problem",
          "Look for similar incidents in our memory system"
        ],
        forcedStateTransition: DiagnosticState.ANALYZING
      };
    }
    
    // For lower severity signals, allow but warn
    return {
      warning: true,
      panicSignals: signals,
      cautionMessage: "I notice we might be moving quickly. Let's make sure we have enough evidence."
    };
  }
  
  private generateCalmingMessage(signals: PanicSignal[]): string {
    const messages = [
      "🛑 Hold on - I'm detecting some concerning patterns in our troubleshooting approach.",
      "",
      "It looks like we might be:",
    ];
    
    signals.forEach(signal => {
      switch (signal.type) {
        case PanicType.RAPID_FIRE_COMMANDS:
          messages.push("• Moving too quickly between operations");
          break;
        case PanicType.BYPASSING_DIAGNOSTICS:
          messages.push("• Trying to apply fixes before understanding the problem");
          break;
        case PanicType.JUMPING_BETWEEN_DOMAINS:
          messages.push("• Jumping between different investigation areas");
          break;
      }
    });
    
    messages.push(
      "",
      "Let's slow down and work through this systematically.",
      "The best way to solve complex problems is with methodical investigation.",
      "",
      "What symptoms are we seeing? Let's start there."
    );
    
    return messages.join("\\n");
  }
}
```

### Memory-Guided Workflow

```typescript
class MemoryGuidedWorkflow {
  async suggestNextSteps(session: WorkflowSession): Promise<WorkflowSuggestion[]> {
    const suggestions: WorkflowSuggestion[] = [];
    
    // Search for similar incidents
    const similarIncidents = await this.searchSimilarIncidents(session.evidence);
    
    if (similarIncidents.length > 0) {
      suggestions.push({
        type: 'pattern_match',
        priority: 'high',
        message: `I found ${similarIncidents.length} similar incidents. Let's look at how they were resolved.`,
        recommendedActions: similarIncidents.map(incident => ({
          action: 'review_resolution',
          description: `Review how incident ${incident.incidentId} was resolved`,
          evidence: incident.resolution
        }))
      });
    }
    
    // Suggest evidence gaps
    const evidenceGaps = this.identifyEvidenceGaps(session);
    if (evidenceGaps.length > 0) {
      suggestions.push({
        type: 'evidence_gap',
        priority: 'medium',
        message: "We're missing some key evidence for a complete diagnosis.",
        recommendedActions: evidenceGaps.map(gap => ({
          action: 'gather_evidence',
          description: gap.description,
          suggestedTool: gap.suggestedTool
        }))
      });
    }
    
    // Pattern-based recommendations
    const patterns = await this.identifyPatterns(session.evidence);
    patterns.forEach(pattern => {
      suggestions.push({
        type: 'pattern_recommendation',
        priority: pattern.confidence > 0.8 ? 'high' : 'medium',
        message: `This looks like a ${pattern.type} issue. ${pattern.description}`,
        recommendedActions: pattern.suggestedDiagnostics
      });
    });
    
    return suggestions.sort((a, b) => this.priorityScore(b.priority) - this.priorityScore(a.priority));
  }
  
  private async searchSimilarIncidents(evidence: Evidence[]): Promise<OperationalMemory[]> {
    const symptoms = evidence
      .filter(e => e.type === 'symptom')
      .map(e => e.description)
      .join(' ');
    
    if (symptoms.length === 0) return [];
    
    const results = await this.memoryManager.searchOperational(symptoms, 5);
    return results.map(r => r.metadata).filter(m => m.resolution);
  }
}
```

## State Transition Logic

### Evidence Requirements

```typescript
interface EvidenceRequirement {
  type: EvidenceType;
  minCount?: number;
  quality?: 'basic' | 'detailed' | 'comprehensive';
  recency?: number; // minutes
}

const EVIDENCE_REQUIREMENTS: Record<DiagnosticState, EvidenceRequirement[]> = {
  [DiagnosticState.GATHERING]: [
    { type: 'symptoms', minCount: 2, quality: 'detailed' },
    { type: 'affected_resources', minCount: 1, quality: 'basic' }
  ],
  
  [DiagnosticState.ANALYZING]: [
    { type: 'symptoms', minCount: 3, quality: 'detailed' },
    { type: 'logs', minCount: 1, quality: 'basic' },
    { type: 'events', minCount: 1, quality: 'basic' }
  ],
  
  [DiagnosticState.HYPOTHESIZING]: [
    { type: 'pattern_analysis', minCount: 1, quality: 'detailed' },
    { type: 'similar_incidents', minCount: 1, quality: 'basic' }
  ],
  
  [DiagnosticState.TESTING]: [
    { type: 'hypothesis', minCount: 1, quality: 'detailed' },
    { type: 'test_plan', minCount: 1, quality: 'comprehensive' }
  ],
  
  [DiagnosticState.RESOLVING]: [
    { type: 'confirmed_root_cause', minCount: 1, quality: 'comprehensive' },
    { type: 'solution_plan', minCount: 1, quality: 'comprehensive' },
    { type: 'rollback_plan', minCount: 1, quality: 'detailed' }
  ]
};
```

### Emergency Break-Glass Integration

```typescript
interface EmergencyOverride {
  sessionId: string;
  justification: string;
  seniorApprover: string;
  skipToState: DiagnosticState;
  timeLimit: number; // minutes
  auditLevel: 'enhanced';
}

class EmergencyWorkflowOverride {
  async requestEmergencyOverride(request: EmergencyOverride): Promise<OverrideResult> {
    // 1. Validate emergency criteria
    await this.validateEmergencyCriteria(request);
    
    // 2. Red light warnings
    await this.displayEmergencyWarnings(request);
    
    // 3. Senior approval
    await this.verifySeniorApproval(request.seniorApprover);
    
    // 4. Grant temporary override
    const override = await this.grantTemporaryOverride(request);
    
    // 5. Enhanced audit trail
    await this.createEnhancedAuditTrail(request, override);
    
    // 6. Schedule mandatory review
    await this.scheduleMandatoryReview(request);
    
    return override;
  }
}
```

## Rationale

### Benefits:
✅ **Panic Prevention** - Structured approach prevents random troubleshooting  
✅ **Knowledge Preservation** - Every incident captured for future learning  
✅ **Quality Assurance** - Evidence requirements ensure thorough investigation  
✅ **Emergency Flexibility** - Break-glass for critical situations  
✅ **Guided Learning** - Junior engineers learn proper diagnostic methods  
✅ **Pattern Recognition** - Similar incidents identified and solutions suggested  

### Costs:
- **Learning Curve** - Teams need to adapt to structured workflow
- **Time Investment** - Thorough diagnostics take longer initially
- **Complexity** - State machine adds implementation complexity
- **Resistance** - Experienced engineers may resist process constraints

## Implementation Strategy

### Phase 1: Basic State Machine
```typescript
// Simple state tracking without enforcement
class BasicWorkflowTracker {
  async trackToolUsage(toolCall: ToolCall): Promise<void> {
    // Record tool usage patterns
    // Identify potential workflow improvements
    // No blocking, just observation
  }
}
```

### Phase 2: Gentle Guidance
```typescript
// Suggestions without blocking
class GentleWorkflowGuide {
  async suggestWorkflow(toolCall: ToolCall): Promise<string[]> {
    // Provide suggestions based on current context
    // Highlight missing evidence
    // Recommend next diagnostic steps
  }
}
```

### Phase 3: Full Enforcement
```typescript
// Complete state machine with panic detection
class FullWorkflowEngine {
  // Complete implementation as described above
}
```

## Success Metrics

### Workflow Effectiveness:
- **MTTR Improvement** - Time from incident start to resolution
- **First-Time Fix Rate** - Problems solved without escalation
- **Evidence Quality** - Completeness of diagnostic information
- **Knowledge Reuse** - Incidents matched to existing patterns

### Panic Prevention:
- **Intervention Success** - Panic signals caught and resolved
- **Destructive Action Prevention** - Harmful operations blocked
- **User Satisfaction** - Engineer feedback on workflow helpfulness
- **Learning Acceleration** - Junior engineer skill development

### Emergency Usage:
- **Break-Glass Frequency** - How often emergency overrides used
- **Override Justification** - Quality of emergency reasoning
- **Postmortem Compliance** - Required reviews completed
- **Process Improvement** - Lessons learned from emergencies

## Review and Evolution

Monitor after 3 months:
- **Workflow Compliance** - % of sessions following complete process
- **User Adoption** - Engineer acceptance and usage patterns  
- **False Positives** - Unnecessary panic interventions
- **Process Refinement** - State transitions and evidence requirements optimization
- **Emergency Patterns** - Common reasons for workflow bypassing

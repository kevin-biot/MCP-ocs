# ADR-012: Operational Intelligence Data Model

**Status:** Proposed  
**Date:** August 13, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor), Qwen (Operational Analysis)

## Context

ADR-011 established the Fast RCA Framework requiring sophisticated data structures for operational intelligence. The current memory system (ADR-003) provides foundational storage capabilities but needs extension to support complex operational patterns, incident correlation, and predictive analytics.

### Data Requirements Analysis

**Current Memory System Capabilities (ADR-003):**
- Conversation memory storage and retrieval
- Vector-based similarity search
- JSON fallback for reliability
- Basic context preservation

**Fast RCA Framework Requirements:**
- Complex incident pattern storage and correlation
- Multi-dimensional operational symptom analysis  
- Time-series data for trend analysis and prediction
- Cross-system relationship modeling
- Performance metrics and effectiveness tracking

## Decision

Implement a **Hierarchical Operational Intelligence Data Model** that extends the existing memory system to support complex incident patterns, predictive analytics, and cross-system correlation.

### Core Data Architecture

#### 1. Operational Symptom Model
```typescript
interface OperationalSymptom {
  // Identity and Classification
  id: string;
  timestamp: string;
  source: 'node' | 'pod' | 'service' | 'storage' | 'network' | 'security';
  category: 'resource' | 'performance' | 'availability' | 'security' | 'configuration';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  
  // Symptom Details
  description: string;
  rawData: any;                    // Original diagnostic data
  normalizedMetrics: MetricValue[]; // Standardized measurements
  
  // Context and Relationships
  clusterId: string;
  namespace?: string;
  nodeId?: string;
  podId?: string;
  correlationId?: string;         // Links related symptoms
  
  // Analysis Metadata
  confidence: number;             // 0-1 confidence in symptom accuracy
  impact: ImpactAssessment;       // Assessed operational impact
  tags: string[];                 // Searchable tags
}
```

#### 2. Incident Pattern Model
```typescript
interface IncidentPattern {
  // Pattern Identity
  id: string;
  patternType: string;            // e.g., 'zone_failure_cascade'
  version: number;                // Pattern evolution tracking
  createdAt: string;
  lastUpdated: string;
  
  // Pattern Definition
  triggerSymptoms: SymptomPattern[];    // What starts this pattern
  cascadeSymptoms: SymptomPattern[];    // What follows
  resolutionSymptoms: SymptomPattern[]; // What indicates resolution
  
  // Effectiveness Metrics
  successRate: number;            // 0-1 success rate of this pattern
  averageResolutionTime: number;  // Minutes to resolution
  humanValidationRate: number;    // How often experts agree
  falsePositiveRate: number;      // Incorrect pattern matches
}
```

#### 3. Root Cause Analysis Model
```typescript
interface RootCauseAnalysis {
  // Analysis Identity
  analysisId: string;
  incidentId: string;
  timestamp: string;
  analysisType: 'automated' | 'human' | 'hybrid';
  confidence: number;
  
  // Root Cause Chain
  primaryCause: CauseDefinition;
  contributingCauses: CauseDefinition[];
  cascadeChain: CascadeStep[];
  
  // Evidence and Reasoning
  supportingEvidence: Evidence[];
  eliminatedCauses: EliminatedCause[];
  analyticalReasoning: string;
  
  // Resolution Information
  resolutionSteps: ResolutionStep[];
  preventionMeasures: PreventionMeasure[];
  
  // Validation and Learning
  humanValidated: boolean;
  validationFeedback?: ValidationFeedback;
  learningOutcomes: LearningOutcome[];
}
```

#### 4. Memory Integration Model
```typescript
interface OperationalMemoryEntry extends MemoryEntry {
  // Extends existing ADR-003 memory structure
  
  // Operational Specific Fields
  operationType: 'incident' | 'pattern' | 'prediction' | 'analysis';
  operationalContext: OperationalContext;
  crossReferences: CrossReference[];
  
  // Time Series Data
  timeSeriesData?: TimeSeriesData[];
  temporalRelationships: TemporalRelationship[];
  
  // Correlation Information
  correlatedEntries: CorrelationLink[];
  similarIncidents: SimilarityMatch[];
  
  // Learning Metadata
  learningValue: number;          // How valuable for learning (0-1)
  teachingExamples: string[];     // Good examples for training
  counterExamples: string[];      // Examples of what NOT to do
}
```

### Data Storage Strategy

#### Hierarchical Storage Architecture
```typescript
interface OperationalDataStore {
  // Hot Storage (Recent, Frequently Accessed)
  activeIncidents: IncidentPattern[];        // Last 30 days
  recentSymptoms: OperationalSymptom[];      // Last 7 days
  currentPredictions: PredictionResult[];     // Active predictions
  
  // Warm Storage (Historical, Occasionally Accessed)
  historicalPatterns: IncidentPattern[];      // 6 months
  resolvedIncidents: RootCauseAnalysis[];    // 1 year
  trendData: TimeSeriesData[];               // 90 days
  
  // Cold Storage (Archive, Rarely Accessed)
  archivedIncidents: IncidentPattern[];       // > 1 year
  learningArchive: LearningOutcome[];        // Permanent
  complianceRecords: AuditRecord[];          // Regulatory requirements
}
```

## Consequences

### Positive Outcomes

**✅ Comprehensive Operational Intelligence:**
- **Rich Pattern Recognition**: Complex multi-dimensional incident patterns
- **Predictive Capabilities**: Time-series analysis enables proactive operations
- **Cross-System Correlation**: Understanding of system interdependencies
- **Learning Acceleration**: Structured data enables rapid organizational learning

### Challenges and Risks

**⚠️ Data Complexity:**
- **Storage Requirements**: Rich data model requires significant storage capacity
- **Query Performance**: Complex relationships may impact search performance
- **Data Migration**: Transitioning from simple to complex data model
- **Maintenance Overhead**: Sophisticated data structures require ongoing maintenance

## Success Metrics

### Data Quality Metrics
- **Completeness**: Target 95% of required fields populated for all operational entries
- **Accuracy**: Target 90% accuracy in automated symptom classification
- **Consistency**: Target 99% consistency in cross-field validation checks
- **Timeliness**: Target 90% of operational data available within 1 minute of event

### Performance Metrics
- **Query Performance**: Target sub-500ms response for similarity searches
- **Storage Efficiency**: Target 2:1 compression ratio for time-series data
- **Ingestion Rate**: Target 1000 operational events per minute processing capacity
- **Availability**: Target 99.9% availability for operational data access

## Related ADRs

- **ADR-003**: Memory system foundation (extends)
- **ADR-011**: Fast RCA Framework (enables)
- **ADR-010**: Systemic diagnostic intelligence (supports)
- **ADR-006**: Modular tool architecture (data integration)
- **ADR-007**: Automatic tool memory integration (data collection)

---

**Next Steps:**
1. Data model validation with operational subject matter experts
2. Performance testing with representative operational data volumes
3. Migration planning from current memory system
4. ADR-013 development for automated runbook execution framework
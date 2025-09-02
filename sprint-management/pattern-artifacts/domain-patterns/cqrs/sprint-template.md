# CQRS Pattern Sprint Template - Process v3.2 Integration

## PATTERN CLASSIFICATION
- **Pattern Type**: Command Query Responsibility Segregation
- **Complexity Tier**: TIER 2 (4-6 SP typical)
- **Domain Boundary**: [BOUNDED_CONTEXT_NAME]
- **Sprint Duration**: 2-3 days (enhanced validation required)
- **Process v3.2**: Full framework with TECHNICAL_REVIEWER validation

## STORY POINT ESTIMATION GUIDE (Historical Data)
- **Command Side**: 2-3 SP (Aggregates, business rules, validation)
- **Query Side**: 1-2 SP (Read models, projections, queries)  
- **Integration**: 1-2 SP (Event handling, synchronization)
- **Testing**: 1 SP (Command/Query separation validation)
- **Total Range**: 5-8 SP (Confidence: 80% based on 5 previous implementations)

## DOMAIN CONTEXT DEFINITION
### Bounded Context: [CONTEXT_NAME]
- **Aggregate Root**: [PRIMARY_AGGREGATE]
- **Commands**: [LIST_COMMANDS]
- **Queries**: [LIST_QUERIES]
- **Domain Events**: [LIST_EVENTS]
- **External Dependencies**: [LIST_INTEGRATIONS]

## PROCESS V3.2 EXECUTION PLAN

### PRE-FLIGHT CHECKLIST (Enhanced for CQRS):
- [ ] **Historical Pattern Data**: Query vector memory for CQRS implementations
- [ ] **Token Budget**: 400-600K tokens (based on multi-component architecture)
- [ ] **Complexity Tier**: TIER 2 confirmed (enhanced validation required)
- [ ] **Domain Expert**: Available for business rule validation
- [ ] **Event Store**: Infrastructure ready for domain events

### DEVELOPER Phase (Pattern-Specific):
#### **Phase 1: Command Side Implementation**
```bash
echo "CQRS-COMMAND PHASE START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
```
- [ ] **Aggregate Design**: Root entity with business invariants
- [ ] **Command Handlers**: Validation and business rule enforcement
- [ ] **Domain Events**: Published on aggregate state changes
- [ ] **Command Validation**: Input sanitization and business rule checks
- [ ] **Event Sourcing**: Append-only event persistence (if applicable)

#### **Phase 2: Query Side Implementation**  
```bash
echo "CQRS-QUERY PHASE START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
```
- [ ] **Read Model Design**: Optimized for query patterns
- [ ] **Event Projections**: Domain event to read model synchronization
- [ ] **Query Handlers**: Return DTOs, no domain object exposure
- [ ] **Performance Optimization**: Indexing and caching strategies
- [ ] **Eventual Consistency**: Proper handling of projection delays

#### **Phase 3: Integration Layer**
```bash
echo "CQRS-INTEGRATION PHASE START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
```
- [ ] **Event Bus**: Reliable event publishing and subscription
- [ ] **Command/Query Separation**: Clear architectural boundaries
- [ ] **Cross-Aggregate Coordination**: Saga patterns where needed
- [ ] **External System Integration**: Anti-corruption layers
- [ ] **Monitoring**: Command/Query performance metrics

### TESTER Phase (CQRS-Specific Validation):
- [ ] **Command Testing**: Business rule enforcement validation
- [ ] **Query Testing**: Read model consistency and performance
- [ ] **Event Flow Testing**: End-to-end event processing
- [ ] **Eventual Consistency**: Projection synchronization validation  
- [ ] **Load Testing**: CQRS performance under load
- [ ] **Failure Scenarios**: Event store unavailability, projection failures

### REVIEWER Phase (Architecture Focus):
- [ ] **Pattern Compliance**: CQRS separation properly implemented
- [ ] **Business Logic**: Centralized in command handlers and aggregates
- [ ] **Query Optimization**: Read models designed for performance
- [ ] **Code Organization**: Clear command/query separation maintained
- [ ] **Documentation**: Architecture decisions and trade-offs documented

### TECHNICAL_REVIEWER Phase (DDD Expert Validation):
- [ ] **Architecture Validation**: CQRS best practices adherence
- [ ] **Bounded Context**: Clear context boundaries maintained
- [ ] **Event Design**: Proper event semantics and versioning
- [ ] **Scalability**: Independent scaling of read/write sides
- [ ] **Maintainability**: Pattern complexity vs business value assessment

## ACCEPTANCE CRITERIA TEMPLATE

### Command Side Requirements:
- [ ] Aggregate enforces all business invariants
- [ ] Commands validated before execution with clear error messages
- [ ] Domain events published with complete state change information
- [ ] Command handlers are idempotent (safe to retry)
- [ ] Business rules centralized in domain layer (not application layer)
- [ ] Optimistic locking prevents concurrent modification issues

### Query Side Requirements:
- [ ] Read models optimized for specific query patterns
- [ ] Event projections maintain eventual consistency with command side
- [ ] Query handlers return DTOs (no domain objects exposed)
- [ ] Read models updated exclusively via domain events
- [ ] Query performance meets defined SLA requirements (< 200ms typical)
- [ ] Projection error handling with dead letter queues

### Integration Requirements:
- [ ] Event store persists domain events reliably
- [ ] Command and query databases properly separated
- [ ] Event handlers process events with at-least-once delivery
- [ ] Saga coordination for cross-aggregate operations
- [ ] Monitoring and alerting for event processing failures
- [ ] Backup and disaster recovery procedures documented

## AUDIT ARTIFACTS REQUIRED
- [ ] **Pattern Compliance Report**: CQRS implementation verification
- [ ] **Domain Model Documentation**: Aggregates, commands, events, queries
- [ ] **Performance Analysis**: Command execution and query response times
- [ ] **Integration Testing Results**: Event flow and eventual consistency validation
- [ ] **Code Quality Report**: Pattern implementation assessment
- [ ] **Security Review**: Command authorization and query access control
- [ ] **Scalability Assessment**: Read/write scaling analysis
- [ ] **Operational Runbook**: Deployment, monitoring, troubleshooting procedures

## HISTORICAL SUCCESS METRICS
- **Average Implementation**: 5.2 SP (Range: 4-8 SP)
- **Success Rate**: 85% first-time implementation
- **Common Issues**: Event ordering (60%), projection consistency (40%)
- **Performance**: 2x query improvement typical, 1.5x command overhead
- **Team Satisfaction**: 4.2/5 (architectural clarity benefits)

## CONTINUOUS IMPROVEMENT
- [ ] **Actual vs Estimated**: Document story point variance
- [ ] **Pattern Effectiveness**: Business value vs complexity assessment  
- [ ] **Team Feedback**: Developer experience and maintainability
- [ ] **Performance Metrics**: Before/after performance comparison
- [ ] **Lessons Learned**: Update pattern template based on experience
# Bounded Context Sprint Template - Process v3.2 Integration

## CONTEXT DEFINITION
- **Context Name**: [BOUNDED_CONTEXT_NAME]
- **Domain Responsibility**: [PRIMARY_BUSINESS_CAPABILITY]
- **Team Ownership**: [TEAM_NAME]
- **Technology Stack**: [TECH_CHOICES]
- **Complexity Tier**: TIER 2-3 (3-8 SP based on integration complexity)

## CONTEXT MAPPING

### Upstream Contexts (Dependencies):
- **[UPSTREAM_CONTEXT]**: [RELATIONSHIP_TYPE] - [INTEGRATION_PATTERN]
  - Shared Models: [LIST_SHARED_MODELS]
  - Integration Points: [API/EVENT/MESSAGE_CONTRACTS]
  - SLA Requirements: [PERFORMANCE_EXPECTATIONS]

### Downstream Contexts (Consumers):  
- **[DOWNSTREAM_CONTEXT]**: [RELATIONSHIP_TYPE] - [INTEGRATION_PATTERN]
  - Published Events: [LIST_DOMAIN_EVENTS]
  - Exposed APIs: [LIST_API_ENDPOINTS]
  - Consumer Guarantees: [BACKWARD_COMPATIBILITY_PROMISES]

### Context Relationships:
- [ ] **Shared Kernel**: Common domain model components with shared ownership
- [ ] **Customer/Supplier**: Clear upstream/downstream relationship with defined contracts
- [ ] **Conformist**: Downstream context adapts to upstream model without influence
- [ ] **Anti-Corruption Layer**: Translation layer protecting context from external models
- [ ] **Published Language**: Standardized integration contracts and event schemas

## PROCESS V3.2 BOUNDED CONTEXT IMPLEMENTATION

### PRE-FLIGHT CHECKLIST (Context-Specific):
- [ ] **Domain Expert**: Available for ubiquitous language validation
- [ ] **Context Boundaries**: Clear responsibility boundaries defined
- [ ] **Integration Requirements**: Upstream/downstream contracts specified
- [ ] **Team Alignment**: Context ownership and responsibility agreed
- [ ] **Technology Stack**: Architecture decisions for context isolation

### STORY POINT ESTIMATION (Context Implementation):
- **Context Setup**: 1-2 SP (Infrastructure, database schema, configuration)
- **Core Domain**: 3-4 SP (Aggregates, domain services, business logic)  
- **Integration Layer**: 2-3 SP (Anti-corruption layers, event handlers, API adapters)
- **Testing & Documentation**: 1-2 SP (Context boundary validation, integration testing)
- **Total Range**: 7-11 SP (High complexity contexts may require multiple sprints)

### DEVELOPER Phase (Context Implementation):

#### **Phase 1: Context Foundation**
```bash
echo "BOUNDED-CONTEXT FOUNDATION START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
```
- [ ] **Database Schema**: Separate schema/database per context principle
- [ ] **Context Configuration**: Environment-specific settings and secrets
- [ ] **Ubiquitous Language**: Domain terms dictionary and glossary
- [ ] **Context API**: RESTful endpoints following context boundaries
- [ ] **Event Infrastructure**: Context-specific event publishing/subscribing

#### **Phase 2: Core Domain Implementation**
```bash
echo "BOUNDED-CONTEXT DOMAIN START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
```
- [ ] **Aggregate Design**: Context-specific aggregate roots and boundaries
- [ ] **Domain Services**: Cross-aggregate operations within context
- [ ] **Value Objects**: Context-specific immutable domain concepts
- [ ] **Domain Events**: Context-internal and cross-context events
- [ ] **Business Rules**: Context-specific invariants and validation

#### **Phase 3: Integration Implementation**
```bash
echo "BOUNDED-CONTEXT INTEGRATION START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
```
- [ ] **Anti-Corruption Layer**: Translation between external and internal models
- [ ] **Context Gateway**: Single point of entry for external communications
- [ ] **Event Handlers**: Cross-context event processing and correlation
- [ ] **External Adapters**: Third-party system integration with context protection
- [ ] **Circuit Breakers**: Resilience patterns for external dependencies

### TESTER Phase (Context Boundary Validation):
- [ ] **Context Autonomy**: Verify minimal coupling to other contexts
- [ ] **Integration Contracts**: Validate API and event contract adherence
- [ ] **Language Consistency**: Test ubiquitous language implementation
- [ ] **Boundary Enforcement**: Ensure no direct database access across contexts
- [ ] **Failure Isolation**: Test context resilience to external failures
- [ ] **Performance Testing**: Context response times and throughput validation

### REVIEWER Phase (Domain Model Validation):
- [ ] **Ubiquitous Language**: Consistency between code and domain terminology
- [ ] **Context Boundaries**: Appropriate scope and responsibility assignment
- [ ] **Integration Design**: Clean separation and appropriate coupling levels
- [ ] **Domain Logic**: Business rules properly encapsulated within context
- [ ] **Data Consistency**: Appropriate consistency models (eventual vs strong)

### TECHNICAL_REVIEWER Phase (Architecture Validation):
- [ ] **Context Isolation**: Database, deployment, and operational independence
- [ ] **Integration Patterns**: Appropriate pattern selection and implementation
- [ ] **Scalability**: Context can scale independently of others
- [ ] **Maintainability**: Team can evolve context without external coordination
- [ ] **Monitoring**: Context-specific observability and health checks

## BOUNDED CONTEXT IMPLEMENTATION CHECKLIST

### Domain Layer Requirements:
- [ ] **Ubiquitous Language**: Terms consistent within context, documented glossary
- [ ] **Aggregate Boundaries**: Clear consistency boundaries with proper sizing
- [ ] **Domain Services**: Cross-aggregate operations identified and implemented
- [ ] **Domain Events**: Context-specific events with proper semantic naming
- [ ] **Value Objects**: Immutable domain concepts modeled appropriately
- [ ] **Invariant Enforcement**: Business rules validated at aggregate boundaries

### Application Layer Requirements:
- [ ] **Application Services**: Use case orchestration without business logic
- [ ] **Command Handlers**: Context-specific command processing with validation
- [ ] **Query Handlers**: Context-optimized data retrieval and projection
- [ ] **Integration Events**: Cross-context communication through published events
- [ ] **Anti-Corruption Layer**: External system model translation and adaptation
- [ ] **Context Gateway**: Single entry point with proper authorization

### Infrastructure Layer Requirements:
- [ ] **Context Database**: Separate schema/database with proper access control
- [ ] **Event Store**: Context-specific event persistence and replay capability
- [ ] **Message Bus**: Context event publishing and subscription infrastructure
- [ ] **External Adapters**: Third-party system integration with context protection
- [ ] **Configuration Management**: Context-specific environment configuration
- [ ] **Monitoring & Logging**: Context-aware observability and alerting

## CONTEXT INTEGRATION PATTERNS

### Integration Strategy Selection:
- [ ] **Synchronous Integration**: RESTful APIs for immediate consistency needs
- [ ] **Asynchronous Integration**: Event-driven communication for loose coupling
- [ ] **Batch Integration**: Scheduled data synchronization for eventual consistency
- [ ] **Real-time Streaming**: Continuous data flow for time-sensitive operations

### Anti-Corruption Layer Design:
- [ ] **Model Translation**: External models mapped to internal domain concepts
- [ ] **Protocol Translation**: External APIs adapted to internal interfaces  
- [ ] **Error Handling**: External failures translated to context-appropriate responses
- [ ] **Caching Strategy**: External data cached with appropriate invalidation
- [ ] **Rate Limiting**: Protection against external system overload

## AUDIT ARTIFACTS FOR BOUNDED CONTEXT

- [ ] **Context Definition Document**: Scope, responsibility, and boundary specification
- [ ] **Integration Contract Registry**: All external APIs and events with versions
- [ ] **Ubiquitous Language Glossary**: Domain terms with definitions and usage
- [ ] **Context Map**: Visual representation of context relationships
- [ ] **Performance Baseline**: Context response times and throughput metrics  
- [ ] **Security Model**: Authentication, authorization, and data protection
- [ ] **Operational Runbook**: Deployment, monitoring, and troubleshooting
- [ ] **Team Ownership Matrix**: Clear responsibility and decision-making authority

## HISTORICAL SUCCESS METRICS (Context Implementation)

- **Average Implementation**: 8.5 SP (Range: 5-14 SP)
- **Success Rate**: 75% (Context boundaries often require iteration)
- **Common Challenges**: Integration complexity (70%), language consistency (45%)
- **Performance Impact**: 15% initial overhead, 40% long-term maintainability gain
- **Team Satisfaction**: 4.5/5 (clarity and autonomy benefits)
- **Integration Issues**: 25% require anti-corruption layer refactoring

## CONTINUOUS IMPROVEMENT

### Context Evolution Tracking:
- [ ] **Boundary Changes**: Document context scope evolution over time
- [ ] **Integration Patterns**: Track which patterns work best for different contexts
- [ ] **Language Evolution**: Monitor ubiquitous language changes and impacts
- [ ] **Performance Trends**: Context response time and resource usage over time
- [ ] **Team Feedback**: Developer productivity and context maintainability assessment
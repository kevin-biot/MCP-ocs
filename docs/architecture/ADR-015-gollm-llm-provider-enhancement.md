# ADR-015: gollm Multi-Provider LLM Enhancement

**Date:** 2025-08-22  
**Status:** Proposed  
**Deciders:** Architecture Team  
**Technical Story:** Enhance MCP-ocs with enterprise-grade multi-provider LLM capabilities

## Context

MCP-ocs currently relies on single LLM provider integration for template routing, rubric evaluation, and evidence synthesis. As we move toward production deployment on OpenShift clusters, we face several limitations:

1. **Provider Lock-in Risk**: Single point of failure if provider experiences outages
2. **Enterprise Compliance**: Need for Azure OpenAI in regulated environments
3. **Cost Optimization**: Inability to route simple tasks to cost-effective providers
4. **Quality Validation**: No cross-provider consensus for critical decisions
5. **Future Scalability**: Limited flexibility for expanding to new cloud providers

The **gollm library** (github.com/GoogleCloudPlatform/kubectl-ai/gollm) offers a unified interface for multiple LLM providers with features specifically designed for Kubernetes tooling, including function calling, schema constraints, and retry logic.

## Decision

We will **integrate gollm as the LLM abstraction layer** for MCP-ocs, replacing direct provider integrations while preserving our proven template-rubric architecture.

### Core Integration Points

1. **Template Routing Enhancement**
   - Replace static pattern matching with gollm function calling
   - Intelligent query classification with confidence scoring
   - Parameter extraction from natural language queries

2. **Automated Rubric Evaluation**
   - Schema-constrained rubric scoring for consistency
   - Multi-provider consensus validation for critical decisions
   - Parallel evaluation across providers for quality assurance

3. **Evidence Synthesis Intelligence**
   - AI-enhanced pattern recognition in collected evidence
   - Cross-reference analysis beyond simple selectors
   - Confidence assessment for evidence completeness

4. **Enterprise Multi-Provider Support**
   - Primary: Azure OpenAI for enterprise compliance
   - Secondary: Google Gemini for cost-effective operations
   - Tertiary: Local Ollama for air-gapped deployments
   - Fallback: OpenAI for development environments

## Implementation Strategy

### Phase 1: Foundation (Months 1-2)
```go
// Create gollm client factory
clientFactory := &LLMClientFactory{
    providers: map[string]Provider{
        "azure":   NewAzureOpenAIProvider(),
        "gemini":  NewGeminiProvider(),
        "ollama":  NewOllamaProvider(),
        "openai":  NewOpenAIProvider(),
    },
    primaryProvider: "azure",
    fallbackChain: []string{"gemini", "openai"},
}
```

### Phase 2: Template Integration (Months 2-3)
```typescript
// Enhanced template router with gollm
interface TemplateRoutingFunction {
  name: "classify_diagnostic_intent";
  description: "Map engineer query to template and parameters";
  parameters: {
    target: TriageTarget;
    confidence: number;
    extracted_vars: Record<string, any>;
  };
}
```

### Phase 3: Rubric Automation (Months 3-4)
```go
// Schema-constrained rubric evaluation
rubricSchema := &gollm.Schema{
    Type: gollm.TypeObject,
    Properties: map[string]*gollm.Schema{
        "triage_priority": {Type: gollm.TypeNumber, Minimum: 1, Maximum: 5},
        "evidence_confidence": {Type: gollm.TypeNumber, Minimum: 0, Maximum: 1},
        "remediation_safety": {Type: gollm.TypeString, Enum: []string{"safe", "caution", "dangerous"}},
    },
    Required: []string{"triage_priority", "evidence_confidence", "remediation_safety"},
}
```

### Phase 4: Advanced Features (Months 4-6)
- Cross-provider consensus for critical decisions
- Cost-optimized provider routing based on task complexity
- Streaming responses for real-time diagnostics
- Function calling integration with existing MCP tools

## Architectural Preservation

### What Remains Unchanged
- ✅ **Deterministic Templates**: Fixed step sequences preserved
- ✅ **Evidence Contracts**: Selector-based evidence collection unchanged
- ✅ **Rubric Registry**: 32 specialized rubrics maintained
- ✅ **Tool Execution**: MCP tool interface preserved
- ✅ **Audit Trail**: Complete traceability maintained

### What Gets Enhanced
- 🚀 **Intelligent Routing**: Better query → template mapping
- 📊 **Consistent Scoring**: Automated rubric evaluation
- 🔍 **Evidence Intelligence**: AI-enhanced pattern recognition
- 🛡️ **Enterprise Resilience**: Multi-provider failover
- 💰 **Cost Optimization**: Smart provider selection

## Technical Specifications

### Provider Configuration
```yaml
gollm:
  providers:
    azure_openai:
      endpoint: "${AZURE_OPENAI_ENDPOINT}"
      api_key: "${AZURE_OPENAI_API_KEY}"
      deployment: "gpt-4"
      priority: 1
    
    google_gemini:
      endpoint: "generativelanguage.googleapis.com"
      api_key: "${GOOGLE_API_KEY}"
      model: "gemini-pro"
      priority: 2
    
    ollama_local:
      endpoint: "http://localhost:11434"
      model: "llama3.1:8b"
      priority: 3
      use_cases: ["air_gapped", "development"]
```

### Function Integration
```go
// MCP tools become gollm-callable functions
mcpToolFunction := &gollm.FunctionDefinition{
    Name: "oc_diagnostic_pod_health",
    Description: "Analyze OpenShift pod health via MCP tool",
    Parameters: &gollm.Schema{
        Type: gollm.TypeObject,
        Properties: map[string]*gollm.Schema{
            "namespace": {Type: gollm.TypeString},
            "podName": {Type: gollm.TypeString},
            "sessionId": {Type: gollm.TypeString},
        },
    },
}
```

## Risk Assessment

### Technical Risks
- **Integration Complexity**: gollm adds new dependency layer
  - *Mitigation*: Gradual rollout with fallback to current implementation
- **Provider API Changes**: Multiple providers increase maintenance
  - *Mitigation*: gollm abstracts provider differences
- **Performance Impact**: Additional abstraction layer overhead
  - *Mitigation*: Connection pooling and caching strategies

### Operational Risks
- **Multi-Provider Authentication**: Complex credential management
  - *Mitigation*: Kubernetes secrets with rotation policies
- **Cost Management**: Multiple providers complicate billing
  - *Mitigation*: Usage tracking and provider routing policies
- **Compliance Variations**: Different providers have different compliance features
  - *Mitigation*: Provider selection based on compliance requirements

## Success Criteria

### Functional Success
- [ ] All existing templates work identically with gollm integration
- [ ] Rubric evaluation shows ≥95% consistency across providers
- [ ] Template routing accuracy improves by ≥20% over pattern matching
- [ ] Evidence synthesis provides meaningful insights beyond raw data

### Non-Functional Success
- [ ] ≤200ms additional latency per LLM call compared to direct integration
- [ ] ≥99.9% availability through multi-provider failover
- [ ] ≤30% cost increase through optimized provider routing
- [ ] Zero security regressions in enterprise environments

### Operational Success
- [ ] Successful deployment in production OpenShift clusters
- [ ] Engineer adoption with no workflow disruption
- [ ] Compliance approval for Azure OpenAI in regulated environments
- [ ] Monitoring and alerting for multi-provider health

## Decision Rationale

### Why gollm?
1. **Kubernetes-Native**: Built specifically for kubectl-ai, understands our use case
2. **Proven Architecture**: Battle-tested unified interface for multiple providers
3. **Function Calling**: Native support for our MCP tool integration pattern
4. **Schema Constraints**: Essential for consistent rubric evaluation
5. **Enterprise Features**: SSL configuration, retry logic, provider failover

### Why Not Alternatives?
- **LangChain**: Too heavyweight, designed for different use cases
- **Direct Integration**: Maintains provider lock-in and complexity
- **Custom Abstraction**: Reinventing proven patterns, higher maintenance

### Strategic Alignment
- **Enterprise Readiness**: Azure OpenAI support for production compliance
- **Cost Efficiency**: Smart provider routing for different task complexities
- **Operational Resilience**: Multi-provider failover eliminates single points of failure
- **Future Flexibility**: Foundation for expanding to new cloud providers and local models

## Consequences

### Positive
- **Enhanced Reliability**: Multi-provider failover prevents outages
- **Enterprise Compliance**: Azure OpenAI enables regulated industry adoption
- **Cost Optimization**: Route simple tasks to cost-effective providers
- **Quality Improvement**: Cross-provider consensus for critical decisions
- **Future Flexibility**: Easy integration of new providers and models

### Negative
- **Increased Complexity**: More moving parts in the system
- **Credential Management**: Multiple API keys and authentication mechanisms
- **Testing Overhead**: Need to validate across multiple providers
- **Potential Cost Increase**: Multi-provider calls for consensus validation

### Neutral
- **Learning Curve**: Team needs to understand gollm patterns
- **Migration Effort**: Gradual transition from current implementation
- **Monitoring Enhancement**: Need provider-specific observability

## Related ADRs
- **ADR-014**: Deterministic Template Engine (foundation for gollm integration)
- **ADR-003**: Memory Patterns (enhanced with multi-provider consensus storage)
- **ADR-006**: Modular Tool Architecture (gollm functions as modular components)
- **ADR-016**: Multi-Tenancy and Session Management (authentication for multiple providers)

## Implementation Notes

### Development Approach
1. **Proof of Concept**: Single provider integration with existing template
2. **Parallel Implementation**: Build gollm layer alongside current system
3. **Gradual Migration**: Template-by-template transition with A/B testing
4. **Full Deployment**: Complete migration with monitoring and rollback capability

### Testing Strategy
- **Unit Tests**: Mock gollm providers for deterministic testing
- **Integration Tests**: Real provider calls with test credentials
- **Load Tests**: Multi-provider performance under realistic loads
- **Chaos Tests**: Provider failure scenarios and failover validation

This ADR establishes gollm as the **enterprise-grade LLM foundation** for MCP-ocs while preserving our proven template-rubric architecture and enabling future multi-cloud expansion.

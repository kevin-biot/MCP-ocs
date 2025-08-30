# ADR-020: Risk-Based Security Development Guidelines

**Status**: Draft  
**Date**: 2025-08-30  
**Author**: Development Process Analysis  
**Reviewers**: [TBD]  

---

## Context

Analysis of the MCP-ocs codebase revealed systematic security gaps across 50+ trust boundaries, indicating that the current development process lacks sufficient security guardrails. The TypeScript code review identified not just individual bugs, but a systematic pattern where security considerations are not integrated into the development workflow.

**Root Cause**: Development flow lacks architectural security constraints:
```
Current: Feature Request → Code Implementation → Deploy
Required: Feature Request → Security Analysis → Architecture Check → Secure Implementation → Validation → Deploy
```

This ADR establishes risk-based security development guidelines that provide appropriate rigor based on actual security risk while maintaining development velocity.

---

## Decision

We adopt a **risk-based security development framework** with tiered enforcement:

- **P0 Security Issues**: Mandatory hard gates with required checklists
- **P1 Security Issues**: Advisory guidance with strong warnings  
- **P2 Security Issues**: Best practices recommendations

This approach balances security rigor with development flexibility based on actual risk assessment.

---

## Risk Classification

### P0 - Critical Security (Mandatory Hard Gates)

**Scope**: Features that handle untrusted external input or provide privileged access

**Requirements**:
- Trust boundary analysis MUST be completed before implementation
- Input validation schemas MUST be defined and implemented  
- Authentication/authorization MUST be implemented before business logic
- Rate limiting MUST be considered for external endpoints
- Error boundaries MUST use proper HTTP status codes
- Security testing MUST include negative test cases

**Examples**:
- HTTP endpoints accepting external requests
- Tool execution with user-provided parameters
- File upload or data import functionality
- Authentication and session management
- Environment variable processing

### P1 - High Security (Advisory with Warnings)

**Scope**: Features that process trusted input or internal system operations

**Requirements**:
- Input validation SHOULD be implemented with clear justification if omitted
- Error handling SHOULD follow structured patterns
- Logging SHOULD avoid PII exposure
- Dependencies SHOULD be security-audited
- Testing SHOULD include boundary condition validation

**Examples**:
- Internal API endpoints
- Template processing systems
- Memory and storage operations
- Inter-service communication
- Configuration management

### P2 - Standard Security (Best Practices Guidance)

**Scope**: Features with limited security exposure or internal utilities

**Requirements**:
- Follow established coding patterns and conventions
- Include basic error handling
- Use consistent logging patterns
- Follow dependency management best practices

**Examples**:
- Utility functions and helpers
- Data formatting and transformation
- UI components without external data
- Development and testing utilities

---

## Implementation Guidelines

### Pre-Development Phase (All Risk Levels)

**Security Boundary Analysis**:
1. Identify all external input sources
2. Map data flow through trust boundaries  
3. Assess potential attack vectors
4. Determine appropriate risk classification

**Validation Requirements Planning**:
1. Define input validation schemas
2. Specify error handling requirements
3. Plan authentication/authorization needs
4. Consider rate limiting and abuse prevention

### Development Phase Guardrails

#### P0 Requirements (Mandatory Checklist):

**Input Validation**:
- [ ] All external input validated using Zod schemas
- [ ] No direct JSON.parse() without validation
- [ ] Input sanitization implemented before processing
- [ ] File upload restrictions and validation in place

**Authentication & Authorization**:
- [ ] Authentication middleware implemented
- [ ] Authorization checks before privileged operations
- [ ] Session management follows security best practices
- [ ] Rate limiting configured for external endpoints

**Error Handling**:
- [ ] Structured error classes used (not throw strings)
- [ ] Proper HTTP status codes returned
- [ ] Error messages do not leak sensitive information
- [ ] Error boundaries prevent application crashes

**Security Testing**:
- [ ] Negative tests for malformed input
- [ ] Authentication bypass attempts tested
- [ ] Rate limiting effectiveness validated
- [ ] Injection attack vectors tested

#### P1 Guidelines (Advisory):

**Input Processing**:
- Use validation schemas where practical
- Implement defensive programming patterns
- Log processing errors for monitoring
- Consider input size limitations

**Error Management**:
- Follow consistent error response formats
- Implement appropriate logging levels
- Avoid exposing internal system details
- Handle failures gracefully

#### P2 Recommendations (Best Practices):

**Code Quality**:
- Follow established TypeScript patterns
- Use consistent naming conventions
- Include appropriate documentation
- Implement basic error handling

### Post-Development Validation

#### Daily Validation (Risk-Based Enforcement):

**P0 Tasks**: Cannot proceed without security checklist completion
- Manual security review of all trust boundaries
- Verification of validation schema implementation
- Authentication testing with unauthorized requests
- Confirmation of proper error handling

**P1 Tasks**: Advisory warnings if security guidelines not followed
- Review of input processing patterns
- Validation of error handling consistency
- Assessment of logging and monitoring coverage

**P2 Tasks**: Best practices review and recommendations
- Code pattern consistency review
- Basic error handling verification

#### Weekly Validation (Comprehensive Review):

**Security Quality Assessment**:
- Review all completed security implementations
- Assess pattern consistency across implementations
- Identify emerging security risks or gaps
- Update risk classifications based on implementation learnings

**Process Improvement**:
- Analyze security implementation velocity and quality
- Identify recurring security issues or patterns
- Recommend process adjustments or additional guidelines
- Update security training and documentation needs

---

## Integration with Development Process

### Daily Standup Integration

**Standup Process v3** includes security risk assessment:
1. Review available backlog tasks for security risk classification
2. Apply appropriate enforcement level (mandatory/advisory/guidance)
3. Generate security-integrated Codex prompts with required guardrails
4. Track security validation completion alongside task progress

### Weekly Review Cycle

**Human Analysis Phase**:
- Review security implementation quality vs requirements
- Assess compliance with mandatory vs advisory guidelines
- Identify security technical debt or emerging risks
- Document findings for scrum master processing

**Scrum Master Processing**:
- Analyze security patterns and quality trends
- Update backlog priorities based on security discoveries
- Adjust risk classifications based on implementation experience
- Generate updated security guidance for development team

---

## Enforcement Mechanisms

### Development Tool Integration

**Codex Briefing Requirements**:
- P0 tasks include mandatory security checklist in prompts
- P1 tasks include advisory warnings and recommended patterns
- P2 tasks include best practices guidance and references

**Template Integration**:
- Security validation templates for common patterns
- Input validation boilerplate with Zod schemas
- Authentication middleware templates
- Structured error handling patterns

### Quality Gates

**Pre-Commit Validation**:
- P0 tasks require security checklist confirmation
- Automated validation schema presence checking
- Basic security pattern validation

**Pre-Deploy Review**:
- Weekly security review covers all P0/P1 implementations
- Security technical debt assessment
- Pattern consistency validation across implementations

---

## Success Metrics

**Security Implementation Quality**:
- P0 tasks: 100% compliance with mandatory checklists
- P1 tasks: >90% adherence to advisory guidelines  
- P2 tasks: Consistent application of best practices

**Development Velocity**:
- Security checklist completion time for P0 tasks
- Advisory guideline adoption rate for P1 tasks
- Developer feedback on guideline clarity and usefulness

**Risk Reduction**:
- Reduction in security vulnerabilities over time
- Decreased security technical debt accumulation
- Improved security pattern consistency

---

## Consequences

### Positive Outcomes

- **Systematic Security**: Security considerations integrated into every development decision
- **Risk-Appropriate Rigor**: Resources focused on highest-risk areas
- **Developer Guidance**: Clear expectations and patterns for secure development
- **Quality Assurance**: Regular validation prevents security debt accumulation

### Potential Challenges

- **Process Overhead**: Additional validation requirements may slow development
- **Judgment Requirements**: Risk classification requires security knowledge and experience
- **Consistency Maintenance**: Requires ongoing attention to maintain guideline effectiveness

### Mitigation Strategies

- **Training and Documentation**: Comprehensive security patterns and examples
- **Tool Integration**: Automated validation and guidance where possible  
- **Feedback Loops**: Regular process evaluation and improvement
- **Graduated Implementation**: Phase in requirements to allow team adaptation

---

## References

- **TypeScript Security Review**: 14 domain analysis revealing systematic security gaps
- **Trust Boundary Analysis**: 50+ unvalidated entry points requiring systematic remediation
- **Development Process Analysis**: Root cause assessment of security anti-patterns
- **Standup Process v3**: Security-integrated daily development workflow

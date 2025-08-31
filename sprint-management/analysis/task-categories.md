# Task Categories for Velocity Study

## Category A: Pure Cognitive Tasks
**Definition**: Tasks requiring analysis, design, or documentation with minimal external dependencies

**Characteristics**:
- Primary constraint is cognitive processing time
- Can be completed with existing knowledge and tools
- Output is code, documentation, or architectural decisions
- Minimal waiting for external systems

**Examples**:
- Code analysis and refactoring
- Architectural design documents
- Documentation writing
- Algorithm implementation
- Data structure design
- Configuration file creation

**Expected AI Velocity**: 3-5x traditional human development
**Measurement Focus**: Time from task start to deliverable creation

---

## Category B: Integration/Environmental Tasks
**Definition**: Tasks requiring interaction with external systems, cluster access, or environmental setup

**Characteristics**:
- Mixed cognitive and environmental constraints
- Requires access to live systems or external tools
- May involve waiting for system responses
- Integration testing required

**Examples**:
- Cluster diagnostic analysis
- System configuration changes
- Tool integration and testing
- Environment setup and validation
- Performance testing with real systems
- Cross-system workflow implementation

**Expected AI Velocity**: 1-2x traditional development (limited by environmental constraints)
**Measurement Focus**: Total pipeline time including system interaction overhead

---

## Category C: Validation/Coordination Tasks
**Definition**: Tasks requiring human judgment, review, or coordination between multiple parties

**Characteristics**:
- Human decision-making required
- Communication or approval workflows
- Quality assessment requiring domain expertise
- Risk evaluation or strategic decisions

**Examples**:
- Code review and approval
- Strategic planning decisions
- Risk assessment for production changes
- Stakeholder coordination
- Manual testing and validation
- Process design requiring human input

**Expected AI Velocity**: <1x traditional development (human-constrained)
**Measurement Focus**: Human active time vs. coordination overhead

---

## Classification Guidelines

### How to Classify Mixed Tasks
1. **Primary Constraint Rule**: Classify based on the most limiting factor
2. **Time Distribution**: If >60% of time is spent on one category, use that classification
3. **Critical Path**: Focus on what determines completion time

### Boundary Cases
- **AI-assisted human decisions**: Category C (human judgment required)
- **Automated testing with manual validation**: Category B (environmental + validation mix)
- **Documentation requiring system investigation**: Category A if system access is read-only, Category B if system changes required

### Task Splitting
If a task spans multiple categories significantly:
1. Consider splitting into subtasks
2. Track each subtask separately  
3. Analyze category-specific velocity patterns

This classification system enables measurement of AI velocity gains across different constraint types while maintaining objective categorization criteria.

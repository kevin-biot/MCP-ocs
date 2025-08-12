# Workflow Guides

Diagnostic procedures and templates for structured OpenShift troubleshooting with Auto-Memory Intelligence.

## Available Guides

### 🧠 [Engineer Workflow Guide: Auto-Memory Diagnostic System](../engineer-workflow-guide.md)
**NEW in v0.3.0** - Complete guide to context-aware diagnostics with automatic pattern recognition
- **Context-First Diagnostics**: How engineers benefit from automatic memory integration
- **Pattern Recognition**: Understanding student04 CI/CD artifacts, cluster degraded states, etc.
- **Real UI Examples**: Before/after workflows showing 15-20 minute time savings
- **Advanced Workflows**: RCA with historical context, multi-namespace analysis
- **Best Practices**: Trust but verify, session IDs, pattern override procedures

## Coming Soon

### Diagnostic Workflows
- **Pod Troubleshooting** - CrashLoopBackOff, ImagePullBackOff, OOMKilled (enhanced with auto-memory)
- **Network Diagnostics** - Service connectivity, DNS resolution, ingress issues
- **Resource Problems** - CPU/Memory pressure, storage issues, quota limits
- **Security Context** - RBAC failures, SCC violations, permission denied

### Incident Response Templates  
- **Severity Classification** - Critical, High, Medium, Low impact assessment (with historical patterns)
- **Escalation Procedures** - When and how to involve senior engineers
- **Communication Templates** - Status updates and stakeholder notifications
- **Postmortem Templates** - Root cause analysis and prevention planning

### Best Practices
- **Evidence Collection** - What data to gather before making changes
- **Change Management** - Approval workflows and rollback procedures  
- **Knowledge Capture** - Auto-captured via memory system + manual documentation
- **Cross-team Learning** - Sharing insights and patterns via auto-memory integration

## Workflow Structure

Each workflow includes:
- **Symptoms:** Observable problems and error messages
- **Investigation Steps:** Systematic diagnostic approach with auto-memory context
- **Common Causes:** Frequent root causes and solutions (auto-recognized patterns)
- **Prevention:** How to avoid similar issues
- **Memory Tags:** Keywords for automatic pattern recognition and future context
- **Historical Context:** Previous similar incidents and their resolutions

## Auto-Memory Integration Features

### Context-Aware Workflows
All diagnostic workflows now benefit from:
- **Pre-execution Context**: "🧠 Found 3 relevant past experiences"
- **Pattern Recognition**: Automatic identification of known issues
- **Engineer Guidance**: Clear recommendations based on historical data
- **Automatic Learning**: Every workflow execution improves future diagnostics

### Smart Pattern Detection
- **student04_pattern**: CI/CD artifacts, not broken applications
- **cluster_degraded**: Often normal during maintenance windows
- **pvc_pending**: Distinguish infrastructure issues from unused templates
- **pods_succeeded_not_ready**: Build pipeline completion, not application failure

---

*For technical details on the Auto-Memory system, see [ADR-007](../decisions/ADR-007-automatic-tool-memory-integration.md)*

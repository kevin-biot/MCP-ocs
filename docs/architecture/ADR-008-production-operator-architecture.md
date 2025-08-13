# ADR-008: Production Operator Architecture

**Status:** Proposed  
**Date:** August 13, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor)

## Context

MCP-ocs currently operates as a single-user laptop application using `oc` CLI commands and local filesystem storage. To support production team environments, we need an OpenShift Operator deployment with multi-pod architecture, external memory services, and RBAC-constrained operations.

### Current Single-User Architecture Limitations
- **Local Dependencies** - Requires `oc` binary and kubeconfig on laptop
- **No Multi-User Support** - Single person can use the system
- **Local Memory Storage** - ChromaDB and JSON files on local filesystem
- **Personal Credentials** - Uses developer's personal cluster access
- **No Audit Trail** - Operations not centrally logged or controlled

### Production Requirements
- **Multi-Pod Deployment** - Scalable operator-managed architecture
- **External Memory Services** - Vector memory and RAG in separate pods
- **RBAC Security** - Role-based permissions for different engineer levels
- **GitOps Integration** - All changes must flow through Git workflow
- **Emergency Procedures** - House-burning-down scenarios with capture/reconciliation
- **Audit Compliance** - Full operational audit trail for enterprise compliance

## Decision

**Multi-Pod Operator Architecture with External Memory Services**

### Core Architecture Principles

1. **Separation of Concerns** - MCP server, memory, and GitOps in separate pods
2. **Minimal Permissions** - Each component has only required RBAC permissions
3. **External Memory** - Vector and RAG databases deployed as separate services
4. **GitOps First** - All changes flow through Git unless emergency override
5. **Emergency Capture** - Real-time capture of emergency changes with mandatory reconciliation

## Detailed Design

### Multi-Pod Architecture

```yaml
# MCP-OCS Operator Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-ocs-server
  namespace: mcp-ocs-system
spec:
  replicas: 2  # HA deployment
  template:
    spec:
      serviceAccountName: mcp-ocs-server
      containers:
      - name: mcp-server
        image: mcp-ocs:v0.5.0
        env:
        - name: VECTOR_MEMORY_URL
          value: "http://chroma-service.mcp-ocs-system:8000"
        - name: RAG_DATABASE_URL
          value: "http://rag-service.mcp-ocs-system:5432"
        - name: GITOPS_CONTROLLER_URL
          value: "http://gitops-service.mcp-ocs-system:8080"
        - name: DEPLOYMENT_MODE
          value: "operator"
        - name: AUTH_MODE
          value: "rbac"
        ports:
        - containerPort: 3000
          name: mcp-stdio
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"

---
# Vector Memory Service (ChromaDB)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vector-memory
  namespace: mcp-ocs-system
spec:
  template:
    spec:
      containers:
      - name: chroma
        image: chromadb/chroma:0.4.15
        ports:
        - containerPort: 8000
        volumeMounts:
        - name: vector-storage
          mountPath: /chroma/data
        resources:
          requests:
            memory: "512Mi"
            cpu: "200m"
      volumes:
      - name: vector-storage
        persistentVolumeClaim:
          claimName: vector-memory-pvc

---
# RAG Knowledge Base Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rag-database
  namespace: mcp-ocs-system
spec:
  template:
    spec:
      containers:
      - name: rag-db
        image: postgres:15
        env:
        - name: POSTGRES_DB
          value: "rag_knowledge"
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: rag-credentials
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: rag-credentials
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: rag-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: rag-storage
        persistentVolumeClaim:
          claimName: rag-database-pvc

---
# GitOps Controller Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gitops-controller
  namespace: mcp-ocs-system
spec:
  template:
    spec:
      serviceAccountName: gitops-controller
      containers:
      - name: gitops
        image: mcp-ocs-gitops:v0.5.0
        env:
        - name: GIT_REPOSITORY_URL
          valueFrom:
            secretKeyRef:
              name: git-credentials
              key: repository-url
        - name: GIT_TOKEN
          valueFrom:
            secretKeyRef:
              name: git-credentials
              key: token
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "128Mi"
            cpu: "50m"
```

### Component Responsibilities

```typescript
interface ProductionArchitecture {
  mcpServer: {
    role: 'MCP protocol server + tool orchestration';
    permissions: 'ReadOnlyClusterAccess + GitOpsPRCreation';
    responsibilities: [
      'User authentication and authorization',
      'Tool execution coordination', 
      'Workflow state management',
      'Emergency change capture'
    ];
    dependencies: ['vector-memory-service', 'rag-service', 'gitops-controller'];
    noDirectClusterWrites: true;
  };
  
  vectorMemoryService: {
    role: 'Operational memory and conversation storage';
    deployment: 'ChromaDB pod with persistent volume';
    permissions: 'None - internal service only';
    storage: 'PersistentVolume for vector embeddings';
    responsibilities: [
      'Conversation memory storage and retrieval',
      'Operational pattern recognition',
      'Similar incident correlation',
      'Memory analytics and insights'
    ];
  };
  
  ragDatabaseService: {
    role: 'Knowledge base and documentation storage';
    deployment: 'PostgreSQL pod with persistent volume';
    permissions: 'None - internal service only';
    storage: 'PersistentVolume for knowledge base';
    responsibilities: [
      'Technical documentation storage',
      'Best practices and procedures',
      'Regulatory compliance knowledge',
      'Advanced RAG query processing'
    ];
  };
  
  gitopsController: {
    role: 'Change management and Git integration';
    permissions: 'Git repository write + PR creation';
    responsibilities: [
      'Change request creation and tracking',
      'Emergency change capture',
      'Git repository synchronization',
      'Compliance audit trail generation'
    ];
  };
}
```

### Storage Strategy

```yaml
# Vector Memory Persistent Volume
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: vector-memory-pvc
  namespace: mcp-ocs-system
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 20Gi
  storageClassName: fast-ssd

---
# RAG Database Persistent Volume  
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: rag-database-pvc
  namespace: mcp-ocs-system
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 50Gi
  storageClassName: fast-ssd

---
# GitOps Repository Cache
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: gitops-cache-pvc
  namespace: mcp-ocs-system
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard
```

## Security and RBAC Integration

### Service Account Strategy

```yaml
# MCP Server ServiceAccount - Minimal Read Access
apiVersion: v1
kind: ServiceAccount
metadata:
  name: mcp-ocs-server
  namespace: mcp-ocs-system

---
# GitOps Controller ServiceAccount - Git Integration Only
apiVersion: v1
kind: ServiceAccount  
metadata:
  name: gitops-controller
  namespace: mcp-ocs-system

---
# Cluster Role for MCP Server - Read-Only
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: mcp-ocs-readonly
rules:
- apiGroups: [""]
  resources: ["pods", "services", "events", "nodes", "namespaces"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets", "daemonsets"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["route.openshift.io"]
  resources: ["routes"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["image.openshift.io"]
  resources: ["imagestreams", "imagestreamtags"]
  verbs: ["get", "list", "watch"]
# NO write permissions - all writes via GitOps

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: mcp-ocs-readonly-binding
subjects:
- kind: ServiceAccount
  name: mcp-ocs-server
  namespace: mcp-ocs-system
roleRef:
  kind: ClusterRole
  name: mcp-ocs-readonly
  apiGroup: rbac.authorization.k8s.io
```

### Network Policies

```yaml
# Restrict pod-to-pod communication
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mcp-ocs-network-policy
  namespace: mcp-ocs-system
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  # Allow MCP server to access memory services
  - from:
    - podSelector:
        matchLabels:
          app: mcp-ocs-server
    ports:
    - protocol: TCP
      port: 8000  # ChromaDB
    - protocol: TCP  
      port: 5432  # PostgreSQL
    - protocol: TCP
      port: 8080  # GitOps
  egress:
  # Allow access to Kubernetes API
  - to: []
    ports:
    - protocol: TCP
      port: 443
  # Allow Git repository access
  - to: []
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 22
```

## Kubernetes API Migration Strategy

### Mandatory API Client Implementation

```typescript
// NO oc CLI in production pods - K8s API only
class ProductionClusterClient implements ClusterClient {
  private k8sApi: k8s.CoreV1Api;
  private appsApi: k8s.AppsV1Api;
  private openShiftApi: OpenShiftApiClient;
  
  constructor() {
    // ServiceAccount token authentication
    const kc = new k8s.KubeConfig();
    kc.loadFromCluster(); // Uses ServiceAccount token
    
    this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    this.appsApi = kc.makeApiClient(k8s.AppsV1Api);
    this.openShiftApi = new OpenShiftApiClient(kc);
  }
  
  async getPods(namespace: string): Promise<Pod[]> {
    // Direct API call - no shell execution
    const response = await this.k8sApi.listNamespacedPod(namespace);
    return response.body.items;
  }
  
  async getRoutes(namespace: string): Promise<Route[]> {
    // OpenShift-specific API extension
    const response = await this.openShiftApi.routes.list(namespace);
    return response.items;
  }
  
  // NO write operations - all writes via GitOps
  async applyConfig(config: any): Promise<ChangeRequest> {
    return await this.gitopsController.createChangeRequest({
      changes: config,
      requester: this.getCurrentUser(),
      justification: 'Configuration change request'
    });
  }
}
```

### OpenShift API Extensions

```typescript
class OpenShiftApiClient {
  constructor(private kubeConfig: k8s.KubeConfig) {}
  
  // OpenShift-specific resource access
  async getRoutes(namespace: string): Promise<any> {
    return await this.makeRequest(
      'GET', 
      `/apis/route.openshift.io/v1/namespaces/${namespace}/routes`
    );
  }
  
  async getImageStreams(namespace: string): Promise<any> {
    return await this.makeRequest(
      'GET',
      `/apis/image.openshift.io/v1/namespaces/${namespace}/imagestreams`
    );
  }
  
  async getBuildConfigs(namespace: string): Promise<any> {
    return await this.makeRequest(
      'GET',
      `/apis/build.openshift.io/v1/namespaces/${namespace}/buildconfigs`
    );
  }
}
```

## Change Management Integration

### GitOps-First Architecture

```typescript
interface ChangeManagementFlow {
  discovery: {
    tools: 'All diagnostic tools available';
    permissions: 'Read-only cluster access';
    output: 'Evidence and analysis in memory system';
  };
  
  analysis: {
    tools: 'Memory search, pattern matching, RAG queries';
    permissions: 'Vector memory and knowledge base access';
    output: 'Root cause hypothesis with supporting evidence';
  };
  
  solutionDesign: {
    tools: 'GitOps change request creation';
    permissions: 'Git repository PR creation';
    output: 'Pull request with proposed cluster changes';
  };
  
  approval: {
    tools: 'GitOps workflow management';
    permissions: 'PR review and merge authorization';
    output: 'Approved changes ready for ArgoCD application';
  };
  
  application: {
    tools: 'ArgoCD sync operation';
    permissions: 'Cluster write via GitOps service account';
    output: 'Changes applied with full audit trail';
  };
}
```

### Emergency Change Capture

```typescript
class EmergencyChangeCapture {
  async handleEmergencyScenario(
    changes: ClusterChange[],
    justification: EmergencyJustification
  ): Promise<EmergencyResult> {
    
    // 1. Validate emergency criteria
    await this.validateEmergencyCriteria(justification);
    
    // 2. Real-time change capture
    const captureSession = await this.startEmergencyCapture({
      engineer: this.getCurrentUser(),
      justification,
      timestamp: new Date(),
      expectedChanges: changes
    });
    
    // 3. Execute with enhanced logging
    const results = await this.executeWithCapture(changes, captureSession);
    
    // 4. Immediate Git reconciliation
    await this.createEmergencyReconciliationPR({
      appliedChanges: results.appliedChanges,
      captureSession,
      deadline: '1 hour',
      requiresMandatoryReview: true
    });
    
    // 5. Schedule compliance review
    await this.scheduleEmergencyReview({
      incidentId: captureSession.incidentId,
      deadline: '24 hours',
      reviewers: this.getEmergencyReviewers()
    });
    
    return results;
  }
}
```

## Deployment Strategy

### Operator Installation

```yaml
# MCP-OCS Operator Custom Resource Definition
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: mcpocs.operators.mcp-ocs.io
spec:
  group: operators.mcp-ocs.io
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              vectorMemory:
                type: object
                properties:
                  storageSize:
                    type: string
                    default: "20Gi"
                  storageClass:
                    type: string
                    default: "fast-ssd"
              ragDatabase:
                type: object
                properties:
                  storageSize:
                    type: string
                    default: "50Gi"
              gitopsConfig:
                type: object
                properties:
                  repositoryUrl:
                    type: string
                  branch:
                    type: string
                    default: "main"
              rbacConfig:
                type: object
                properties:
                  enableMultiTenant:
                    type: boolean
                    default: true
  scope: Namespaced
  names:
    plural: mcpocs
    singular: mcpoc
    kind: MCPOcs

---
# Example MCP-OCS Instance
apiVersion: operators.mcp-ocs.io/v1
kind: MCPOcs
metadata:
  name: production-instance
  namespace: mcp-ocs-system
spec:
  vectorMemory:
    storageSize: "50Gi"
    storageClass: "fast-ssd"
  ragDatabase:
    storageSize: "100Gi"
  gitopsConfig:
    repositoryUrl: "https://github.com/company/cluster-config"
    branch: "main"
  rbacConfig:
    enableMultiTenant: true
```

## Migration Path from Single-User

### Phase 1: Containerization (Month 1)
- Package MCP-ocs as container image
- Maintain oc CLI compatibility in container
- Add ServiceAccount authentication support
- Test basic operator deployment

### Phase 2: API Migration (Months 2-3)  
- Implement Kubernetes API client
- Replace oc shell commands with API calls
- Add OpenShift API extensions
- Maintain backward compatibility

### Phase 3: Multi-Pod Deployment (Months 4-5)
- Deploy external memory services
- Implement GitOps controller
- Add RBAC permission enforcement
- Production operator deployment

### Phase 4: Advanced Features (Month 6+)
- Emergency change capture system
- Advanced multi-tenancy features
- Cross-cluster operations
- Comprehensive audit and compliance

## Rationale

### Benefits of Multi-Pod Architecture:
✅ **Scalability** - Independent scaling of MCP server, memory, and GitOps components  
✅ **Security** - Minimal RBAC permissions per component, no direct cluster writes  
✅ **Reliability** - Component isolation prevents cascading failures  
✅ **Compliance** - Full audit trail and GitOps change management  
✅ **Multi-Tenancy** - Team isolation and role-based access control  
✅ **Emergency Response** - Proper procedures with mandatory reconciliation  

### Addresses Production Requirements:
✅ **No Shell Dependencies** - Pure Kubernetes API integration  
✅ **External Memory** - Vector and RAG services in separate pods  
✅ **GitOps Integration** - All changes flow through Git workflow  
✅ **RBAC Security** - Role-based permissions for different engineer levels  
✅ **Emergency Procedures** - House-burning scenarios with capture and reconciliation  

## Consequences

### Benefits:
- **Production Ready** - Enterprise-grade deployment with HA and RBAC
- **Audit Compliant** - Full operational audit trail and change management
- **Secure by Default** - Minimal permissions and GitOps-first approach
- **Scalable Architecture** - Independent component scaling and resource management

### Costs:
- **Deployment Complexity** - Multi-pod architecture requires operator management
- **Resource Overhead** - Separate pods for each component increase resource usage
- **Migration Effort** - Complete rewrite from oc CLI to Kubernetes API
- **Storage Requirements** - Persistent volumes for memory and knowledge base

### Risks:
- **API Compatibility** - OpenShift API changes could break functionality
- **Storage Performance** - Persistent volume performance impacts memory operations
- **GitOps Dependency** - Git repository availability becomes critical path
- **Emergency Procedures** - Emergency change capture adds complexity

## Review and Success Criteria

### Technical Metrics:
- **Zero Shell Dependencies** - No oc binary required in production pods
- **Sub-Second Response** - Tool operations complete within SLA
- **100% Change Audit** - All cluster modifications tracked in Git
- **Multi-Tenant Isolation** - Teams cannot access each other's resources

### Security Metrics:
- **Minimal RBAC** - Each component has only required permissions
- **Emergency Compliance** - 100% emergency changes reconciled within deadline
- **Audit Coverage** - Complete operational audit trail available
- **Zero Privilege Escalation** - No component can exceed assigned permissions

### Operational Metrics:
- **HA Availability** - 99.9% uptime for MCP server components
- **Memory Performance** - Vector search operations under 100ms
- **GitOps Integration** - Changes applied within approved time windows
- **Emergency Response** - Emergency procedures executable within SLA

---

**Implementation Priority:** Critical for production deployment  
**Dependencies:** ADR-009 (RBAC Strategy), Updated ADR-001 (API Migration), Updated ADR-002 (GitOps)  
**Review Date:** After prototype deployment validation

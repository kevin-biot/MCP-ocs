// Tool Input and Result Type Definitions

export interface StoreIncidentArgs {
  incidentId: string;
  symptoms: string[];
  rootCause?: string;
  resolution?: string;
  affectedResources?: string[];
  environment: 'dev' | 'test' | 'staging' | 'prod';
  sessionId?: string;
}

export interface SearchOperationalArgs {
  sessionId?: string;
  query: string;
  limit?: number;
}

export interface GetPodsArgs {
  sessionId?: string;
  namespace?: string;
  selector?: string;
}

export interface DescribeArgs {
  sessionId?: string;
  resourceType: string;
  name: string;
  namespace?: string;
}

export interface GetLogsArgs {
  sessionId?: string;
  podName: string;
  namespace?: string;
  container?: string;
  lines?: number;
  since?: string;
}

export interface MemorySearchArgs {
  sessionId?: string;
  query: string;
  limit?: number;
  domainFilter?: 'openshift' | 'kubernetes' | 'devops' | 'production';
}

export interface OperationalSearchResultItem {
  similarity: number;
  incidentId: string;
  symptoms: string[];
  rootCause: string;
  resolution: string;
  environment: string;
  timestamp: number | string | undefined;
}

export interface OperationalSearchResult {
  query: string;
  limit: number;
  resultsFound: number;
  results: OperationalSearchResultItem[];
  timestamp: string;
}

export interface MemoryStatsSummary {
  totalConversations: number;
  totalOperational: number;
  chromaAvailable: boolean;
  storageUsed: string;
  lastCleanup: Date | null;
  namespace: string;
  detailed: boolean;
  timestamp: string;
  details?: {
    memoryBreakdown: {
      conversationMemory: string;
      operationalMemory: string;
      storageBackend: string;
    };
    systemHealth: {
      chromaStatus: string;
      storageLocation: string;
      lastCleanup: Date | null;
    };
  };
}


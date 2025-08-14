// Tool maturity and definition metadata for beta filtering
export enum ToolMaturity {
  PRODUCTION = 'production',
  BETA = 'beta',
  ALPHA = 'alpha',
  DEVELOPMENT = 'development'
}

export interface ToolDefinitionMeta {
  name: string;
  maturity: ToolMaturity;
  lastValidated: string;
  testCoverage: number; // 0-100
  mcpCompatible: boolean;
  // Optional extra fields for reporting
  validationSession?: string;
  successRate?: string;
  realClusterTested?: boolean;
  llmTested?: string;
  notes?: string;
}


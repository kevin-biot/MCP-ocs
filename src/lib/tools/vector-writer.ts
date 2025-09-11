import { ToolMemoryGateway } from './tool-memory-gateway.js';

export interface VectorWriteInput {
  toolId: string; // full name
  argsSummary: Record<string, unknown>;
  resultSummary: string; // bounded JSON string
  sessionId: string;
  domain?: string;
  environment?: 'dev' | 'test' | 'staging' | 'prod';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  extraTags?: string[];
}

// Returns true if vector write path attempted (regardless of Chroma availability)
export async function writeVectorToolExec(input: VectorWriteInput): Promise<boolean> {
  if (!envEnable('ENABLE_VECTOR_WRITES', true)) return false;
  // Explicit kill switch handled by ChromaMemoryManager as well, but short-circuit here
  try {
    const forceJson = String(process.env.MCP_OCS_FORCE_JSON || '').toLowerCase();
    if (['1','true','yes','on'].includes(forceJson)) return false;
  } catch {}

  try {
    const gateway = new ToolMemoryGateway('./memory');
    const ok = await gateway.storeToolExecution(
      input.toolId,
      input.argsSummary,
      safeResult(input.resultSummary),
      input.sessionId,
      [
        'tool_execution',
        'instrumented',
        ...(Array.isArray(input.extraTags) ? input.extraTags : [])
      ],
      coerceDomain(input.domain),
      coerceEnvironment(input.environment),
      input.severity || 'medium'
    );
    return !!ok;
  } catch (err) {
    try { console.error('[vector-writer] write failed:', (err as Error)?.message || String(err)); } catch {}
    return false;
  }
}

function safeResult(s: string): string {
  const lim = 1500; // ~1.5KB
  if (s.length <= lim) return s;
  return s.slice(0, lim) + '…';
}

function coerceDomain(d?: string): 'openshift' | 'kubernetes' | 'devops' | 'production' {
  const v = String(d || '').toLowerCase();
  if (v === 'openshift' || v === 'kubernetes' || v === 'devops' || v === 'production') return v;
  return 'openshift';
}

function coerceEnvironment(e?: 'dev' | 'test' | 'staging' | 'prod'): 'dev' | 'test' | 'staging' | 'prod' {
  const v = (e || 'prod');
  return (['dev','test','staging','prod'] as const).includes(v) ? v : 'prod';
}

function envEnable(name: string, defaultOn = true): boolean {
  const v = String(process.env[name] || '').toLowerCase();
  if (v === 'false' || v === '0' || v === 'off' || v === 'no') return false;
  if (v === 'true' || v === '1' || v === 'on' || v === 'yes') return true;
  return defaultOn;
}

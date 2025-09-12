export type Kind = 'conversation' | 'operational' | 'tool_exec';

export interface TagContext {
  kind: Kind;
  domain?: string;
  environment?: 'dev' | 'test' | 'staging' | 'prod';
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export function tagEnforcer(existing: string[] = [], ctx: TagContext): string[] {
  const out = new Set(existing.filter(Boolean));
  out.add(`kind:${ctx.kind}`);
  if (ctx.domain) out.add(`domain:${ctx.domain}`);
  if (ctx.environment) out.add(`environment:${ctx.environment}`);
  if (ctx.severity) out.add(`severity:${ctx.severity}`);
  return Array.from(out);
}


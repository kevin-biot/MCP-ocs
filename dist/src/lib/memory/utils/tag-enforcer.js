export function tagEnforcer(existing = [], ctx) {
    const out = new Set(existing.filter(Boolean));
    out.add(`kind:${ctx.kind}`);
    if (ctx.domain)
        out.add(`domain:${ctx.domain}`);
    if (ctx.environment)
        out.add(`environment:${ctx.environment}`);
    if (ctx.severity)
        out.add(`severity:${ctx.severity}`);
    return Array.from(out);
}

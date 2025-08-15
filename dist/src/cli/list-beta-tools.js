#!/usr/bin/env tsx
/**
 * Minimal CLI: List validated beta tools
 * Prints the 8 production-ready tool names and basic stats.
 * Usage: npm run beta:tools [--json]
 */
import { VALIDATED_TOOLS } from '../registry/validated-tools.js';
import { ToolMaturity } from '../types/tool-maturity.js';
const asJson = process.argv.includes('--json');
const entries = Object.entries(VALIDATED_TOOLS)
    .map(([name, meta]) => ({ name, maturity: meta.maturity, lastValidated: meta.lastValidated }))
    .sort((a, b) => a.name.localeCompare(b.name));
const counts = entries.reduce((acc, e) => {
    acc.total += 1;
    acc.byMaturity[e.maturity] = (acc.byMaturity[e.maturity] || 0) + 1;
    return acc;
}, { total: 0, byMaturity: {} });
if (asJson) {
    console.log(JSON.stringify({
        count: counts.total,
        byMaturity: counts.byMaturity,
        tools: entries
    }, null, 2));
    process.exit(0);
}
console.log('MCP-OCS Beta Tool List (validated)');
console.log('-----------------------------------');
entries.forEach(e => {
    const maturity = e.maturity === ToolMaturity.PRODUCTION ? 'production' : String(e.maturity);
    console.log(`- ${e.name} [${maturity}] (validated: ${e.lastValidated})`);
});
console.log('');
console.log(`Total: ${counts.total}`);
console.log('By maturity:', JSON.stringify(counts.byMaturity));

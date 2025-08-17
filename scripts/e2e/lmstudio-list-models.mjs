#!/usr/bin/env node
import { LMStudioConnector } from './test-harness-connector.js';

async function main(){
  const conn = new LMStudioConnector();
  const res = await conn.listModels();
  if (!res.ok) {
    console.error(`Failed to list models: ${res.error}`);
    process.exit(1);
  }
  const items = res.data?.data || [];
  console.log('LM Studio Models:');
  if (items.length === 0) {
    console.log('- (none)');
  } else {
    for (const m of items) console.log(`- ${m.id}`);
  }
}

main().catch(e=>{ console.error(e?.message || e); process.exit(1); });


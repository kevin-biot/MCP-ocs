#!/usr/bin/env node
import { SharedMemoryManager } from '../src/lib/memory/shared-memory.js';

async function main() {
  const memory = new SharedMemoryManager({
    domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory',
    enableCompression: true, retentionDays: 7, chromaHost: '127.0.0.1', chromaPort: 8000
  });

  const now = Date.now();
  const seed = [
    {
      sessionId: 'conv-seed-1',
      domain: 'operations',
      timestamp: now - 30000,
      userMessage: 'Investigating openshift-monitoring degraded alerts and Pending pods',
      assistantResponse: 'Likely due to resource pressure in namespace. Check quotas and node pressure events.',
      context: ['openshift-monitoring','prometheus-k8s','Pending','resource_pressure'],
      tags: ['conversation','monitoring','alerts']
    },
    {
      sessionId: 'conv-seed-2',
      domain: 'operations',
      timestamp: now - 20000,
      userMessage: 'How to increase namespace quotas in OpenShift?',
      assistantResponse: 'Use oc apply with a ResourceQuota object; verify limits and requests.',
      context: ['quota','ResourceQuota','oc apply'],
      tags: ['howto','quota']
    },
    {
      sessionId: 'conv-seed-3',
      domain: 'operations',
      timestamp: now - 10000,
      userMessage: 'Prometheus scrape failures after router update',
      assistantResponse: 'Check route TLS settings and service endpoints; reload pods.',
      context: ['prometheus','router','tls'],
      tags: ['prometheus','router']
    }
  ];

  for (const m of seed) {
    await memory.storeConversation(m as any);
  }
  console.log(JSON.stringify({ seeded: seed.length }, null, 2));
}

main().catch(err => { console.error(err?.message || err); process.exit(1); });


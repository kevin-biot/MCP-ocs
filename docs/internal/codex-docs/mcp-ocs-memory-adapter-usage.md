# MCPOcsMemoryAdapter — Quick Usage

## Import

From the package root (re-exported):

```ts
import { MCPOcsMemoryAdapter, type OCSIncidentMemory } from './src/index.js';
// or within the repo code
import { MCPOcsMemoryAdapter } from '@/lib/memory/mcp-ocs-memory-adapter';
```

## Initialize

```ts
const adapter = new MCPOcsMemoryAdapter('./memory');
await adapter.initialize();
```

## Store Incident Memory

```ts
const mem: OCSIncidentMemory = {
  sessionId: 's-123',
  timestamp: Date.now(),
  userMessage: 'Pod crashlooping after deploy',
  assistantResponse: 'Check resource limits and rollout history',
  context: ['ns/default', 'deploy/app'],
  tags: ['incident', 'pod'],
  domain: 'openshift',
  environment: 'dev',
  severity: 'high',
  resourceType: 'pod'
};
await adapter.storeIncidentMemory(mem);
```

## Search & Structured Response

```ts
const matches = await adapter.searchIncidents('crashloop backoff', 'openshift', 5);

const structured = await adapter.generateStructuredIncidentResponse(
  'crashloop backoff',
  's-123'
);
console.log(structured.summary);
console.log('Severity:', structured.severitySummary);
```

## Notes
- Adapter uses MCP-files `ChromaMemoryManager` under the hood.
- Domain/environment/severity/resource tags are auto-added to `tags`.
- If `resourceType` is missing, the adapter adds `resource:unknown`.

## Tests
- Run adapter-only tests: `npm run test:adapter`
- Example demo (mocked via Jest): `tests/unit/memory/adapter-usage-example.spec.ts`
## One-liner Helper

```ts
import { createOcsAdapter } from '@/lib/memory';

const adapter = await createOcsAdapter('./memory');
```

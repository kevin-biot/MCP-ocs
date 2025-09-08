// Example: Registering oc_triage in src/index-sequential.ts

import type { UnifiedToolRegistry } from '../../../src/lib/tools/tool-registry.js';
import { registerOcTriageTool } from './oc-triage-tool-definition.js';

export function integrateOcTriage(toolRegistry: UnifiedToolRegistry) {
  registerOcTriageTool(toolRegistry);
  // Optional: log tool presence
  // console.error('[triage] oc_triage registered');
}

// In src/index-sequential.ts, after suites are registered:
//   integrateOcTriage(toolRegistry);


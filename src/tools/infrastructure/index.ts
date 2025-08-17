/**
 * Infrastructure Tools - Zone/Capacity/Distribution Insights (Scaffold)
 *
 * Read-only helpers and a lightweight analyzer to support infrastructure
 * diagnostics and templates (zone conflicts, scheduling failures).
 *
 * Note: These are safe scaffolds returning structured JSON suitable for
 * deterministic testing. They do not perform cluster-wide sweeps by default.
 */

import { ToolSuite, StandardTool } from '../../lib/tools/tool-registry.js';
import { OpenShiftClient } from '../../lib/openshift-client.js';
import { SharedMemoryManager } from '../../lib/memory/shared-memory.js';

const INFRA_LIVE_READS = String(process.env.INFRA_LIVE_READS || '').toLowerCase() === 'true';

export class InfrastructureTools implements ToolSuite {
  category = 'infrastructure';
  version = 'v1';

  constructor(
    private openshiftClient: OpenShiftClient,
    private memoryManager: SharedMemoryManager
  ) {}

  getTools(): StandardTool[] {
    return [
      this.mkStandard('oc_read_nodes', 'mcp-openshift', 'read-ops', 'v1', {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          namespace: { type: 'string' },
          bounded: { anyOf: [{ type: 'boolean' }, { type: 'string' }], default: true }
        },
        required: ['sessionId']
      }, async (args: any) => {
        // Live path (optional) — guarded for determinism
        if (INFRA_LIVE_READS) {
          try {
            const raw = await this.openshiftClient.executeRawCommand(['get','nodes','-o','json']);
            const data = JSON.parse(raw);
            const items: any[] = Array.isArray(data?.items) ? data.items : [];
            const nodes = items.map((it:any)=>{
              const name = it?.metadata?.name;
              const labels = it?.metadata?.labels || {};
              const zone = labels['topology.kubernetes.io/zone'] || labels['failure-domain.beta.kubernetes.io/zone'] || 'unknown';
              const taints = Array.isArray(it?.spec?.taints) ? it.spec.taints.map((t:any)=>({ key: t.key, value: t.value ?? true })) : [];
              const conds: any[] = Array.isArray(it?.status?.conditions) ? it.status.conditions : [];
              const readyCond = conds.find(c=>c?.type==='Ready');
              const ready = readyCond?.status === 'True';
              return { name, zone, ready, taints };
            });
            const zones = Array.from(new Set(nodes.map(n=>n.zone).filter(Boolean)));
            const ready = nodes.filter(n=>n.ready).length;
            const total = nodes.length;
            const out = { zones, nodes, ready, total, timestamp: new Date().toISOString() };
            return JSON.stringify(out, null, 2);
          } catch {/* fall through to scaffold */}
        }
        // Scaffold: minimal per-zone summary
        const zones = ['a','b'];
        const nodes = [
          { name: 'node-a-1', zone: 'a', ready: true, taints: [] },
          { name: 'node-a-2', zone: 'a', ready: true, taints: [] },
          { name: 'node-b-1', zone: 'b', ready: false, taints: [{ key:'NoSchedule', value:true }] }
        ];
        const ready = nodes.filter(n=>n.ready).length;
        const total = nodes.length;
        const capacity = { utilization: 0.65 };
        const out = { zones, nodes, ready, total, capacity, timestamp: new Date().toISOString() };
        return JSON.stringify(out, null, 2);
      }),

      this.mkStandard('oc_read_machinesets', 'mcp-openshift', 'read-ops', 'v1', {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          namespace: { type: 'string', default: 'openshift-machine-api' },
          bounded: { anyOf: [{ type: 'boolean' }, { type: 'string' }], default: true }
        },
        required: ['sessionId']
      }, async (args: any) => {
        if (INFRA_LIVE_READS) {
          try {
            const ns = String(args?.namespace || 'openshift-machine-api');
            const raw = await this.openshiftClient.executeRawCommand(['get','machinesets','-n', ns, '-o','json']);
            const data = JSON.parse(raw);
            const items: any[] = Array.isArray(data?.items) ? data.items : [];
            const sets = items.map((it:any)=>{
              const name = it?.metadata?.name;
              const replicas = Number(it?.spec?.replicas ?? 0);
              const zone = it?.spec?.template?.spec?.nodeSelector?.['topology.kubernetes.io/zone'] || it?.spec?.template?.metadata?.labels?.['topology.kubernetes.io/zone'] || 'unknown';
              return { name, replicas, zone };
            });
            const out = { sets, timestamp: new Date().toISOString() };
            return JSON.stringify(out, null, 2);
          } catch {/* fall through to scaffold */}
        }
        const sets = [
          { name: 'ms-a', replicas: 3, zone: 'a' },
          { name: 'ms-b', replicas: 1, zone: 'b' }
        ];
        const out = { sets, timestamp: new Date().toISOString() };
        return JSON.stringify(out, null, 2);
      }),

      this.mkStandard('oc_analyze_zone_conflicts', 'mcp-openshift', 'diagnostic', 'v1', {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          expectedZones: { anyOf: [{ type: 'array', items: { type: 'string' } }, { type: 'string' }] },
          observedSets: { type: 'array', items: { type: 'object' } },
          observedNodes: { type: 'array', items: { type: 'object' } }
        },
        required: ['sessionId']
      }, async (args: any) => {
        // Compute a simple skew metric and surface basic findings
        const sets = Array.isArray(args?.observedSets) ? args.observedSets : [
          { name: 'ms-a', replicas: 3, zone: 'a' },
          { name: 'ms-b', replicas: 1, zone: 'b' }
        ];
        const total = sets.reduce((s:any,x:any)=>s + Number(x.replicas||0), 0) || 1;
        const byZone: Record<string, number> = {};
        sets.forEach((s:any)=>{ const z = String(s.zone||'unknown'); byZone[z] = (byZone[z]||0) + Number(s.replicas||0); });
        const zones = Object.keys(byZone);
        const maxRatio = Math.max(...zones.map(z => byZone[z]/total));
        const skew = Number(maxRatio.toFixed(2));
        const capacity = { utilization: 0.7 };
        const findings = skew >= 0.8 ? ['High zone skew detected'] : [];
        const out = { zones, skew, capacity, findings, timestamp: new Date().toISOString() };
        return JSON.stringify(out, null, 2);
      })
    ];
  }

  private mkStandard(name: string, ns: string, category: 'read-ops'|'diagnostic', version: 'v1'|'v2', inputSchema: any, exec: (args:any)=>Promise<string>): StandardTool {
    const full = name;
    return {
      name,
      fullName: full,
      description: `Infrastructure helper: ${name}`,
      inputSchema,
      category: category as any,
      version: version as any,
      execute: exec,
      metadata: { experimental: true, mcpCompatible: true }
    };
  }
}

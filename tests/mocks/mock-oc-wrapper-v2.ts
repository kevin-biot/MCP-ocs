import fs from 'fs';
import path from 'path';

export class MockOcWrapperV2 {
  constructor(private fixturesDir: string) {}

  async executeOc(args: string[], opts?: { namespace?: string }) {
    const ns = opts?.namespace || 'demo-ns';
    const key = this.mapArgsToKey(args);
    const file = path.join(this.fixturesDir, ns, `${key}.json`);
    if (!fs.existsSync(file)) {
      // Return empty default shape
      return { stdout: JSON.stringify({ items: [] }), stderr: '', duration: 0, cached: false } as any;
    }
    const stdout = fs.readFileSync(file, 'utf8');
    return { stdout, stderr: '', duration: 0, cached: false } as any;
  }

  // Convenience helpers used by v2 tools
  async getPods(namespace: string) {
    const r = await this.executeOc(['get', 'pods', '-o', 'json'], { namespace });
    return JSON.parse(r.stdout);
  }
  async getPVCs(namespace: string) {
    const r = await this.executeOc(['get', 'pvc', '-o', 'json'], { namespace });
    return JSON.parse(r.stdout);
  }
  async getRoutes(namespace: string) {
    const r = await this.executeOc(['get', 'route', '-o', 'json'], { namespace });
    return JSON.parse(r.stdout);
  }
  async getDeployments(namespace: string) {
    const r = await this.executeOc(['get', 'deployments', '-o', 'json'], { namespace });
    return JSON.parse(r.stdout);
  }
  async getEvents(namespace: string) {
    const r = await this.executeOc(['get', 'events', '--field-selector', 'type!=Normal', '-o', 'json'], { namespace });
    return JSON.parse(r.stdout);
  }
  async getIngress(namespace: string) {
    const r = await this.executeOc(['get', 'ingress', '-o', 'json'], { namespace });
    return JSON.parse(r.stdout);
  }

  private mapArgsToKey(args: string[]): string {
    const a = args.join(' ');
    if (a.includes('get pods')) return 'pods';
    if (a.includes('get nodes')) return 'nodes';
    if (a.includes('get clusteroperators')) return 'clusteroperators';
    if (a.includes('get namespaces')) return 'namespaces';
    if (a.includes('get pvc')) return 'pvcs';
    if (a.includes('get route')) return 'routes';
    if (a.includes('get deployments')) return 'deployments';
    if (a.includes('get ingress')) return 'ingress';
    if (a.includes('get events')) return 'events';
    return 'unknown';
  }
}

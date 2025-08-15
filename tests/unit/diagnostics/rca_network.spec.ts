import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

describe('RCA analyzeNetworkHealth endpoints', () => {
  const engine = new RCAChecklistEngine({} as any);

  test('counts services without endpoints', () => {
    const services = { items: [
      { metadata: { namespace: 'ns', name: 'svc-a' } },
      { metadata: { namespace: 'ns', name: 'svc-b' } },
      { metadata: { namespace: 'other', name: 'svc-c' } },
    ] };
    const routes = { items: [] };
    const endpoints = { items: [
      { metadata: { namespace: 'ns', name: 'svc-a' }, subsets: [{ addresses: [{ ip: '10.0.0.1' }] }] },
      { metadata: { namespace: 'other', name: 'svc-c' }, subsets: [] }
    ] };

    const res = (engine as any).analyzeNetworkHealth(services, routes, endpoints);
    expect(res.totalServices).toBe(3);
    expect(res.servicesWithoutEndpoints).toBe(2); // svc-b missing, svc-c no addresses
    expect(res.issues.some((i: string) => i.includes('svc-b'))).toBe(true);
  });
});

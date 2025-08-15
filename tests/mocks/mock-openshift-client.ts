export class MockOpenShiftClient {
  constructor(private ns = 'demo-ns') {}

  async getPods(namespace?: string, selector?: string) {
    const pods = [
      { name: 'app-1', namespace: namespace || this.ns, status: 'Running', ready: '1/1', restarts: 0, age: '10m' },
      { name: 'app-2', namespace: namespace || this.ns, status: 'Pending', ready: '0/1', restarts: 0, age: '2m' }
    ];
    return pods;
  }

  async describeResource(resourceType: string, name: string, namespace?: string) {
    return `${resourceType}/${name} in ${namespace || this.ns}\nMock description text...`;
  }

  async getLogs(podName: string, namespace?: string, options?: any) {
    return `Mock logs for ${namespace || this.ns}/${podName}\nline1\nline2\n`;
  }
}


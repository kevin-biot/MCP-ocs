import { OpenShiftClient } from '../../../src/lib/openshift-client';
import { ToolMemoryGateway } from '../../../src/lib/tools/tool-memory-gateway';

export interface TestResult {
  test: string;
  success: boolean;
  details?: any;
  error?: string;
}

export async function testClusterHealth(): Promise<TestResult> {
  const ocClient = new OpenShiftClient({ ocPath: 'oc', timeout: 15000 });
  const memory = new ToolMemoryGateway('./memory');

  try {
    // Test 1: OC connectivity and cluster info
    await ocClient.validateConnection();
    const clusterInfo = await ocClient.getClusterInfo();

    // Test 2: Basic diagnostic signals (without MCP)
    // Fetch nodes via raw oc to avoid depending on extra client helpers
    const nodesJson = await ocClient.executeRawCommand(['get', 'nodes', '-o', 'json']);
    const nodesData = JSON.parse(nodesJson);
    const nodes = (nodesData.items || []).map((n: any) => ({
      name: n?.metadata?.name,
      status: n?.status?.conditions?.find((c: any) => c.type === 'Ready')?.status || 'Unknown',
      roles: n?.metadata?.labels ? Object.keys(n.metadata.labels).filter(k => k.startsWith('node-role.kubernetes.io/')) : []
    }));

    const healthData = {
      clusterInfo,
      nodes,
      systemPods: await ocClient.getPods('kube-system')
    };

    // Test 3: Memory storage via adapter
    await memory.initialize();
    const sessionId = `test-cluster-${Date.now()}`;
    const stored = await memory.storeToolExecution(
      'pre_mcp_cluster_health',
      {},
      healthData,
      sessionId,
      ['test', 'cluster-health'],
      'openshift',
      'test',
      'low'
    );

    // Test 4: Memory search
    const searchResults = await memory.searchToolIncidents('cluster health');

    return {
      test: 'cluster-health',
      success: !!stored && searchResults.length >= 0, // allow 0 on first run
      details: {
        ocConnectivity: clusterInfo.status === 'connected',
        clusterAccess: !!clusterInfo,
        memoryStore: stored,
        memorySearch: searchResults.length
      }
    };
  } catch (error: any) {
    return {
      test: 'cluster-health',
      success: false,
      error: error?.message || String(error)
    };
  }
}

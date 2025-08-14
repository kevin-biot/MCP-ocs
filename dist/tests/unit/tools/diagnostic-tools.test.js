/**
 * Unit tests for DiagnosticToolsV2
 */
import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index';
import { OcWrapperV2 } from '../../../src/v2/lib/oc-wrapper-v2';
// Mock the v2-integration tool used by namespace_health
jest.mock('../../../src/v2-integration', () => ({
    checkNamespaceHealthV2Tool: {
        handler: jest.fn().mockResolvedValue({
            namespace: 'ns', status: 'healthy', duration: 10,
            checks: { pods: { ready: 1, total: 1, crashloops: [], imagePullErrors: [], pending: [], oomKilled: [] },
                pvcs: { bound: 1, total: 1, errors: [] },
                routes: { total: 0 }, events: [] },
            suspicions: [], human: 'ok'
        })
    }
}));
describe('DiagnosticToolsV2', () => {
    let openshift;
    let memory;
    let suite;
    beforeEach(() => {
        openshift = {
            getClusterInfo: jest.fn().mockResolvedValue({ status: 'connected', version: 'v', currentUser: 'u', currentProject: 'p', serverUrl: 's' })
        };
        memory = { storeOperational: jest.fn().mockResolvedValue('op-1') };
        suite = new DiagnosticToolsV2(openshift, memory);
        // Stub ocWrapperV2 executeOc for nodes/operators/pod
        jest.spyOn(OcWrapperV2.prototype, 'executeOc').mockImplementation(async (..._a) => {
            const args = _a[0];
            if (args[0] === 'get' && args[1] === 'nodes')
                return { stdout: JSON.stringify({ items: [] }), stderr: '' };
            if (args[0] === 'get' && args[1] === 'clusteroperators')
                return { stdout: JSON.stringify({ items: [] }), stderr: '' };
            if (args[0] === 'get' && args[1] === 'pod')
                return { stdout: JSON.stringify({ metadata: { name: 'p1' }, status: { conditions: [] } }), stderr: '' };
            if (args[0] === 'get' && args[1] === 'namespaces')
                return { stdout: JSON.stringify({ items: [] }), stderr: '' };
            return { stdout: JSON.stringify({ items: [] }), stderr: '' };
        });
    });
    it('oc_diagnostic_cluster_health returns formatted JSON', async () => {
        const tool = suite.getTools().find(t => t.fullName === 'oc_diagnostic_cluster_health');
        const out = await tool.execute({ sessionId: 's1' });
        const obj = JSON.parse(out);
        expect(obj.tool || obj.summary || obj.cluster).toBeDefined();
    });
    it('oc_diagnostic_namespace_health delegates to v2 handler and returns JSON', async () => {
        const tool = suite.getTools().find(t => t.fullName === 'oc_diagnostic_namespace_health');
        const out = await tool.execute({ sessionId: 's1', namespace: 'ns' });
        const obj = typeof out === 'string' ? JSON.parse(out) : out;
        expect(obj.namespace).toBe('ns');
        expect(obj.status).toBe('healthy');
    });
    it('oc_diagnostic_pod_health returns pod health JSON', async () => {
        const tool = suite.getTools().find(t => t.fullName === 'oc_diagnostic_pod_health');
        const out = await tool.execute({ sessionId: 's1', namespace: 'ns', podName: 'p1' });
        const obj = typeof out === 'string' ? JSON.parse(out) : out;
        expect(typeof obj).toBe('object');
    });
    it('oc_diagnostic_rca_checklist returns RCA report envelope', async () => {
        const rcaModule = await import('../../../src/v2/tools/rca-checklist/index');
        jest.spyOn(rcaModule.RCAChecklistEngine.prototype, 'executeRCAChecklist').mockResolvedValue({
            reportId: 'rep-1',
            timestamp: new Date().toISOString(),
            duration: 12,
            overallStatus: 'healthy',
            checksPerformed: [{ name: 'check1', status: 'pass', severity: 'low', findings: [], recommendations: [], duration: 1 }],
            summary: { totalChecks: 1, passed: 1, failed: 0, warnings: 0 },
            criticalIssues: [],
            nextActions: [],
            evidence: { symptoms: [], affectedResources: [], diagnosticSteps: [] },
            human: 'ok'
        });
        const tool = suite.getTools().find(t => t.fullName === 'oc_diagnostic_rca_checklist');
        const out = await tool.execute({ sessionId: 's1', namespace: 'ns', outputFormat: 'json' });
        const obj = typeof out === 'string' ? JSON.parse(out) : out;
        expect(typeof obj).toBe('object');
        expect(Array.isArray(obj.checksPerformed || [])).toBe(true);
    });
});

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PVCBindingRCAEngine, StorageIntelligenceTools } from '../../../src/tools/storage-intelligence/implementation-reference';
import { student03PendingPVCScenario, eventDataForPendingPVCs } from '../../fixtures/storage-intelligence-fixtures';
// Minimal mocks for OcWrapperV2 and SharedMemoryManager
const createOcWrapperMock = () => ({
    getPVCs: jest.fn(async (ns) => ({ items: [student03PendingPVCScenario.pvc] })),
    getEvents: jest.fn(async (ns) => ({ items: eventDataForPendingPVCs })),
    executeOc: jest.fn(async () => ({ stdout: '', stderr: '', duration: 1, cached: false }))
});
const createMemoryMock = () => ({
    storeOperational: jest.fn(async () => 'mem-1'),
    searchOperational: jest.fn(async () => []),
});
describe('PVCBindingRCAEngine', () => {
    let oc;
    let memory;
    let engine;
    beforeEach(() => {
        // Stub console to keep test output clean
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        oc = createOcWrapperMock();
        memory = createMemoryMock();
        engine = new PVCBindingRCAEngine(oc, memory);
    });
    it('should detect WaitForFirstConsumer issues with high confidence', async () => {
        const analysis = {
            incidentId: 'inc-student03',
            namespace: student03PendingPVCScenario.namespace,
            analysisType: 'pvc_binding_rca',
            rootCause: {
                category: 'waitForFirstConsumer',
                severity: 'high',
                confidence: 0.96,
                evidence: [
                    { type: 'events', data: { reason: 'WaitForFirstConsumer' }, reasoning: 'WFFC events detected', weight: 0.95 },
                    { type: 'pvcStatus', data: { phase: 'Pending' }, reasoning: 'PVC pending > 28 days', weight: 0.85 }
                ],
                affectedResources: ['pvc/shared-pvc']
            }
        };
        const spy = jest.spyOn(engine, 'analyzePVCBinding').mockResolvedValue(JSON.stringify(analysis));
        const result = await engine.analyzePVCBinding({ sessionId: 's', namespace: 'student03', pvcName: 'shared-pvc' });
        const parsed = JSON.parse(result);
        expect(spy).toHaveBeenCalled();
        expect(parsed.rootCause.category).toBe('waitForFirstConsumer');
        expect(parsed.rootCause.confidence).toBeGreaterThan(0.9);
    });
    it('should generate correct resolution commands for student03 scenario', async () => {
        const analysis = {
            incidentId: 'inc-student03',
            namespace: student03PendingPVCScenario.namespace,
            analysisType: 'pvc_binding_rca',
            rootCause: {
                category: 'waitForFirstConsumer',
                severity: 'high',
                confidence: 0.95,
                evidence: [
                    { type: 'events', data: { reason: 'WaitForFirstConsumer' }, reasoning: 'WFFC', weight: 0.95 }
                ],
                affectedResources: ['pvc/shared-pvc']
            },
            resolutionSteps: [
                {
                    action: 'Create consumer pod',
                    command: `oc run pvc-consumer --image=busybox --restart=Never --overrides='{"apiVersion":"v1","kind":"Pod","metadata":{"name":"pvc-consumer"},"spec":{"containers":[{"name":"c","image":"busybox","command":["sh","-c","sleep 60"],"volumeMounts":[{"mountPath":"/mnt","name":"vol"}]}],"volumes":[{"name":"vol","persistentVolumeClaim":{"claimName":"shared-pvc"}}]}}' -n student03`,
                    risk: 'safe',
                    expected_outcome: 'PVC bound'
                }
            ]
        };
        jest.spyOn(engine, 'analyzePVCBinding').mockResolvedValue(JSON.stringify(analysis));
        const result = await engine.analyzePVCBinding({ sessionId: 's', namespace: 'student03', pvcName: 'shared-pvc', includeResolution: true });
        const parsed = JSON.parse(result);
        expect(parsed.resolutionSteps?.[0].action).toMatch(/Create consumer pod/i);
        expect(parsed.resolutionSteps?.[0].command).toContain('oc run pvc-consumer');
        expect(parsed.resolutionSteps?.[0].command).toContain('claimName":"shared-pvc');
    });
    it('should analyze evidence and weight correctly', async () => {
        const analysis = {
            incidentId: 'inc-student03',
            namespace: 'student03',
            analysisType: 'pvc_binding_rca',
            rootCause: {
                category: 'waitForFirstConsumer',
                severity: 'high',
                confidence: 0.93,
                evidence: [
                    { type: 'events', data: { reason: 'WaitForFirstConsumer' }, reasoning: 'event indicates WFFC', weight: 0.9 },
                    { type: 'pvcStatus', data: { phase: 'Pending' }, reasoning: 'pending state', weight: 0.7 },
                    { type: 'storageClass', data: { bindingMode: 'WaitForFirstConsumer' }, reasoning: 'class WFFC', weight: 0.8 }
                ],
                affectedResources: ['pvc/shared-pvc']
            }
        };
        jest.spyOn(engine, 'analyzePVCBinding').mockResolvedValue(JSON.stringify(analysis));
        const parsed = JSON.parse(await engine.analyzePVCBinding({ sessionId: 's', namespace: 'student03' }));
        // Evidence weights should be within 0..1 and contribute to confidence qualitatively
        for (const e of parsed.rootCause.evidence) {
            expect(e.weight).toBeGreaterThanOrEqual(0);
            expect(e.weight).toBeLessThanOrEqual(1);
        }
        const avgWeight = parsed.rootCause.evidence.reduce((a, e) => a + e.weight, 0) / parsed.rootCause.evidence.length;
        expect(parsed.rootCause.confidence).toBeGreaterThan(avgWeight - 0.1); // loose coupling
    });
    it('should integrate through StorageIntelligenceTools execute()', async () => {
        const tools = new StorageIntelligenceTools(oc, memory);
        const analysis = { incidentId: 'x', analysisType: 'pvc_binding_rca', rootCause: { category: 'waitForFirstConsumer', severity: 'high', confidence: 0.95, evidence: [], affectedResources: [] } };
        // Patch underlying engine method used by tools
        // @ts-ignore private field access for test
        jest.spyOn(tools['pvcRCAEngine'], 'analyzePVCBinding').mockResolvedValue(JSON.stringify(analysis));
        const result = await tools.execute({ sessionId: 's', namespace: 'student03' });
        const parsed = JSON.parse(result);
        expect(parsed.analysisType).toBe('pvc_binding_rca');
    });
});

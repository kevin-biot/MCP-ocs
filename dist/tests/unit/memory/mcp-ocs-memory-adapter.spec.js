import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { MCPOcsMemoryAdapter } from '@/lib/memory/mcp-ocs-memory-adapter';
import { initializeMock, storeConversationMock, searchRelevantMemoriesMock, isAvailableMock } from '../../mocks/memory-extension';
// The adapter's external import is mapped to the mock via jest.config.js
describe('MCPOcsMemoryAdapter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('initializes underlying memory manager', async () => {
        const adapter = new MCPOcsMemoryAdapter('./memory');
        await adapter.initialize();
        expect(initializeMock).toHaveBeenCalledTimes(1);
    });
    it('stores incident memory with domain/environment/severity/resource tags', async () => {
        const adapter = new MCPOcsMemoryAdapter('./memory');
        const mem = {
            sessionId: 's-1',
            timestamp: 111,
            userMessage: 'hello',
            assistantResponse: 'hi',
            context: ['a', 'b'],
            tags: ['x', 'y'],
            domain: 'openshift',
            environment: 'dev',
            severity: 'high',
            resourceType: 'pod'
        };
        await adapter.storeIncidentMemory(mem);
        expect(storeConversationMock).toHaveBeenCalledTimes(1);
        const arg = storeConversationMock.mock.calls[0][0];
        expect(arg.sessionId).toBe('s-1');
        expect(arg.tags).toEqual(expect.arrayContaining([
            'x', 'y', 'domain:openshift', 'environment:dev', 'severity:high', 'resource:pod'
        ]));
    });
    it('filters search results by domain when provided', async () => {
        const adapter = new MCPOcsMemoryAdapter('./memory');
        searchRelevantMemoriesMock.mockResolvedValueOnce([
            { metadata: { tags: ['domain:openshift'] }, distance: 0.1 },
            { metadata: { tags: ['domain:kubernetes'] }, distance: 0.2 },
        ]);
        const resultsOpenShift = await adapter.searchIncidents('query', 'openshift', 10);
        expect(resultsOpenShift).toHaveLength(1);
        expect(resultsOpenShift[0].metadata.tags).toContain('domain:openshift');
        // No filter returns all
        searchRelevantMemoriesMock.mockResolvedValueOnce([
            { metadata: { tags: ['domain:openshift'] }, distance: 0.1 },
            { metadata: { tags: ['domain:kubernetes'] }, distance: 0.2 },
        ]);
        const resultsAll = await adapter.searchIncidents('query', undefined, 10);
        expect(resultsAll).toHaveLength(2);
    });
    it('generates structured incident response with related incidents and severity', async () => {
        const adapter = new MCPOcsMemoryAdapter('./memory');
        searchRelevantMemoriesMock.mockResolvedValueOnce([
            {
                metadata: {
                    sessionId: 's-1',
                    timestamp: 123,
                    userMessage: 'u1 CrashLoopBackOff observed',
                    assistantResponse: 'a1 investigate pod',
                    tags: ['domain:openshift', 'resource:pod', 'severity:high']
                },
                distance: 0.05
            }
        ]);
        const res = await adapter.generateStructuredIncidentResponse('pod crash');
        expect(res.summary).toMatch(/Based on 1 similar incidents/);
        expect(res.relatedIncidents).toHaveLength(1);
        expect(res.relatedIncidents[0]).toMatchObject({ sessionId: 's-1', timestamp: 123 });
        expect(Array.isArray(res.recommendations)).toBe(true);
        expect(res.severitySummary).toBe('high');
        expect(res.recommendations.join(' ')).toMatch(/logs/i);
    });
    it('aggregates severity to critical when any incident is critical', async () => {
        const adapter = new MCPOcsMemoryAdapter('./memory');
        searchRelevantMemoriesMock.mockResolvedValueOnce([
            { metadata: { tags: ['severity:low'] }, distance: 0.3 },
            { metadata: { tags: ['severity:critical'] }, distance: 0.1 },
        ]);
        const res = await adapter.generateStructuredIncidentResponse('outage');
        expect(res.severitySummary).toBe('critical');
    });
    it('reports memory availability', async () => {
        const adapter = new MCPOcsMemoryAdapter('./memory');
        isAvailableMock.mockResolvedValueOnce(true);
        await expect(adapter.isMemoryAvailable()).resolves.toBe(true);
    });
    it('uses resource:unknown when resourceType not provided', async () => {
        const adapter = new MCPOcsMemoryAdapter('./memory');
        const mem = {
            sessionId: 's-2',
            timestamp: 222,
            userMessage: 'hi',
            assistantResponse: 'there',
            context: [],
            tags: [],
            domain: 'kubernetes',
            environment: 'test',
            severity: 'low'
        };
        await adapter.storeIncidentMemory(mem);
        const arg = storeConversationMock.mock.calls[storeConversationMock.mock.calls.length - 1][0];
        expect(arg.tags).toEqual(expect.arrayContaining(['resource:unknown']));
    });
    it('passes limit into search and returns unfiltered when domainFilter missing', async () => {
        const adapter = new MCPOcsMemoryAdapter('./memory');
        searchRelevantMemoriesMock.mockResolvedValueOnce([
            { metadata: { tags: ['domain:openshift'] }, distance: 0.1 },
            { metadata: { tags: ['domain:kubernetes'] }, distance: 0.2 },
        ]);
        const results = await adapter.searchIncidents('pods', undefined, 7);
        expect(results).toHaveLength(2);
        const call = searchRelevantMemoriesMock.mock.calls[searchRelevantMemoriesMock.mock.calls.length - 1];
        expect(call[0]).toBe('pods');
        expect(call[1]).toBeUndefined();
        expect(call[2]).toBe(7);
    });
    it('passes sessionId to structured response search and handles empty results', async () => {
        const adapter = new MCPOcsMemoryAdapter('./memory');
        searchRelevantMemoriesMock.mockResolvedValueOnce([]);
        const res = await adapter.generateStructuredIncidentResponse('node crash', 'sess-123');
        expect(res.summary).toMatch(/Based on 0 similar incidents/);
        expect(res.relatedIncidents).toHaveLength(0);
        const call = searchRelevantMemoriesMock.mock.calls[searchRelevantMemoriesMock.mock.calls.length - 1];
        expect(call[0]).toBe('node crash');
        expect(call[1]).toBe('sess-123');
        expect(call[2]).toBe(10);
    });
    it('reports memory availability false when underlying returns false', async () => {
        const adapter = new MCPOcsMemoryAdapter('./memory');
        isAvailableMock.mockResolvedValueOnce(false);
        await expect(adapter.isMemoryAvailable()).resolves.toBe(false);
    });
});

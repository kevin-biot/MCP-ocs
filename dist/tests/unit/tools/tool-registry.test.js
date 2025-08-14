/**
 * Unit tests for UnifiedToolRegistry
 */
import { UnifiedToolRegistry, getGlobalToolRegistry, resetGlobalToolRegistry, } from '../../../src/lib/tools/tool-registry';
describe('UnifiedToolRegistry', () => {
    let registry;
    let restoreConsole = null;
    beforeEach(() => {
        registry = new UnifiedToolRegistry();
        // Silence console noise from registry logs during tests
        const mocks = [];
        mocks.push(jest.spyOn(console, 'error').mockImplementation(() => { }));
        mocks.push(jest.spyOn(console, 'log').mockImplementation(() => { }));
        restoreConsole = () => {
            mocks.forEach((m) => m.mockRestore());
            restoreConsole = null;
        };
    });
    afterEach(() => {
        if (restoreConsole)
            restoreConsole();
    });
    function makeTool(overrides = {}) {
        return {
            name: 'test_tool',
            fullName: 'ns_test_tool',
            description: 'desc',
            inputSchema: { type: 'object' },
            execute: jest.fn().mockResolvedValue('{"ok":true}'),
            category: 'diagnostic',
            version: 'v1',
            ...overrides,
        };
    }
    it('registers and executes a tool returning string', async () => {
        const tool = makeTool();
        registry.registerTool(tool);
        const out = await registry.executeTool(tool.name, {});
        expect(out).toBe('{"ok":true}');
        expect(tool.execute).toHaveBeenCalled();
    });
    it('rejects duplicate tool names', () => {
        const tool = makeTool();
        registry.registerTool(tool);
        expect(() => registry.registerTool(tool)).toThrow(/Tool name conflict/);
    });
    it('validates required fields and categories/versions', () => {
        // Missing fullName
        const missing = { ...makeTool(), fullName: undefined };
        expect(() => registry.registerTool(missing)).toThrow(/missing required field 'fullName'/);
        // Invalid category
        const badCat = { ...makeTool(), name: 'bad_cat', fullName: 'ns_bad_cat', category: 'nope' };
        expect(() => registry.registerTool(badCat)).toThrow(/invalid category/);
        // Invalid version
        const badVer = { ...makeTool(), name: 'bad_ver', fullName: 'ns_bad_ver', version: 'v3' };
        expect(() => registry.registerTool(badVer)).toThrow(/invalid version/);
    });
    it('returns standardized error JSON when tool returns non-string', async () => {
        const tool = makeTool({ name: 'non_string', fullName: 'ns_non_string', execute: jest.fn().mockResolvedValue({}) });
        registry.registerTool(tool);
        const res = await registry.executeTool('non_string', {});
        const parsed = JSON.parse(res);
        expect(parsed.success).toBe(false);
        expect(parsed.tool).toBe('non_string');
        expect(typeof parsed.error).toBe('string');
    });
    it('throws an error when tool is not found', async () => {
        await expect(registry.executeTool('does_not_exist', {})).rejects.toThrow(/Tool not found/);
    });
    it('reports stats and MCP tool metadata correctly', () => {
        const t1 = makeTool({ name: 'a', fullName: 'ns_a', category: 'diagnostic', version: 'v1' });
        const t2 = makeTool({ name: 'b', fullName: 'ns_b', category: 'memory', version: 'v2' });
        registry.registerTool(t1);
        registry.registerTool(t2);
        const stats = registry.getStats();
        expect(stats.totalTools).toBe(2);
        expect(stats.byCategory['diagnostic']).toBe(1);
        expect(stats.byCategory['memory']).toBe(1);
        expect(stats.byVersion['v1']).toBe(1);
        expect(stats.byVersion['v2']).toBe(1);
        const mcp = registry.getMCPTools();
        expect(mcp).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'ns_a', description: expect.any(String), inputSchema: expect.any(Object) }),
            expect.objectContaining({ name: 'ns_b' }),
        ]));
    });
});
describe('Global tool registry singleton', () => {
    it('returns same instance until reset', () => {
        const a = getGlobalToolRegistry();
        const b = getGlobalToolRegistry();
        expect(a).toBe(b);
        resetGlobalToolRegistry();
        const c = getGlobalToolRegistry();
        expect(c).not.toBe(a);
    });
});

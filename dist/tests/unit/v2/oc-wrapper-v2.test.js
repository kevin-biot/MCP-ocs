/**
 * Unit tests for OcWrapperV2
 */
// Stateful mock for util.promisify/execAsync behavior
jest.mock('util', () => {
    let calls = 0;
    return {
        promisify: (_fn) => (cmd, _opts) => {
            calls++;
            globalThis.__oc_calls = calls;
            const mode = globalThis.__oc_mode;
            if (mode === 'timeout') {
                return Promise.reject({ code: 'ETIMEDOUT', message: 'Timeout' });
            }
            if (mode === 'error') {
                return Promise.reject(new Error('boom'));
            }
            const out = globalThis.__oc_stdout || '{"items":[]}';
            return Promise.resolve({ stdout: out, stderr: '' });
        },
    };
});
jest.mock('child_process', () => ({ exec: jest.fn() }));
import { OcWrapperV2 } from '../../../src/v2/lib/oc-wrapper-v2';
describe('OcWrapperV2', () => {
    let oc;
    let restoreConsole = null;
    beforeEach(() => {
        globalThis.__oc_mode = undefined;
        globalThis.__oc_stdout = undefined;
        globalThis.__oc_calls = 0;
        const mocks = [];
        mocks.push(jest.spyOn(console, 'error').mockImplementation(() => { }));
        mocks.push(jest.spyOn(console, 'warn').mockImplementation(() => { }));
        mocks.push(jest.spyOn(console, 'log').mockImplementation(() => { }));
        restoreConsole = () => mocks.forEach((m) => m.mockRestore());
        oc = new OcWrapperV2('oc', 100);
    });
    afterEach(() => { if (restoreConsole)
        restoreConsole(); });
    it('executes and returns OcResult with caching behavior', async () => {
        globalThis.__oc_stdout = '{"items":[]}';
        const r1 = await oc.executeOc(['version', '-o', 'json'], { cacheKey: 'v', cacheTTL: 5000 });
        expect(r1.cached).toBe(false);
        expect(r1.stderr).toBe('');
        const r2 = await oc.executeOc(['version', '-o', 'json'], { cacheKey: 'v', cacheTTL: 5000 });
        expect(r2.cached).toBe(true);
        expect(r2.duration).toBe(0);
        expect(globalThis.__oc_calls).toBe(1);
    });
    it('injects namespace and parses JSON getters', async () => {
        globalThis.__oc_stdout = '{"items":[]}';
        const pods = await oc.getPods('dev');
        expect(pods).toEqual({ items: [] });
        const events = await oc.getEvents('dev');
        expect(events).toEqual({ items: [] });
        const pvcs = await oc.getPVCs('dev');
        expect(pvcs).toEqual({ items: [] });
        const deployments = await oc.getDeployments('dev');
        expect(deployments).toEqual({ items: [] });
    });
    it('handles JSON parse errors from getters', async () => {
        globalThis.__oc_stdout = 'not-json';
        await expect(oc.getPods('ns')).rejects.toThrow(/Failed to parse pods JSON/);
        await expect(oc.getEvents('ns')).rejects.toThrow(/Failed to parse events JSON/);
        await expect(oc.getPVCs('ns')).rejects.toThrow(/Failed to parse PVCs JSON/);
        await expect(oc.getDeployments('ns')).rejects.toThrow(/Failed to parse deployments JSON/);
    });
    it('gracefully falls back for getRoutes/getIngress when not available', async () => {
        globalThis.__oc_mode = 'error';
        const routes = await oc.getRoutes('ns');
        expect(routes).toEqual({ items: [] });
        const ing = await oc.getIngress('ns');
        expect(ing).toEqual({ items: [] });
    });
    it('validateNamespaceExists returns false on error', async () => {
        globalThis.__oc_mode = 'error';
        const exists = await oc.validateNamespaceExists('ns');
        expect(exists).toBe(false);
    });
    it('throws timeout and generic errors from executeOc', async () => {
        globalThis.__oc_mode = 'timeout';
        await expect(oc.executeOc(['get', 'pods'])).rejects.toThrow(/timed out/i);
        globalThis.__oc_mode = 'error';
        await expect(oc.executeOc(['get', 'pods'])).rejects.toThrow(/Command failed/);
    });
    it('validates args and namespace formatting', async () => {
        await expect(oc.executeOc([])).rejects.toThrow(/No arguments provided/);
        await expect(oc.executeOc(['get;rm -rf /'])).rejects.toThrow(/Invalid characters/);
        await expect(oc.executeOc(['get', 'pods'], { namespace: 'UPPER' })).rejects.toThrow(/Invalid namespace/);
    });
});

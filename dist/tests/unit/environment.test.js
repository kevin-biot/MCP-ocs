/**
 * Minimal test to check basic TypeScript compilation without imports
 */
import { describe, it, expect } from '@jest/globals';
describe('Environment Check', () => {
    it('should have Node.js environment', () => {
        expect(process.env.NODE_ENV).toBeDefined();
    });
    it('should be able to create basic objects', () => {
        const testObj = {
            name: 'test',
            value: 42
        };
        expect(testObj.name).toBe('test');
        expect(testObj.value).toBe(42);
    });
    it('should handle async operations', async () => {
        const promise = Promise.resolve('test');
        const result = await promise;
        expect(result).toBe('test');
    });
});

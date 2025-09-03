import { describe, it, expect } from '@jest/globals';
// Use compiled JS outputs to prevent TS parse issues in Jest
import { withTimeout } from '../../../dist/src/utils/async-timeout.js';
import { TimeoutError } from '../../../dist/src/lib/errors/error-types.js';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('withTimeout helper', () => {
  it('rejects with TimeoutError when operation exceeds timeout', async () => {
    await expect(withTimeout(async () => { await delay(50); return 'done'; }, 10, 'unit-op'))
      .rejects.toBeInstanceOf(TimeoutError);
  });

  it('resolves normally when within timeout', async () => {
    const out = await withTimeout(async () => { await delay(10); return 42; }, 100, 'unit-op');
    expect(out).toBe(42);
  });
});

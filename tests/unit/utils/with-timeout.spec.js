const { describe, it, expect, beforeAll } = require('@jest/globals');
// Use dynamic import to load ESM modules in a CJS test context
let withTimeout, TimeoutError;
beforeAll(async () => {
  const t = await import('../../../dist/src/utils/async-timeout.js');
  const e = await import('../../../dist/src/lib/errors/error-types.js');
  withTimeout = t.withTimeout;
  TimeoutError = e.TimeoutError;
});

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

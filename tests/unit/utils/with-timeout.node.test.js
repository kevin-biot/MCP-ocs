import test from 'node:test';
import assert from 'node:assert/strict';

import { withTimeout } from '../../../dist/src/utils/async-timeout.js';
import { TimeoutError } from '../../../dist/src/lib/errors/error-types.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

test('withTimeout rejects with TimeoutError when exceeding deadline', async () => {
  await assert.rejects(
    withTimeout(async () => { await delay(50); return 'done'; }, 10, 'unit-op'),
    TimeoutError
  );
});

test('withTimeout resolves normally when within timeout', async () => {
  const out = await withTimeout(async () => { await delay(5); return 42; }, 100, 'unit-op');
  assert.equal(out, 42);
});


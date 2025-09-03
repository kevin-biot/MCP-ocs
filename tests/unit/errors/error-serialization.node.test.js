import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AppError,
  ValidationError,
  ToolExecutionError,
  MemoryError,
  TimeoutError,
  NotFoundError,
  ExternalCommandError,
  serializeError,
  mapKindToStatus,
} from '../../../dist/src/lib/errors/error-types.js';

test('maps error kinds to HTTP-like status codes', () => {
  assert.equal(mapKindToStatus('ValidationError'), 400);
  assert.equal(mapKindToStatus('NotFoundError'), 404);
  assert.equal(mapKindToStatus('TimeoutError'), 408);
  assert.equal(mapKindToStatus('ExternalCommandError'), 502);
  assert.equal(mapKindToStatus('ToolExecutionError'), 500);
  assert.equal(mapKindToStatus('MemoryError'), 500);
});

test('serializes canonical errors with cause', () => {
  const cause = new Error('root-cause');
  const cases = [
    new ValidationError('bad input', { cause }),
    new NotFoundError('missing', { cause }),
    new TimeoutError('too slow', { cause }),
    new ToolExecutionError('tool failed', { cause }),
    new MemoryError('memory failed', { cause }),
    new ExternalCommandError('oc failed', { cause }),
  ];

  for (const err of cases) {
    const s = serializeError(err);
    assert.equal(s.type, err.kind);
    assert.equal(s.statusCode, err.statusCode);
    assert.ok(String(s.message).includes(err.message));
    assert.ok(String(s.cause).includes('root-cause'));
  }
});

test('serializes unknown errors safely', () => {
  const s1 = serializeError(new Error('boom'));
  assert.equal(s1.type, 'Error');
  assert.equal(s1.statusCode, 500);
  const s2 = serializeError('weird');
  assert.equal(s2.type, 'UnknownError');
});


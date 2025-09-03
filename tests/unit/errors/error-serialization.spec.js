const { describe, it, expect, beforeAll } = require('@jest/globals');

let AppError,
  ValidationError,
  ToolExecutionError,
  MemoryError,
  TimeoutError,
  NotFoundError,
  ExternalCommandError,
  serializeError,
  mapKindToStatus;

beforeAll(async () => {
  const m = await import('../../../dist/src/lib/errors/error-types.js');
  ({
    AppError,
    ValidationError,
    ToolExecutionError,
    MemoryError,
    TimeoutError,
    NotFoundError,
    ExternalCommandError,
    serializeError,
    mapKindToStatus,
  } = m);
});

describe('Error taxonomy and serialization', () => {
  it('maps kinds to HTTP-like status codes', () => {
    expect(mapKindToStatus('ValidationError')).toBe(400);
    expect(mapKindToStatus('NotFoundError')).toBe(404);
    expect(mapKindToStatus('TimeoutError')).toBe(408);
    expect(mapKindToStatus('ExternalCommandError')).toBe(502);
    expect(mapKindToStatus('ToolExecutionError')).toBe(500);
    expect(mapKindToStatus('MemoryError')).toBe(500);
  });

  it('serializes canonical errors with cause', () => {
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
      expect(s.type).toBe(err.kind);
      expect(s.message).toContain(err.message);
      expect(s.statusCode).toBe(err.statusCode);
      expect(String(s.cause)).toContain('root-cause');
    }
  });

  it('serializes unknown errors safely', () => {
    const s1 = serializeError(new Error('boom'));
    expect(s1.type).toBe('Error');
    expect(s1.statusCode).toBe(500);
    const s2 = serializeError('weird');
    expect(s2.type).toBe('UnknownError');
  });
});

/**
 * Unit tests for GracefulShutdown, OperationTracker, and decorators
 */

let restoreConsole: (() => void) | null = null;
beforeEach(() => {
  const mocks: jest.SpyInstance[] = [];
  mocks.push(jest.spyOn(console, 'error').mockImplementation(() => {}));
  mocks.push(jest.spyOn(console, 'warn').mockImplementation(() => {}));
  mocks.push(jest.spyOn(console, 'log').mockImplementation(() => {}));
  mocks.push(jest.spyOn(console, 'debug').mockImplementation(() => {}));
  restoreConsole = () => { mocks.forEach(m => m.mockRestore()); restoreConsole = null; };
});
afterEach(() => { if (restoreConsole) restoreConsole(); });

import {
  GracefulShutdown,
  OperationTracker,
  TrackOperation,
  createShutdownHandler,
} from '../../../src/lib/health/graceful-shutdown';

describe('createShutdownHandler', () => {
  it('applies defaults and overrides', () => {
    const h1 = createShutdownHandler('h1', async () => {});
    expect(h1).toMatchObject({ name: 'h1', timeout: 5000, critical: false });

    const h2 = createShutdownHandler('h2', async () => {}, { timeout: 2000, critical: true });
    expect(h2).toMatchObject({ name: 'h2', timeout: 2000, critical: true });
  });
});

describe('TrackOperation decorator', () => {
  it('wraps method to delegate to OperationTracker with composed name', async () => {
    const gs = new GracefulShutdown();
    new OperationTracker(gs); // initialize singleton
    const spy = jest.spyOn(OperationTracker.prototype as any, 'trackOperation');

    class Service { async doWork(val: number) { return val * 2; } }
    const desc = Object.getOwnPropertyDescriptor(Service.prototype, 'doWork')!;
    // Manually apply decorator to avoid TS decorator config requirements
    const decorated = TrackOperation()(Service.prototype as any, 'doWork', desc) as PropertyDescriptor;
    Object.defineProperty(Service.prototype, 'doWork', decorated);

    const svc = new Service();
    const out = await (svc as any).doWork(3);
    expect(out).toBe(6);
    expect(spy).toHaveBeenCalled();
    const callArgs = spy.mock.calls[0];
    expect(String(callArgs[0])).toMatch(/Service\.doWork/);
  });
});

describe('GracefulShutdown flow', () => {
  let gs: GracefulShutdown;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    gs = new GracefulShutdown();
    exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
  });

  afterEach(() => {
    exitSpy.mockRestore();
    // Clear and restore timers to avoid executing delayed process.exit
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('executes shutdown handlers in reverse order', async () => {
    const order: string[] = [];
    gs.registerHandler({ name: 'first', handler: async () => { order.push('first'); } });
    gs.registerHandler({ name: 'second', handler: async () => { order.push('second'); } });

    await gs.initiateShutdown('SIGINT', 0);
    // Called reverse: second then first
    expect(order).toEqual(['second', 'first']);
    expect(exitSpy).toHaveBeenCalled();
  });

  it('OperationTracker rejects new operations when shutting down', async () => {
    const tracker = new OperationTracker(gs);
    // Simulate shutdown in progress
    jest.spyOn(gs as any, 'isShuttingDown').mockReturnValue(true);
    await expect(tracker.trackOperation('op', async () => 'x')).rejects.toThrow(/shutting down/);
  });
});

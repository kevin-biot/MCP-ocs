// Lightweight async timeout helpers with AbortSignal support

import { TimeoutError } from '../lib/errors/index.js';

export function createTimeoutSignal(timeoutMs: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  let timer: any;
  if (timeoutMs > 0) {
    timer = setTimeout(() => controller.abort(), timeoutMs);
    if (typeof (timer as any).unref === 'function') (timer as any).unref();
  }
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

export async function withTimeout<T>(fn: (signal?: AbortSignal) => Promise<T>, timeoutMs: number, label = 'operation'): Promise<T> {
  if (!timeoutMs || timeoutMs <= 0) return fn();
  const controller = new AbortController();
  let timer: any;
  return await new Promise<T>((resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new TimeoutError(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    if (typeof (timer as any).unref === 'function') (timer as any).unref();
    fn(controller.signal)
      .then((v) => { clearTimeout(timer); resolve(v); })
      .catch((err) => { clearTimeout(timer); reject(err); });
  });
}

// Lightweight async timeout helpers with AbortSignal support
import { TimeoutError } from '../lib/errors/index.js';
export function createTimeoutSignal(timeoutMs) {
    const controller = new AbortController();
    if (timeoutMs > 0 && typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
        // Prefer AbortSignal.timeout if available
        const timerSignal = AbortSignal.timeout(timeoutMs);
        // When timer aborts, propagate to controller
        timerSignal.addEventListener?.('abort', () => controller.abort());
    }
    else if (timeoutMs > 0) {
        const t = setTimeout(() => controller.abort(), timeoutMs).unref?.();
        return { signal: controller.signal, cancel: () => clearTimeout(t) };
    }
    return { signal: controller.signal, cancel: () => controller.abort() };
}
export async function withTimeout(fn, timeoutMs, label = 'operation') {
    if (!timeoutMs || timeoutMs <= 0)
        return fn();
    const { signal, cancel } = createTimeoutSignal(timeoutMs);
    try {
        return await fn(signal);
    }
    catch (err) {
        if (signal.aborted) {
            throw new TimeoutError(`${label} timed out after ${timeoutMs}ms`, { cause: err });
        }
        throw err;
    }
    finally {
        cancel();
    }
}

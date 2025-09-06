// Lightweight async timeout helpers with AbortSignal support
import { TimeoutError } from '../lib/errors/index.js';
export function createTimeoutSignal(timeoutMs) {
    const controller = new AbortController();
    let timer;
    if (timeoutMs > 0) {
        timer = setTimeout(() => controller.abort(), timeoutMs);
        if (typeof timer.unref === 'function')
            timer.unref();
    }
    return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}
export async function withTimeout(fn, timeoutMs, label = 'operation') {
    if (!timeoutMs || timeoutMs <= 0)
        return fn();
    const controller = new AbortController();
    let timer;
    return await new Promise((resolve, reject) => {
        timer = setTimeout(() => {
            controller.abort();
            reject(new TimeoutError(`${label} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
        if (typeof timer.unref === 'function')
            timer.unref();
        fn(controller.signal)
            .then((v) => { clearTimeout(timer); resolve(v); })
            .catch((err) => { clearTimeout(timer); reject(err); });
    });
}

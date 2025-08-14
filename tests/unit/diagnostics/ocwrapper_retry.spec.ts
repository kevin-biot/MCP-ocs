import { OcWrapperV2 } from '../../../src/v2/lib/oc-wrapper-v2';

describe('OcWrapperV2 retry behavior', () => {
  test('retries transient failures before succeeding', async () => {
    const oc = new OcWrapperV2('oc', 1000);
    let attempts = 0;
    (oc as any).executeWithTimeout = jest.fn(async () => {
      attempts++;
      if (attempts < 3) throw new Error('transient');
      return { stdout: '{"ok":true}', stderr: '' };
    });

    const res = await oc.executeOc(['get', 'pods', '-o', 'json'], { retries: 3 });
    expect(JSON.parse(res.stdout).ok).toBe(true);
    expect(attempts).toBe(3);
  });
});


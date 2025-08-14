import { spawnSync } from 'node:child_process';

describe('beta tools CLI (node)', () => {
  it('prints JSON with 8 tools', () => {
    const proc = spawnSync('node', ['scripts/beta-list.js', '--json'], { encoding: 'utf8' });
    expect(proc.status).toBe(0);
    const parsed = JSON.parse(proc.stdout);
    expect(parsed.count).toBe(8);
    expect(Array.isArray(parsed.tools)).toBe(true);
    expect(parsed.tools.length).toBe(8);
  });
});


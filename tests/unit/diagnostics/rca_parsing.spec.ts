import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

describe('RCA parseResourceValue', () => {
  const engine = new RCAChecklistEngine({} as any);
  const parse = (v: string) => (engine as any).parseResourceValue(v);

  test('CPU millicores and cores', () => {
    expect(parse('200m')).toBe(200);
    expect(parse('500m')).toBe(500);
    expect(parse('1')).toBe(1000);
    expect(parse('0.5')).toBe(500);
  });

  test('Memory units binary and decimal', () => {
    expect(parse('512Mi')).toBe(512 * Math.pow(2, 20));
    expect(parse('2Gi')).toBe(2 * Math.pow(2, 30));
    expect(parse('1G')).toBe(1e9);
    expect(parse('1M')).toBe(1e6);
    expect(parse('1Ki')).toBe(Math.pow(2, 10));
  });

  test('Fallback and invalid', () => {
    expect(parse('')).toBeNull();
    expect(parse('abc')).toBeNull();
  });
});

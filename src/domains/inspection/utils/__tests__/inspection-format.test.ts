import { describe, expect, it } from 'vitest';
import { formatPropertyName } from '@/domains/inspection/utils/inspection-format';

describe('formatPropertyName', () => {
  it('returns the name as-is when present', () => {
    expect(formatPropertyName('101동 1203호')).toBe('101동 1203호');
  });

  it('falls back to "동·호수 미정" for null or blank names', () => {
    expect(formatPropertyName(null)).toBe('동·호수 미정');
    expect(formatPropertyName('')).toBe('동·호수 미정');
    expect(formatPropertyName('   ')).toBe('동·호수 미정');
  });
});

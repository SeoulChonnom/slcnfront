import { describe, expect, it } from 'vitest';
import {
  isSamePropertyLink,
  normalizePropertyLinkValue,
} from '@/domains/inspection/utils/property-linking';

describe('normalizePropertyLinkValue', () => {
  it('trims leading/trailing whitespace', () => {
    expect(normalizePropertyLinkValue('  트리마제  ')).toBe('트리마제');
  });

  it('collapses internal runs of whitespace to a single space', () => {
    expect(normalizePropertyLinkValue('101동   1203호')).toBe('101동 1203호');
  });

  it('applies both rules together', () => {
    expect(normalizePropertyLinkValue('  101동    1203호 / 84A  ')).toBe(
      '101동 1203호 / 84A'
    );
  });

  it('leaves an already-normalized value unchanged', () => {
    expect(normalizePropertyLinkValue('트리마제')).toBe('트리마제');
  });
});

describe('isSamePropertyLink', () => {
  it('matches when both fields are equal after normalization', () => {
    expect(
      isSamePropertyLink(
        { complexName: '  트리마제 ', name: '101동  1203호' },
        { complexName: '트리마제', name: '101동 1203호' }
      )
    ).toBe(true);
  });

  it('does not match on partial/fuzzy overlap — this is exact match only', () => {
    expect(
      isSamePropertyLink(
        { complexName: '트리마제', name: '101동 1203호' },
        { complexName: '트리마제', name: '101동 1203호 / 84A' }
      )
    ).toBe(false);
  });

  it('is case-sensitive (unlike `keyword`, `complexName`/`name` matching is exact)', () => {
    expect(
      isSamePropertyLink(
        { complexName: 'Trimage', name: '101동' },
        { complexName: 'trimage', name: '101동' }
      )
    ).toBe(false);
  });

  it('does not match when only one field differs', () => {
    expect(
      isSamePropertyLink(
        { complexName: '트리마제', name: '101동 1203호' },
        { complexName: '리버뷰자이', name: '101동 1203호' }
      )
    ).toBe(false);
  });
});

import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useShoeDetail } from '../useShoeDetail';

describe('useShoeDetail', () => {
  it('returns detail data for a valid slug pair', () => {
    const { result } = renderHook(() => useShoeDetail('nike', 'v2k'));

    expect(result.current?.brand.brandId).toBe('nike');
    expect(result.current?.shoe.shoesId).toBe('v2k');
  });

  it('returns null for an invalid slug pair', () => {
    const { result } = renderHook(() => useShoeDetail('nike', 'missing'));

    expect(result.current).toBeNull();
  });
});

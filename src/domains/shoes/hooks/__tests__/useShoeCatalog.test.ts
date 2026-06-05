import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useShoeCatalog } from '../useShoeCatalog';

describe('useShoeCatalog', () => {
  it('returns the normalized catalog immediately', () => {
    const { result } = renderHook(() => useShoeCatalog());

    expect(result.current).toHaveLength(3);
    expect(result.current[1]?.brandId).toBe('nike');
  });
});

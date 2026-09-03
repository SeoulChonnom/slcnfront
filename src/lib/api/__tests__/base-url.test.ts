import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveApiBaseUrl } from '@/lib/api/base-url';

describe('resolveApiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('leaves an absolute base alone apart from a trailing slash', () => {
    expect(resolveApiBaseUrl('http://localhost:8080/api')).toBe(
      'http://localhost:8080/api/'
    );
    expect(resolveApiBaseUrl('http://localhost:8080/api/')).toBe(
      'http://localhost:8080/api/'
    );
    expect(resolveApiBaseUrl('https://api.example.com')).toBe(
      'https://api.example.com/'
    );
  });

  it('resolves the relative dev base against the current origin so the proxy sees it', () => {
    expect(resolveApiBaseUrl('/api')).toBe(`${window.location.origin}/api/`);
  });

  it('keeps a relative base usable as a URL base, which is what the callers need', () => {
    expect(
      new URL('assets/files/abc', resolveApiBaseUrl('/api')).toString()
    ).toBe(`${window.location.origin}/api/assets/files/abc`);
  });

  it('says what is wrong when a relative base has no origin to resolve against', () => {
    // stubGlobal so vitest restores window.location for every other suite --
    // a hand-rolled defineProperty here leaked and flaked unrelated files.
    vi.stubGlobal('location', undefined);

    expect(() => resolveApiBaseUrl('/api')).toThrow(/no document origin/);
  });
});

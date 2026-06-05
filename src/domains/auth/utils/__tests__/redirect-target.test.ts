import { describe, expect, it } from 'vitest';
import { resolvePostAuthRedirectTarget } from '../redirect-target';

describe('resolvePostAuthRedirectTarget', () => {
  it('keeps same-device redirect targets', () => {
    expect(
      resolvePostAuthRedirectTarget('?redirect=%2Fmain%2Fmap', 'main')
    ).toBe('/main/map');
    expect(
      resolvePostAuthRedirectTarget('?redirect=%2Fmobile%2Fcalendar', 'mobile')
    ).toBe('/mobile/calendar');
  });

  it('falls back to the device root for cross-device or unsafe redirect targets', () => {
    expect(
      resolvePostAuthRedirectTarget('?redirect=%2Fmobile%2Fmap', 'main')
    ).toBe('/main');
    expect(
      resolvePostAuthRedirectTarget('?redirect=%2Fmain%2Fmap', 'mobile')
    ).toBe('/mobile');
    expect(
      resolvePostAuthRedirectTarget('?redirect=%2F%2Fevil.com', 'main')
    ).toBe('/main');
  });
});

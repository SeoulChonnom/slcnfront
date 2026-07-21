import { describe, expect, it } from 'vitest';
import {
  resolveExternalRedirectTarget,
  resolvePostAuthRedirectTarget,
} from '../redirect-target';

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

  it('falls back to the device root for external app redirect targets', () => {
    expect(
      resolvePostAuthRedirectTarget(
        '?redirect=%2Fstock%2Fmarket%2Flatest',
        'main'
      )
    ).toBe('/main');
  });
});

describe('resolveExternalRedirectTarget', () => {
  it('returns known external app targets', () => {
    expect(
      resolveExternalRedirectTarget('?redirect=%2Fstock%2Fmarket%2Flatest')
    ).toBe('/stock/market/latest');
    expect(resolveExternalRedirectTarget('?redirect=%2Fstock')).toBe('/stock');
  });

  it('returns null for same-app or unsafe redirect targets', () => {
    expect(resolveExternalRedirectTarget('?redirect=%2Fmain%2Fmap')).toBeNull();
    expect(
      resolveExternalRedirectTarget('?redirect=%2F%2Fevil.com')
    ).toBeNull();
    expect(
      resolveExternalRedirectTarget('?redirect=%2Fstockpile%2Fmap')
    ).toBeNull();
    expect(resolveExternalRedirectTarget('')).toBeNull();
  });
});

import {
  detectPreferredDevice,
  resolvePublicEntryPath,
} from '../public-entry-resolver';

describe('public-entry-resolver', () => {
  it('keeps explicit device routes without re-resolving them', () => {
    expect(resolvePublicEntryPath('/mobile/map')).toBe('/mobile/map');
    expect(resolvePublicEntryPath('/main/calendar')).toBe('/main/calendar');
  });

  it('prefers mobile routes when the viewport matches the mobile breakpoint', () => {
    const matchMedia = () => ({ matches: true });

    expect(
      resolvePublicEntryPath('/calendar/week', {
        matchMedia,
        search: '?view=compact',
        hash: '#top',
      }),
    ).toBe('/mobile/calendar/week?view=compact#top');
  });

  it('falls back to main in environments without viewport information', () => {
    expect(detectPreferredDevice('/login')).toBe('main');
    expect(resolvePublicEntryPath('/login')).toBe('/main/login');
  });

  it('routes reserved public paths before shoe detail matching', () => {
    expect(resolvePublicEntryPath('/map/register')).toBe('/main/map/register');
    expect(resolvePublicEntryPath('/calendar/week')).toBe(
      '/main/calendar/week',
    );
  });

  it('routes unknown public paths to the device specific not-found page', () => {
    expect(resolvePublicEntryPath('/foo/bar/baz')).toBe('/main/404');
  });
});

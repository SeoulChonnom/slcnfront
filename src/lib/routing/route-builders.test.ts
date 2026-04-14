import { describe, expect, it } from 'vitest';
import {
  buildDeviceCalendarWeekPath,
  buildDeviceLoginPath,
  buildDeviceNotFoundPath,
  buildDeviceRootPath,
  buildDeviceShoeDetailPath,
  buildDeviceTripDetailPath,
  buildPublicCalendarMonthPath,
  buildPublicCalendarWeekPath,
  buildPublicLoginPath,
  buildPublicShoeDetailPath,
  buildPublicTripDetailPath,
} from './route-builders';

describe('route builders', () => {
  it('builds public urls', () => {
    expect(buildPublicLoginPath()).toBe('/login');
    expect(buildPublicCalendarMonthPath()).toBe('/calendar');
    expect(buildPublicCalendarWeekPath()).toBe('/calendar/week');
    expect(buildPublicTripDetailPath('20260101')).toBe('/map/20260101');
    expect(buildPublicShoeDetailPath('nike', 'pegasus-41')).toBe(
      '/nike/pegasus-41',
    );
  });

  it('builds main device urls', () => {
    expect(buildDeviceRootPath('main')).toBe('/main');
    expect(buildDeviceLoginPath('main')).toBe('/main/login');
    expect(buildDeviceTripDetailPath('main', '20260101')).toBe(
      '/main/map/20260101',
    );
    expect(buildDeviceCalendarWeekPath('main')).toBe('/main/calendar/week');
    expect(buildDeviceNotFoundPath('main')).toBe('/main/404');
  });

  it('builds mobile device urls', () => {
    expect(buildDeviceRootPath('mobile')).toBe('/mobile');
    expect(buildDeviceTripDetailPath('mobile', '20260101')).toBe(
      '/mobile/map/20260101',
    );
    expect(buildDeviceShoeDetailPath('mobile', 'new-balance', '860v14')).toBe(
      '/mobile/new-balance/860v14',
    );
  });
});

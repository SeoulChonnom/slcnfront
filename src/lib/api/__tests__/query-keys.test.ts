import { describe, expect, it } from 'vitest';
import {
  authQueryKeys,
  scheduleQueryKeys,
  shoesQueryKeys,
  tripQueryKeys,
} from '../query-keys';

describe('query-keys', () => {
  it('creates stable auth and trip keys', () => {
    expect(authQueryKeys.session()).toEqual(['auth', 'session']);
    expect(tripQueryKeys.list()).toEqual(['trip', 'list']);
    expect(tripQueryKeys.detail('2099-12-31')).toEqual([
      'trip',
      'detail',
      '2099-12-31',
    ]);
    expect(tripQueryKeys.file('/depot/logo.png')).toEqual([
      'trip',
      'file',
      '/depot/logo.png',
    ]);
  });

  it('creates stable schedule and shoes keys', () => {
    expect(scheduleQueryKeys.calendars()).toEqual(['schedule', 'calendars']);
    expect(
      scheduleQueryKeys.range(
        '2026-04-01T00:00:00+09:00',
        '2026-05-01T00:00:00+09:00',
      ),
    ).toEqual([
      'schedule',
      'range',
      '2026-04-01T00:00:00+09:00',
      '2026-05-01T00:00:00+09:00',
    ]);
    expect(scheduleQueryKeys.month(2026, 4)).toEqual([
      'schedule',
      'month',
      2026,
      4,
    ]);
    expect(scheduleQueryKeys.week('2026-04-06')).toEqual([
      'schedule',
      'week',
      '2026-04-06',
    ]);
    expect(shoesQueryKeys.catalog()).toEqual(['shoes', 'catalog']);
    expect(shoesQueryKeys.detail('nike', 'pegasus-41')).toEqual([
      'shoes',
      'detail',
      'nike',
      'pegasus-41',
    ]);
  });
});

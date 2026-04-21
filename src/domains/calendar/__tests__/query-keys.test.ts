import { describe, expect, it } from 'vitest';
import { calendarQueryKeys, calendarScheduleQueryKeys } from '../query-keys';

describe('calendar query-keys', () => {
  it('creates stable calendar and schedule keys', () => {
    expect(calendarQueryKeys.calendars()).toEqual(['calendar', 'calendars']);
    expect(calendarScheduleQueryKeys.range('2026-04-01', '2026-05-01')).toEqual(
      ['calendar', 'schedule', 'range', '2026-04-01', '2026-05-01']
    );
    expect(calendarScheduleQueryKeys.month(2026, 4)).toEqual([
      'calendar',
      'schedule',
      'month',
      2026,
      4,
    ]);
    expect(calendarScheduleQueryKeys.week('2026-04-14')).toEqual([
      'calendar',
      'schedule',
      'week',
      '2026-04-14',
    ]);
  });
});

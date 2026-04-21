import dayjs from 'dayjs';
import { calendarScheduleQueryKeys } from '../query-keys';
import { formatMonthLabel, getMonthRange } from '../utils/calendar-date';
import { useCalendarRangeData } from './useCalendarRangeData';

export function useCalendarMonth(dateKey: string) {
  const anchor = dayjs(dateKey);
  const anchorYear = anchor.year();
  const anchorMonth = anchor.month() + 1;
  return useCalendarRangeData({
    dateKey,
    getRange: getMonthRange,
    getLabel: formatMonthLabel,
    getScheduleQueryKey: () =>
      calendarScheduleQueryKeys.month(anchorYear, anchorMonth),
  });
}

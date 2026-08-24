import dayjs from 'dayjs';
import { useCalendarRangeData } from '@/domains/calendar/hooks/useCalendarRangeData';
import { calendarScheduleQueryKeys } from '@/domains/calendar/query-keys';
import {
  formatMonthLabel,
  getMonthRange,
} from '@/domains/calendar/utils/calendar-date';

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

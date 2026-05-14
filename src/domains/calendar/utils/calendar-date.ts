import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/ko';

dayjs.extend(localeData);
dayjs.extend(isoWeek);
dayjs.locale('ko');

export const API_DATE_FORMAT = 'YYYY-MM-DD';
export const API_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
const CALENDAR_QUERY_DATE_FORMAT = 'YYYY-MM-DD';

export type CalendarRange = {
  start: string;
  end: string;
};

export function getTodayDateKey() {
  return dayjs().format(CALENDAR_QUERY_DATE_FORMAT);
}

export function normalizeCalendarDateKey(value: string | null | undefined) {
  if (!value) {
    return getTodayDateKey();
  }

  const parsed = dayjs(value);

  if (!parsed.isValid()) {
    return getTodayDateKey();
  }

  return parsed.format(CALENDAR_QUERY_DATE_FORMAT);
}

export function getMonthRange(dateKey: string): CalendarRange {
  const anchor = dayjs(dateKey);
  const start = anchor.startOf('month');
  const end = start.add(1, 'month');

  return {
    start: start.format(API_DATE_TIME_FORMAT),
    end: end.format(API_DATE_TIME_FORMAT),
  };
}

export function getWeekRange(dateKey: string): CalendarRange {
  const anchor = dayjs(dateKey);
  const start = anchor.startOf('week');
  const end = start.add(1, 'week');

  return {
    start: start.format(API_DATE_TIME_FORMAT),
    end: end.format(API_DATE_TIME_FORMAT),
  };
}

export function formatMonthLabel(dateKey: string) {
  return dayjs(dateKey).format('YYYY년 M월');
}

export function formatWeekLabel(dateKey: string) {
  const anchor = dayjs(dateKey);
  const start = anchor.startOf('week');
  const end = start.endOf('week');

  if (start.month() === end.month()) {
    return `${start.format('M월 D일')} - ${end.format('D일')}`;
  }

  return `${start.format('M월 D일')} - ${end.format('M월 D일')}`;
}

export function shiftMonth(dateKey: string, offset: number) {
  return dayjs(dateKey).add(offset, 'month').format(CALENDAR_QUERY_DATE_FORMAT);
}

export function shiftWeek(dateKey: string, offset: number) {
  return dayjs(dateKey).add(offset, 'week').format(CALENDAR_QUERY_DATE_FORMAT);
}

export function formatDraftDateTime(
  dateValue: string,
  timeValue: string,
  allDay: boolean
) {
  if (allDay) {
    return dayjs(dateValue).format(API_DATE_FORMAT);
  }

  return dayjs(`${dateValue}T${timeValue}`).format(API_DATE_TIME_FORMAT);
}

export function toExclusiveAllDayEnd(endValue: string) {
  return dayjs(endValue).add(1, 'day').format(API_DATE_FORMAT);
}

export function toInclusiveAllDayEnd(endValue: Date | string | null) {
  if (!endValue) {
    return null;
  }

  return dayjs(endValue).subtract(1, 'day').format(API_DATE_FORMAT);
}

export function doesScheduleOverlapRange(
  start: string,
  end: string,
  rangeStart: string,
  rangeEnd: string,
  allDay: boolean
) {
  const eventStart = dayjs(start);
  const normalizedEventEnd = allDay ? dayjs(end).add(1, 'day') : dayjs(end);
  const queryStart = dayjs(rangeStart);
  const queryEnd = dayjs(rangeEnd);

  if (
    !eventStart.isValid() ||
    !normalizedEventEnd.isValid() ||
    !queryStart.isValid() ||
    !queryEnd.isValid()
  ) {
    return false;
  }

  return (
    eventStart.isBefore(queryEnd) && normalizedEventEnd.isAfter(queryStart)
  );
}

export function coerceTimeValue(value: string | null | undefined) {
  if (!value) {
    return '09:00';
  }

  const parsed = dayjs(value);

  if (!parsed.isValid()) {
    return '09:00';
  }

  return parsed.format('HH:mm');
}

export function coerceDateValue(value: string | null | undefined) {
  if (!value) {
    return getTodayDateKey();
  }

  const parsed = dayjs(value);

  if (!parsed.isValid()) {
    return getTodayDateKey();
  }

  return parsed.format(API_DATE_FORMAT);
}

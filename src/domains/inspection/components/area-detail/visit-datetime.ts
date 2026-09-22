import {
  formatVisitedAtDate,
  formatVisitedAtTime,
} from '@/domains/inspection/utils/inspection-format';

/**
 * §5.2 / requirements_specification.md §9: the visit time-of-day label
 * ("오전"/"오후"/"저녁"/"밤") is derived from the single stored `visitedAt`
 * datetime, never stored as a separate enum. Boundaries follow the four
 * buckets the spec names (MORNING/AFTERNOON/EVENING/NIGHT) as illustrated by
 * the prototype: 11:00 → 오전, 14:00 → 오후, 18:30 → 저녁.
 */
const WEEKDAY_LABELS = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
] as const;

const WEEKDAY_SHORT_LABELS = [
  '일',
  '월',
  '화',
  '수',
  '목',
  '금',
  '토',
] as const;

const VISITED_AT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

function parseVisitedAt(visitedAt: string) {
  const match = VISITED_AT_PATTERN.exec(visitedAt);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
  };
}

function getWeekdayIndex(visitedAt: string): number | null {
  const parsed = parseVisitedAt(visitedAt);

  if (!parsed) {
    return null;
  }

  // No zone info on `visitedAt` (see inspection-format.ts) — a plain calendar
  // date/time is enough to derive the day of week without going through the
  // browser's local zone shifting the date.
  return new Date(parsed.year, parsed.month - 1, parsed.day).getDay();
}

function getDayPeriodLabel(hour: number): string {
  if (hour >= 5 && hour < 12) {
    return '오전';
  }
  if (hour >= 12 && hour < 18) {
    return '오후';
  }
  if (hour >= 18 && hour < 21) {
    return '저녁';
  }
  return '밤';
}

/** "2026-09-17T14:00" → "목" */
export function formatVisitedAtWeekdayShort(visitedAt: string): string {
  const index = getWeekdayIndex(visitedAt);
  return index === null ? '' : WEEKDAY_SHORT_LABELS[index];
}

/** "2026-09-17T14:00" → "2026.09.17 목요일 14:00 · 오후" */
export function formatVisitDateTimeLine(visitedAt: string): string {
  const parsed = parseVisitedAt(visitedAt);
  const date = formatVisitedAtDate(visitedAt);
  const time = formatVisitedAtTime(visitedAt);

  if (!parsed) {
    return date;
  }

  const weekdayIndex = getWeekdayIndex(visitedAt);
  const weekday = weekdayIndex === null ? '' : WEEKDAY_LABELS[weekdayIndex];
  const period = getDayPeriodLabel(parsed.hour);

  return [date, weekday, time, `· ${period}`].filter(Boolean).join(' ');
}

/** "2026-06-02T11:00" → "6월" — used for the cross-visit delta note. */
export function formatVisitMonthLabel(visitedAt: string): string {
  const parsed = parseVisitedAt(visitedAt);
  return parsed ? `${parsed.month}월` : '';
}

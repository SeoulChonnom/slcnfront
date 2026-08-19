const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** Digits-only key so `2024-11-10`, `20241110`, and ISO datetimes all compare. */
export function toSortKey(raw: string): string {
  return raw.replace(/\D/g, '');
}

/** Normalizes any of the API's date shapes to `YYYY-MM-DD`, or null if unusable. */
export function toIsoDate(raw: string): string | null {
  const digits = toSortKey(raw).slice(0, 8);

  if (digits.length < 8) {
    return null;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

export function formatRailDay(isoDate: string): string {
  return isoDate.slice(5).replace('-', '.');
}

export function formatRailYear(isoDate: string): string {
  return isoDate.slice(0, 4);
}

export function formatRailWeekday(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00+09:00`);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return WEEKDAY_LABELS[date.getDay()] ?? '';
}

export function formatScheduleTime(
  start: string,
  allDay: boolean
): string | null {
  if (allDay) {
    return '하루 종일';
  }

  const time = start.match(/T(\d{2}):(\d{2})/);

  if (!time) {
    return null;
  }

  return `${time[1]}:${time[2]}`;
}

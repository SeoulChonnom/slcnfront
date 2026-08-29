/** Digits-only key so `2024-11-10`, `20241110`, and ISO datetimes all compare. */
export function toSortKey(raw: string): string {
  return raw.replace(/\D/g, '');
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

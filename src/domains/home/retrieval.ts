import type { ScheduleEvent } from '@/domains/calendar/types';
import { toSortKey } from '@/domains/home/utils/home-dates';
import type { TravelListItem } from '@/domains/travel/types';

export type TravelRetrievalFilters = {
  year?: string | null;
  query?: string;
};

function travelSortKey(travel: TravelListItem) {
  return toSortKey(travel.startDate);
}

function travelYear(travel: TravelListItem) {
  return travelSortKey(travel).slice(0, 4);
}

/** Returns a fresh array so client-side retrieval never mutates query data. */
export function sortTravelsNewestFirst(travels: TravelListItem[]) {
  return [...travels].sort((a, b) => {
    const dateOrder = travelSortKey(b).localeCompare(travelSortKey(a));

    if (dateOrder !== 0) {
      return dateOrder;
    }

    return a.id.localeCompare(b.id);
  });
}

/** Derives the available year jump targets from every loaded travel. */
export function getTravelYears(travels: TravelListItem[]) {
  return Array.from(
    new Set(
      sortTravelsNewestFirst(travels)
        .map(travelYear)
        .filter((year) => /^\d{4}$/.test(year))
    )
  );
}

/**
 * Applies the optional year and free-text retrieval filters to loaded travel
 * records. Search intentionally stays within fields present in the list
 * response: title, region, and the one-line review.
 */
export function filterTravelRecords(
  travels: TravelListItem[],
  { year = null, query = '' }: TravelRetrievalFilters = {}
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const normalizedYear = year?.trim() ?? '';

  return sortTravelsNewestFirst(travels).filter((travel) => {
    if (normalizedYear && travelYear(travel) !== normalizedYear) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [travel.title, travel.region, travel.oneLineReview ?? '']
      .join(' ')
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  });
}

type ScheduleCandidate = {
  schedule: ScheduleEvent;
  dateKey: string;
  kindRank: 0 | 1;
  timedTime: number;
};

/**
 * Returns the nearest future schedule records without mutating query data.
 * Calendar date is the primary ordering key; all-day records lead timed
 * records on that date, then timed records use their absolute start time.
 */
export function getNearestSchedules(
  schedules: ScheduleEvent[],
  now = new Date(),
  limit = 3
) {
  const nowTime = now.getTime();
  const todayKey = localDateKey(now);

  if (!Number.isFinite(nowTime) || !todayKey) {
    return [];
  }

  return schedules
    .map((schedule): ScheduleCandidate | null => {
      const dateKey = scheduleDateKey(schedule.start, schedule.allDay);

      if (!dateKey || !isValidDateKey(dateKey)) {
        return null;
      }

      if (schedule.allDay) {
        if (dateKey < todayKey) {
          return null;
        }

        return { schedule, dateKey, kindRank: 0, timedTime: 0 };
      }

      const startTime = new Date(schedule.start).getTime();

      if (!Number.isFinite(startTime) || startTime < nowTime) {
        return null;
      }

      return { schedule, dateKey, kindRank: 1, timedTime: startTime };
    })
    .filter((candidate): candidate is ScheduleCandidate => candidate !== null)
    .sort(
      (a, b) =>
        a.dateKey.localeCompare(b.dateKey) ||
        a.kindRank - b.kindRank ||
        a.timedTime - b.timedTime ||
        a.schedule.id.localeCompare(b.schedule.id)
    )
    .slice(0, Math.max(0, limit))
    .map(({ schedule }) => schedule);
}

function localDateKey(date: Date) {
  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}${String(date.getDate()).padStart(2, '0')}`;
}

function scheduleDateKey(raw: string, allDay: boolean) {
  if (!allDay) {
    const parsed = new Date(raw);

    if (Number.isFinite(parsed.getTime())) {
      return localDateKey(parsed);
    }
  }

  const digits = toSortKey(raw).slice(0, 8);

  if (/^\d{8}$/.test(digits)) {
    return digits;
  }

  const parsed = new Date(raw);
  return localDateKey(parsed);
}

function isValidDateKey(dateKey: string) {
  if (!/^\d{8}$/.test(dateKey)) {
    return false;
  }

  const year = Number(dateKey.slice(0, 4));
  const month = Number(dateKey.slice(4, 6));
  const day = Number(dateKey.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

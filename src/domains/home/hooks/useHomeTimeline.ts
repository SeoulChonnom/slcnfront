import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { scheduleApi } from '../../calendar/api/schedule-api';
import { calendarScheduleQueryKeys } from '../../calendar/query-keys';
import { useTravelList } from '../../travel/hooks/useTravelList';
import { useTripList } from '../../trip/hooks/useTripList';
import type { HomeTimelineEntry } from '../types';
import { toIsoDate, toSortKey } from '../utils/home-dates';

/**
 * How much of each side of "today" the home surface shows before handing off to
 * the full list pages. Kept small on purpose: every record with an image costs
 * one authenticated blob request.
 */
const UPCOMING_LIMIT = 3;
const PAST_LIMIT = 8;

function todaySortKey() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');

  return `${now.getFullYear()}${month}${day}`;
}

export function useHomeTimeline() {
  const trips = useTripList();
  const travels = useTravelList();
  const schedules = useQuery({
    queryKey: calendarScheduleQueryKeys.now(),
    queryFn: () => scheduleApi.getCurrentSchedules(),
  });

  const upcoming = useMemo<HomeTimelineEntry[]>(() => {
    const today = todaySortKey();

    return (schedules.data ?? [])
      .flatMap((schedule) => {
        const isoDate = toIsoDate(schedule.start);
        const sortKey = toSortKey(schedule.start);

        if (!isoDate || sortKey.slice(0, 8) < today) {
          return [];
        }

        return [
          {
            kind: 'schedule' as const,
            id: schedule.id,
            sortKey,
            isoDate,
            schedule,
          },
        ];
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(0, UPCOMING_LIMIT);
  }, [schedules.data]);

  const past = useMemo<HomeTimelineEntry[]>(() => {
    const tripEntries = (trips.data ?? []).flatMap((trip) => {
      const isoDate = toIsoDate(trip.date);

      if (!isoDate) {
        return [];
      }

      return [
        {
          kind: 'trip' as const,
          id: trip.id,
          sortKey: toSortKey(trip.date),
          isoDate,
          trip,
        },
      ];
    });

    const travelEntries = (travels.data ?? []).flatMap((travel) => {
      const isoDate = toIsoDate(travel.startDate);

      if (!isoDate) {
        return [];
      }

      return [
        {
          kind: 'travel' as const,
          id: travel.travelId,
          sortKey: toSortKey(travel.startDate),
          isoDate,
          travel,
        },
      ];
    });

    return [...tripEntries, ...travelEntries]
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
      .slice(0, PAST_LIMIT);
  }, [trips.data, travels.data]);

  return {
    upcoming,
    past,
    isLoading: trips.isLoading || travels.isLoading || schedules.isLoading,
    isError: trips.isError && travels.isError && schedules.isError,
  };
}

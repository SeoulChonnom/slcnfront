import { startTransition, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { DeviceType } from '../../../../app/router/route-constants';
import {
  buildDeviceCalendarMonthPath,
  buildDeviceCalendarWeekPath,
} from '../../../../lib/routing/route-builders';
import type { CalendarViewMode } from '../../types';
import {
  getTodayDateKey,
  normalizeCalendarDateKey,
  shiftMonth,
  shiftWeek,
} from '../../utils/calendar-date';

type UseCalendarNavigationOptions = {
  device: DeviceType;
  view: CalendarViewMode;
};

export function useCalendarNavigation({
  device,
  view,
}: UseCalendarNavigationOptions) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentDate = normalizeCalendarDateKey(searchParams.get('date'));

  const updateDateParam = useCallback(
    (nextDate: string) => {
      startTransition(() => {
        setSearchParams({ date: nextDate });
      });
    },
    [setSearchParams]
  );

  const moveDate = useCallback(
    (direction: -1 | 1) => {
      updateDateParam(
        view === 'month'
          ? shiftMonth(currentDate, direction)
          : shiftWeek(currentDate, direction)
      );
    },
    [currentDate, updateDateParam, view]
  );

  const onViewChange = useCallback(
    (nextView: CalendarViewMode) => {
      const nextPath =
        nextView === 'month'
          ? buildDeviceCalendarMonthPath(device)
          : buildDeviceCalendarWeekPath(device);

      startTransition(() => {
        navigate(`${nextPath}?date=${currentDate}`);
      });
    },
    [currentDate, device, navigate]
  );

  return {
    currentDate,
    onViewChange,
    onPrev: () => moveDate(-1),
    onToday: () => updateDateParam(getTodayDateKey()),
    onNext: () => moveDate(1),
  };
}

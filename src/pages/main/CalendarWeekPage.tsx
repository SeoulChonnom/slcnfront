import { useSearchParams } from 'react-router-dom';
import { CalendarSection } from '../../domains/calendar/components/CalendarSection';
import { useCalendarWeek } from '../../domains/calendar/hooks/useCalendarWeek';
import { normalizeCalendarDateKey } from '../../domains/calendar/utils/calendar-date';

export function CalendarWeekPage() {
  const [searchParams] = useSearchParams();
  const state = useCalendarWeek(
    normalizeCalendarDateKey(searchParams.get('date')),
  );

  return <CalendarSection device="main" view="week" state={state} />;
}

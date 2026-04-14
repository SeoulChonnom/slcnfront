import { useSearchParams } from 'react-router-dom';
import { CalendarSection } from '../../domains/calendar/components/CalendarSection';
import { useCalendarMonth } from '../../domains/calendar/hooks/useCalendarMonth';
import { normalizeCalendarDateKey } from '../../domains/calendar/utils/calendar-date';

export function CalendarMonthPage() {
  const [searchParams] = useSearchParams();
  const state = useCalendarMonth(normalizeCalendarDateKey(searchParams.get('date')));

  return <CalendarSection device="main" view="month" state={state} />;
}

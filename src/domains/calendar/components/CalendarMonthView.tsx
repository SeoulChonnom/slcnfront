import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, {
  type EventResizeDoneArg,
} from '@fullcalendar/interaction';
import type {
  EventClickArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core';
import { CalendarTimelineView } from './CalendarTimelineView';

type CalendarMonthViewProps = {
  currentDate: string;
  events: EventInput[];
  onSelect: (selection: { start: Date; end: Date; allDay: boolean }) => void;
  onEventClick: (event: EventClickArg['event']) => void;
  onEventDrop: (arg: EventDropArg) => Promise<void>;
  onEventResize: (arg: EventResizeDoneArg) => Promise<void>;
};

export function CalendarMonthView({
  currentDate,
  events,
  onSelect,
  onEventClick,
  onEventDrop,
  onEventResize,
}: CalendarMonthViewProps) {
  return (
    <CalendarTimelineView
      currentDate={currentDate}
      events={events}
      className="slcn-calendar-surface slcn-calendar-surface--month"
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      dayMaxEvents={3}
      fixedWeekCount={false}
      onSelect={onSelect}
      onEventClick={onEventClick}
      onEventDrop={onEventDrop}
      onEventResize={onEventResize}
    />
  );
}

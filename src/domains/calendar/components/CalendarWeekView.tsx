import interactionPlugin, {
  type EventResizeDoneArg,
} from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import type {
  EventClickArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core';
import { CalendarTimelineView } from './CalendarTimelineView';

type CalendarWeekViewProps = {
  currentDate: string;
  events: EventInput[];
  selectable?: boolean;
  onSelect: (selection: { start: Date; end: Date; allDay: boolean }) => void;
  onDateClick?: (selection: { date: Date; allDay: boolean }) => void;
  onEventClick: (event: EventClickArg['event']) => void;
  onEventDrop: (arg: EventDropArg) => Promise<void>;
  onEventResize: (arg: EventResizeDoneArg) => Promise<void>;
};

export function CalendarWeekView({
  currentDate,
  events,
  selectable,
  onSelect,
  onDateClick,
  onEventClick,
  onEventDrop,
  onEventResize,
}: CalendarWeekViewProps) {
  return (
    <CalendarTimelineView
      currentDate={currentDate}
      events={events}
      className="slcn-calendar-surface slcn-calendar-surface--week"
      plugins={[timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      selectable={selectable}
      nowIndicator
      allDaySlot
      slotMinTime="07:00:00"
      slotMaxTime="23:00:00"
      onSelect={onSelect}
      onDateClick={onDateClick}
      onEventClick={onEventClick}
      onEventDrop={onEventDrop}
      onEventResize={onEventResize}
    />
  );
}

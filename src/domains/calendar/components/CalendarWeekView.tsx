import FullCalendar from '@fullcalendar/react';
import interactionPlugin, { type EventResizeDoneArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import koLocale from '@fullcalendar/core/locales/ko';
import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core';

type CalendarWeekViewProps = {
  currentDate: string;
  events: EventInput[];
  onSelect: (selection: { start: Date; end: Date; allDay: boolean }) => void;
  onEventClick: (event: EventClickArg['event']) => void;
  onEventDrop: (arg: EventDropArg) => Promise<void>;
  onEventResize: (arg: EventResizeDoneArg) => Promise<void>;
};

export function CalendarWeekView({
  currentDate,
  events,
  onSelect,
  onEventClick,
  onEventDrop,
  onEventResize,
}: CalendarWeekViewProps) {
  return (
    <div className="slcn-calendar-surface slcn-calendar-surface--week">
      <FullCalendar
        key={`week-${currentDate}`}
        plugins={[timeGridPlugin, interactionPlugin]}
        locale={koLocale}
        initialView="timeGridWeek"
        initialDate={currentDate}
        headerToolbar={false}
        events={events}
        height="auto"
        selectable
        nowIndicator
        allDaySlot
        slotMinTime="07:00:00"
        slotMaxTime="23:00:00"
        select={(selection: DateSelectArg) => {
          onSelect({
            start: selection.start,
            end: selection.end,
            allDay: selection.allDay,
          });
        }}
        eventClick={(click) => onEventClick(click.event)}
        eventDrop={async (arg) => {
          await onEventDrop(arg);
        }}
        eventResize={async (arg) => {
          await onEventResize(arg);
        }}
      />
    </div>
  );
}

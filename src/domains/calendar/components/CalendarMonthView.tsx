import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { type EventResizeDoneArg } from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core';

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
    <div className="slcn-calendar-surface slcn-calendar-surface--month">
      <FullCalendar
        key={`month-${currentDate}`}
        plugins={[dayGridPlugin, interactionPlugin]}
        locale={koLocale}
        initialView="dayGridMonth"
        initialDate={currentDate}
        headerToolbar={false}
        events={events}
        height="auto"
        selectable
        dayMaxEvents={3}
        fixedWeekCount={false}
        eventDisplay="block"
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

import '@fullcalendar/core/internal';
import '@fullcalendar/daygrid/internal';
import '@fullcalendar/timegrid/internal';
import FullCalendar from '@fullcalendar/react';
import koLocale from '@fullcalendar/core/locales/ko';
import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import type { ComponentProps } from 'react';

type CalendarTimelineViewProps = {
  currentDate: string;
  events: EventInput[];
  className: string;
  plugins: ComponentProps<typeof FullCalendar>['plugins'];
  initialView: string;
  height?: string | number;
  selectable?: boolean;
  dayMaxEvents?: number;
  fixedWeekCount?: boolean;
  nowIndicator?: boolean;
  allDaySlot?: boolean;
  slotMinTime?: string;
  slotMaxTime?: string;
  onSelect: (selection: { start: Date; end: Date; allDay: boolean }) => void;
  onDateClick?: (selection: { date: Date; allDay: boolean }) => void;
  onEventClick: (event: EventClickArg['event']) => void;
  onEventDrop: (arg: EventDropArg) => Promise<void>;
  onEventResize: (arg: EventResizeDoneArg) => Promise<void>;
};

export function CalendarTimelineView({
  currentDate,
  events,
  className,
  plugins,
  initialView,
  height = 'auto',
  selectable = true,
  dayMaxEvents,
  fixedWeekCount,
  nowIndicator,
  allDaySlot,
  slotMinTime,
  slotMaxTime,
  onSelect,
  onDateClick,
  onEventClick,
  onEventDrop,
  onEventResize,
}: CalendarTimelineViewProps) {
  return (
    <div className={className}>
      <FullCalendar
        key={`${initialView}-${currentDate}`}
        plugins={plugins}
        locale={koLocale}
        initialView={initialView}
        initialDate={currentDate}
        headerToolbar={false}
        events={events}
        height={height}
        selectable={selectable}
        dayMaxEvents={dayMaxEvents}
        fixedWeekCount={fixedWeekCount}
        nowIndicator={nowIndicator}
        allDaySlot={allDaySlot}
        slotMinTime={slotMinTime}
        slotMaxTime={slotMaxTime}
        eventDisplay="block"
        select={(selection: DateSelectArg) => {
          onSelect({
            start: selection.start,
            end: selection.end,
            allDay: selection.allDay,
          });
        }}
        dateClick={
          onDateClick
            ? (click) => {
                onDateClick({
                  date: click.date,
                  allDay: click.allDay,
                });
              }
            : undefined
        }
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

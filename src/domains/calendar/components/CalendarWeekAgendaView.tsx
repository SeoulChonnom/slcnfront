import type { EventApi, EventInput } from '@fullcalendar/core';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { getTodayDateKey } from '../utils/calendar-date';
import { CalendarAgendaSections } from './CalendarAgendaSections';

type CalendarWeekAgendaViewProps = {
  currentDate: string;
  events: EventInput[];
  onEventClick: (event: EventApi) => void;
};

type WeekDay = {
  key: string;
  weekdayLabel: string;
  dayNumber: number;
  weekday: number;
};

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function buildWeekDays(currentDate: string): WeekDay[] {
  const start = dayjs(currentDate).startOf('week');

  return Array.from({ length: 7 }, (_, index) => {
    const value = start.add(index, 'day');

    return {
      key: value.format('YYYY-MM-DD'),
      weekdayLabel: WEEKDAY_LABELS[value.day()],
      dayNumber: value.date(),
      weekday: value.day(),
    };
  });
}

export function CalendarWeekAgendaView({
  currentDate,
  events,
  onEventClick,
}: CalendarWeekAgendaViewProps) {
  const weekDays = useMemo(() => buildWeekDays(currentDate), [currentDate]);
  const todayKey = getTodayDateKey();

  const { rangeStart, rangeEnd } = useMemo(() => {
    const start = dayjs(currentDate).startOf('week');

    return {
      rangeStart: start.format('YYYY-MM-DD'),
      rangeEnd: start.add(7, 'day').format('YYYY-MM-DD'),
    };
  }, [currentDate]);

  return (
    <div className='slcn-calendar-agenda'>
      <ul className='slcn-calendar-agenda__strip'>
        {weekDays.map((day) => {
          const isToday = day.key === todayKey;
          const weekdayClass =
            day.weekday === 0
              ? ' slcn-calendar-agenda__chip--sunday'
              : day.weekday === 6
                ? ' slcn-calendar-agenda__chip--saturday'
                : '';

          return (
            <li
              key={day.key}
              className={`slcn-calendar-agenda__chip${
                isToday ? ' slcn-calendar-agenda__chip--selected' : ''
              }${weekdayClass}`}
            >
              <span className='slcn-calendar-agenda__chip-weekday'>
                {day.weekdayLabel}
              </span>
              <span className='slcn-calendar-agenda__chip-day'>
                {day.dayNumber}
              </span>
            </li>
          );
        })}
      </ul>

      <CalendarAgendaSections
        events={events}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onEventClick={onEventClick}
      />
    </div>
  );
}

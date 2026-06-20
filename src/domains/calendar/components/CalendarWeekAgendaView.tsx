import type { EventApi, EventInput } from '@fullcalendar/core';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { getTodayDateKey } from '../utils/calendar-date';

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

type AgendaEvent = {
  id: string;
  title: string;
  timeLabel: string | null;
  accentColor: string;
  sortValue: number;
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

function resolveEventColor(event: EventInput): string {
  const color =
    (typeof event.backgroundColor === 'string' && event.backgroundColor) ||
    (typeof event.borderColor === 'string' && event.borderColor) ||
    '';

  return color || 'var(--color-primary)';
}

function buildAgendaEvents(
  events: EventInput[],
  selectedDayKey: string
): AgendaEvent[] {
  const dayStart = dayjs(selectedDayKey).startOf('day');
  const dayEnd = dayStart.add(1, 'day');

  return events
    .filter((event) => {
      if (!event.start) {
        return false;
      }

      const start = dayjs(event.start as string);

      if (!start.isValid()) {
        return false;
      }

      // FullCalendar all-day end is exclusive; timed end falls back to start.
      const end = event.end ? dayjs(event.end as string) : start.add(1, 'hour');

      // Include any event whose span overlaps the selected day.
      return start.isBefore(dayEnd) && end.isAfter(dayStart);
    })
    .map((event) => {
      const start = dayjs(event.start as string);
      const isAllDay = event.allDay === true;

      return {
        id: String(event.id ?? ''),
        title: typeof event.title === 'string' ? event.title : '',
        timeLabel: isAllDay ? null : start.format('A h:mm'),
        accentColor: resolveEventColor(event),
        sortValue: isAllDay ? -1 : start.valueOf(),
      };
    })
    .sort((a, b) => a.sortValue - b.sortValue);
}

export function CalendarWeekAgendaView({
  currentDate,
  events,
  onEventClick,
}: CalendarWeekAgendaViewProps) {
  const weekDays = useMemo(() => buildWeekDays(currentDate), [currentDate]);

  const defaultSelectedKey = useMemo(() => {
    const today = getTodayDateKey();
    const todayInWeek = weekDays.find((day) => day.key === today);

    return todayInWeek?.key ?? weekDays[0]?.key ?? today;
  }, [weekDays]);

  const [selectedDayKey, setSelectedDayKey] = useState(defaultSelectedKey);

  // Keep selection inside the visible week when the week changes.
  const activeDayKey = useMemo(() => {
    const exists = weekDays.some((day) => day.key === selectedDayKey);

    return exists ? selectedDayKey : defaultSelectedKey;
  }, [defaultSelectedKey, selectedDayKey, weekDays]);

  const agendaEvents = useMemo(
    () => buildAgendaEvents(events, activeDayKey),
    [events, activeDayKey]
  );

  const headingLabel = useMemo(
    () => `${dayjs(activeDayKey).format('M월 D일 (ddd)')} 일정`,
    [activeDayKey]
  );

  return (
    <div className='slcn-calendar-agenda'>
      <div className='slcn-calendar-agenda__strip' role='tablist'>
        {weekDays.map((day) => {
          const isSelected = day.key === activeDayKey;
          const weekdayClass =
            day.weekday === 0
              ? ' slcn-calendar-agenda__chip--sunday'
              : day.weekday === 6
                ? ' slcn-calendar-agenda__chip--saturday'
                : '';

          return (
            <button
              key={day.key}
              type='button'
              role='tab'
              aria-selected={isSelected}
              className={`slcn-calendar-agenda__chip${
                isSelected ? ' slcn-calendar-agenda__chip--selected' : ''
              }${weekdayClass}`}
              onClick={() => setSelectedDayKey(day.key)}
            >
              <span className='slcn-calendar-agenda__chip-weekday'>
                {day.weekdayLabel}
              </span>
              <span className='slcn-calendar-agenda__chip-day'>
                {day.dayNumber}
              </span>
            </button>
          );
        })}
      </div>

      <h3 className='slcn-calendar-agenda__heading'>{headingLabel}</h3>

      {agendaEvents.length === 0 ? (
        <p className='slcn-calendar-agenda__empty'>
          이 날에는 등록된 일정이 없어요.
        </p>
      ) : (
        <ul className='slcn-calendar-agenda__list'>
          {agendaEvents.map((event) => (
            <li key={event.id}>
              <button
                type='button'
                className='slcn-calendar-agenda__event'
                style={{ '--slcn-agenda-accent': event.accentColor } as never}
                onClick={() => onEventClick({ id: event.id } as EventApi)}
              >
                <span className='slcn-calendar-agenda__event-time'>
                  {event.timeLabel ?? '종일'}
                </span>
                <span className='slcn-calendar-agenda__event-title'>
                  {event.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

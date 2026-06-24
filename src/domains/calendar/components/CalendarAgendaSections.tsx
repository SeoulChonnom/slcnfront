import type { EventApi, EventInput } from '@fullcalendar/core';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef } from 'react';
import { getTodayDateKey } from '../utils/calendar-date';

type CalendarAgendaSectionsProps = {
  events: EventInput[];
  /** Inclusive start of the period (YYYY-MM-DD). */
  rangeStart: string;
  /** Exclusive end of the period (YYYY-MM-DD). */
  rangeEnd: string;
  onEventClick: (event: EventApi) => void;
};

type AgendaEvent = {
  id: string;
  title: string;
  timeLabel: string | null;
  accentColor: string;
  sortValue: number;
};

type AgendaDaySection = {
  key: string;
  heading: string;
  isToday: boolean;
  events: AgendaEvent[];
};

function resolveEventColor(event: EventInput): string {
  const color =
    (typeof event.backgroundColor === 'string' && event.backgroundColor) ||
    (typeof event.borderColor === 'string' && event.borderColor) ||
    '';

  return color || 'var(--color-primary)';
}

function toAgendaEvent(event: EventInput, dayStart: dayjs.Dayjs): AgendaEvent {
  const start = dayjs(event.start as string);
  // All-day events span whole days; an event is treated as all-day only when it
  // is flagged as such. Multi-day events keep their original start time on the
  // first day, but on later days they read as "종일" within that day.
  const isAllDay = event.allDay === true || start.isBefore(dayStart);

  return {
    id: String(event.id ?? ''),
    title: typeof event.title === 'string' ? event.title : '',
    timeLabel: isAllDay ? null : start.format('A h:mm'),
    accentColor: resolveEventColor(event),
    sortValue: isAllDay ? -1 : start.valueOf(),
  };
}

function eventOverlapsDay(
  event: EventInput,
  dayStart: dayjs.Dayjs,
  dayEnd: dayjs.Dayjs
): boolean {
  if (!event.start) {
    return false;
  }

  const start = dayjs(event.start as string);

  if (!start.isValid()) {
    return false;
  }

  // FullCalendar all-day end is exclusive; timed end falls back to start + 1h.
  const end = event.end ? dayjs(event.end as string) : start.add(1, 'hour');

  return start.isBefore(dayEnd) && end.isAfter(dayStart);
}

function buildDaySections(
  events: EventInput[],
  rangeStart: string,
  rangeEnd: string,
  todayKey: string
): AgendaDaySection[] {
  const start = dayjs(rangeStart).startOf('day');
  const end = dayjs(rangeEnd).startOf('day');
  const todayInRange =
    dayjs(todayKey).isBefore(end) && !dayjs(todayKey).isBefore(start);

  const sections: AgendaDaySection[] = [];

  for (
    let cursor = start;
    cursor.isBefore(end);
    cursor = cursor.add(1, 'day')
  ) {
    const dayStart = cursor;
    const dayEnd = cursor.add(1, 'day');
    const dayKey = cursor.format('YYYY-MM-DD');
    const isToday = dayKey === todayKey;

    const dayEvents = events
      .filter((event) => eventOverlapsDay(event, dayStart, dayEnd))
      .map((event) => toAgendaEvent(event, dayStart))
      .sort((a, b) => a.sortValue - b.sortValue);

    // Only render days that have events, except always render today so it can
    // serve as the scroll anchor.
    if (dayEvents.length === 0 && !isToday) {
      continue;
    }

    sections.push({
      key: dayKey,
      heading: `${cursor.format('M월 D일 (ddd)')} 일정`,
      isToday,
      events: dayEvents,
    });
  }

  // Defensive: nothing matched and today is outside the range.
  if (sections.length === 0 && !todayInRange) {
    return sections;
  }

  return sections;
}

export function CalendarAgendaSections({
  events,
  rangeStart,
  rangeEnd,
  onEventClick,
}: CalendarAgendaSectionsProps) {
  const todayKey = getTodayDateKey();

  const sections = useMemo(
    () => buildDaySections(events, rangeStart, rangeEnd, todayKey),
    [events, rangeStart, rangeEnd, todayKey]
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLElement>(null);

  // Anchor today's section to the top of the agenda scroll container on mount
  // and whenever the visible period changes. Scoped to the container so the
  // whole page is never scrolled.
  useEffect(() => {
    const container = scrollRef.current;
    const todaySection = todayRef.current;

    if (!container || !todaySection) {
      return;
    }

    container.scrollTop = todaySection.offsetTop - container.offsetTop;
  }, [rangeStart, rangeEnd, sections]);

  if (sections.length === 0) {
    return (
      <p className='slcn-calendar-agenda__empty'>
        이 기간에는 등록된 일정이 없어요.
      </p>
    );
  }

  return (
    <div className='slcn-calendar-agenda-scroll' ref={scrollRef}>
      {sections.map((section) => (
        <section
          key={section.key}
          className='slcn-calendar-agenda-day'
          ref={section.isToday ? todayRef : undefined}
        >
          <h3 className='slcn-calendar-agenda__heading'>{section.heading}</h3>

          {section.events.length === 0 ? (
            <p className='slcn-calendar-agenda__empty'>
              오늘 등록된 일정이 없어요.
            </p>
          ) : (
            <ul className='slcn-calendar-agenda__list'>
              {section.events.map((event) => (
                <li key={event.id}>
                  <button
                    type='button'
                    className='slcn-calendar-agenda__event'
                    style={
                      { '--slcn-agenda-accent': event.accentColor } as never
                    }
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
        </section>
      ))}
    </div>
  );
}

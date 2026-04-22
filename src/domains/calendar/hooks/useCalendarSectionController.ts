import type { EventApi, EventDropArg } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import type { DeviceType } from '../../../app/router/route-constants';
import type { CalendarViewMode, ScheduleEvent } from '../types';
import { useCalendarEventMutations } from './useCalendarEventMutations';
import { type CalendarEventDraft } from '../mappers/schedule-event-mappers';
import type { CalendarEventInput, CalendarMeta } from '../types';
import { useCalendarVisibility } from './internal/use-calendar-visibility';
import { useCalendarNavigation } from './internal/use-calendar-navigation';
import { useCalendarEditor } from './internal/use-calendar-editor';
import { useCalendarEventInteractions } from './internal/use-calendar-event-interactions';

export type CalendarSectionState = {
  label: string;
  calendars: CalendarMeta[];
  schedules: ScheduleEvent[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
};

type CalendarEditorState = {
  isOpen: boolean;
  draft: CalendarEventDraft;
  event: ScheduleEvent | null;
  error: string | null;
};

type CalendarSectionControllerProps = {
  device: DeviceType;
  view: CalendarViewMode;
  state: CalendarSectionState;
};

type CalendarSectionControllerResult = {
  currentDate: string;
  label: string;
  calendars: CalendarMeta[];
  visibleCalendarIds: string[];
  events: CalendarEventInput[];
  createDisabled: boolean;
  isLoading: boolean;
  isError: boolean;
  isSubmitting: boolean;
  editor: CalendarEditorState;
  onToggleCalendar: (calendarId: string) => void;
  onViewChange: (nextView: CalendarViewMode) => void;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
  onCreate: () => void;
  onRetry: () => void;
  onDraftChange: (patch: Partial<CalendarEventDraft>) => void;
  onCloseEditor: () => void;
  onSubmitEditor: () => Promise<void>;
  onDeleteEditor: () => Promise<void>;
  onSelectRange: (selection: {
    start: Date;
    end: Date;
    allDay: boolean;
  }) => void;
  onDateClick: (selection: { date: Date; allDay: boolean }) => void;
  onEventClick: (event: EventApi) => void;
  onEventDrop: (arg: EventDropArg) => Promise<void>;
  onEventResize: (arg: EventResizeDoneArg) => Promise<void>;
};

export function useCalendarSectionController({
  device,
  view,
  state,
}: CalendarSectionControllerProps): CalendarSectionControllerResult {
  const calendars = state.calendars.filter((calendar) => calendar.visible);
  const schedules = state.schedules;
  const { createSchedule, updateSchedule, deleteSchedule, isSubmitting } =
    useCalendarEventMutations();
  const navigation = useCalendarNavigation({ device, view });
  const visibility = useCalendarVisibility({ calendars, schedules });
  const editor = useCalendarEditor({
    calendarById: visibility.calendarById,
    defaultEditableCalendarId: visibility.defaultEditableCalendarId,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  });
  const interactions = useCalendarEventInteractions({
    schedules,
    calendarById: visibility.calendarById,
    openCreateEditor: editor.openCreateEditor,
    openScheduleEditor: editor.openScheduleEditor,
    updateSchedule,
  });

  return {
    currentDate: navigation.currentDate,
    label: state.label,
    calendars,
    visibleCalendarIds: visibility.visibleCalendarIds,
    events: visibility.events,
    createDisabled: visibility.createDisabled,
    isLoading: state.isLoading,
    isError: state.isError,
    isSubmitting,
    editor: editor.editor,
    onToggleCalendar: visibility.onToggleCalendar,
    onViewChange: navigation.onViewChange,
    onPrev: navigation.onPrev,
    onToday: navigation.onToday,
    onNext: navigation.onNext,
    onCreate: interactions.onCreate,
    onRetry: () => {
      void state.refetch();
    },
    onDraftChange: editor.onDraftChange,
    onCloseEditor: editor.onCloseEditor,
    onSubmitEditor: editor.onSubmitEditor,
    onDeleteEditor: editor.onDeleteEditor,
    onSelectRange: interactions.onSelectRange,
    onDateClick: interactions.onDateClick,
    onEventClick: interactions.onEventClick,
    onEventDrop: interactions.onEventDrop,
    onEventResize: interactions.onEventResize,
  };
}

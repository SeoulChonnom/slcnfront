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

type CalendarSectionControllerProps = {
  device: DeviceType;
  view: CalendarViewMode;
  state: CalendarSectionState;
};

export type CalendarStatusModel = {
  isLoading: boolean;
  isError: boolean;
  isSubmitting: boolean;
  onRetry: () => void;
};

export type CalendarNavigationModel = {
  currentDate: string;
  label: string;
  activeView: CalendarViewMode;
  onViewChange: (nextView: CalendarViewMode) => void;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
};

export type CalendarFiltersModel = {
  calendars: CalendarMeta[];
  visibleCalendarIds: string[];
  createDisabled: boolean;
  onToggleCalendar: (calendarId: string) => void;
  onCreate: () => void;
};

export type CalendarEventsModel = {
  items: CalendarEventInput[];
  selectable: boolean;
  onSelectRange: (selection: {
    start: Date;
    end: Date;
    allDay: boolean;
  }) => void;
  onDateClick?: (selection: { date: Date; allDay: boolean }) => void;
  onEventClick: (event: EventApi) => void;
  onEventDrop: (arg: EventDropArg) => Promise<void>;
  onEventResize: (arg: EventResizeDoneArg) => Promise<void>;
};

export type CalendarEditorModel = {
  isOpen: boolean;
  calendars: CalendarMeta[];
  draft: CalendarEventDraft;
  event: ScheduleEvent | null;
  errorMessage: string | null;
  isSubmitting: boolean;
  onDraftChange: (patch: Partial<CalendarEventDraft>) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  onDelete?: () => Promise<void>;
};

export type CalendarSectionControllerResult = {
  status: CalendarStatusModel;
  navigation: CalendarNavigationModel;
  filters: CalendarFiltersModel;
  calendarEvents: CalendarEventsModel;
  editor: CalendarEditorModel;
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
    status: {
      isLoading: state.isLoading,
      isError: state.isError,
      isSubmitting,
      onRetry: () => {
        void state.refetch();
      },
    },
    navigation: {
      currentDate: navigation.currentDate,
      label: state.label,
      activeView: view,
      onViewChange: navigation.onViewChange,
      onPrev: navigation.onPrev,
      onToday: navigation.onToday,
      onNext: navigation.onNext,
    },
    filters: {
      calendars,
      visibleCalendarIds: visibility.visibleCalendarIds,
      createDisabled: visibility.createDisabled,
      onToggleCalendar: visibility.onToggleCalendar,
      onCreate: interactions.onCreate,
    },
    calendarEvents: {
      items: visibility.events,
      selectable: !visibility.createDisabled,
      onSelectRange: interactions.onSelectRange,
      onDateClick: visibility.createDisabled
        ? undefined
        : interactions.onDateClick,
      onEventClick: interactions.onEventClick,
      onEventDrop: interactions.onEventDrop,
      onEventResize: interactions.onEventResize,
    },
    editor: {
      isOpen: editor.editor.isOpen,
      calendars,
      draft: editor.editor.draft,
      event: editor.editor.event,
      errorMessage: editor.editor.error,
      isSubmitting,
      onDraftChange: editor.onDraftChange,
      onClose: editor.onCloseEditor,
      onSubmit: editor.onSubmitEditor,
      onDelete: editor.editor.event ? editor.onDeleteEditor : undefined,
    },
  };
}

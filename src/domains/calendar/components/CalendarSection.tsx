import { useMemo, useState } from 'react';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { DeviceType } from '../../../app/router/route-constants';
import type {
  CalendarCreatePayload,
  CalendarMeta,
  CalendarViewMode,
} from '../types';
import { CalendarEventModal } from './CalendarEventModal';
import {
  CalendarManageModal,
  type CalendarManageDraft,
} from './CalendarManageModal';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarToolbar } from './CalendarToolbar';
import { CalendarWeekView } from './CalendarWeekView';
import { useCalendarMutations } from '../hooks/useCalendarMutations';
import {
  type CalendarSectionState,
  useCalendarSectionController,
} from '../hooks/useCalendarSectionController';

type CalendarManagerState = {
  isOpen: boolean;
  editingCalendarId: string | null;
  draft: CalendarManageDraft;
  error: string | null;
};

function createEmptyCalendarDraft(
  calendars: CalendarMeta[]
): CalendarManageDraft {
  return {
    name: '',
    backgroundColor: '#fe9fc8',
    borderColor: '#fe9fc8',
    textColor: '#111111',
    editable: true,
    startEditable: true,
    durationEditable: true,
    defaultSelected: calendars.length === 0,
    sortOrder:
      calendars.reduce(
        (max, calendar) => Math.max(max, calendar.sortOrder),
        0
      ) + 1,
  };
}

function createDraftFromCalendar(calendar: CalendarMeta): CalendarManageDraft {
  return {
    name: calendar.name,
    backgroundColor: calendar.backgroundColor,
    borderColor: calendar.borderColor,
    textColor: calendar.textColor,
    editable: calendar.editable,
    startEditable: calendar.startEditable,
    durationEditable: calendar.durationEditable,
    defaultSelected: calendar.defaultSelected,
    sortOrder: calendar.sortOrder,
  };
}

function validateCalendarDraft(draft: CalendarCreatePayload) {
  if (!draft.name.trim()) {
    return '캘린더 이름을 입력해주세요.';
  }

  if (draft.sortOrder < 0 || Number.isNaN(draft.sortOrder)) {
    return '정렬 순서는 0 이상의 숫자로 입력해주세요.';
  }

  return null;
}

type CalendarSectionProps = {
  device: DeviceType;
  view: CalendarViewMode;
  state: CalendarSectionState;
};

export function CalendarSection({ device, view, state }: CalendarSectionProps) {
  const controller = useCalendarSectionController({ device, view, state });
  const { createCalendar, updateCalendar, deleteCalendar, isSubmitting } =
    useCalendarMutations();
  const [calendarManager, setCalendarManager] = useState<CalendarManagerState>({
    isOpen: false,
    editingCalendarId: null,
    draft: createEmptyCalendarDraft(state.calendars),
    error: null,
  });
  const calendarById = useMemo(
    () => new Map(state.calendars.map((calendar) => [calendar.id, calendar])),
    [state.calendars]
  );
  const shouldRenderCalendarSurface =
    !controller.status.isLoading && !controller.status.isError;
  const supplementalEmptyState =
    controller.filters.calendars.length === 0
      ? {
          title: '캘린더가 아직 없어요.',
          description:
            '캘린더를 만들면 일정 화면에서 바로 추가하고 관리할 수 있어요.',
        }
      : controller.filters.visibleCalendarIds.length === 0
        ? {
            title: '표시 중인 캘린더가 없어요.',
            description: '상단 필터에서 하나 이상의 캘린더를 다시 켜주세요.',
          }
        : null;

  const openCreateCalendarManager = () => {
    setCalendarManager({
      isOpen: true,
      editingCalendarId: null,
      draft: createEmptyCalendarDraft(state.calendars),
      error: null,
    });
  };

  const openEditCalendarManager = (calendarId: string) => {
    const calendar = calendarById.get(calendarId);

    if (!calendar) {
      return;
    }

    setCalendarManager({
      isOpen: true,
      editingCalendarId: calendar.id,
      draft: createDraftFromCalendar(calendar),
      error: null,
    });
  };

  const closeCalendarManager = () => {
    setCalendarManager((current) => ({
      ...current,
      isOpen: false,
      error: null,
    }));
  };

  const onCalendarDraftChange = (patch: Partial<CalendarManageDraft>) => {
    setCalendarManager((current) => ({
      ...current,
      draft: {
        ...current.draft,
        ...patch,
      },
      error: null,
    }));
  };

  const onSubmitCalendarManager = async () => {
    const error = validateCalendarDraft(calendarManager.draft);

    if (error) {
      setCalendarManager((current) => ({ ...current, error }));
      return;
    }

    try {
      if (calendarManager.editingCalendarId) {
        await updateCalendar({
          id: calendarManager.editingCalendarId,
          ...calendarManager.draft,
        });
      } else {
        await createCalendar(calendarManager.draft);
      }

      closeCalendarManager();
      await state.refetch();
    } catch (error) {
      setCalendarManager((current) => ({
        ...current,
        error:
          error instanceof Error && error.message.trim()
            ? error.message
            : '캘린더를 저장하지 못했어요. 잠시 후 다시 시도해주세요.',
      }));
    }
  };

  const onDeleteCalendarManager = async () => {
    if (!calendarManager.editingCalendarId) {
      return;
    }

    try {
      await deleteCalendar(calendarManager.editingCalendarId);
      closeCalendarManager();
      await state.refetch();
    } catch (error) {
      setCalendarManager((current) => ({
        ...current,
        error:
          error instanceof Error && error.message.trim()
            ? error.message
            : '캘린더를 삭제하지 못했어요. 잠시 후 다시 시도해주세요.',
      }));
    }
  };

  return (
    <section className="slcn-calendar-page">
      <CalendarToolbar
        navigation={controller.navigation}
        filters={controller.filters}
        onManageCalendars={openCreateCalendarManager}
      />

      {controller.status.isLoading ? (
        <div className="slcn-calendar-loading">
          <Skeleton className="slcn-calendar-loading__panel" />
          <Skeleton className="slcn-calendar-loading__panel" />
        </div>
      ) : null}

      {!controller.status.isLoading && controller.status.isError ? (
        <ErrorState
          title="일정을 불러오지 못했어요."
          description="잠시 후 다시 시도하거나, 네트워크 상태를 확인해주세요."
          onRetry={() => {
            controller.status.onRetry();
          }}
        />
      ) : null}

      {shouldRenderCalendarSurface ? (
        <>
          {controller.navigation.activeView === 'month' ? (
            <CalendarMonthView
              currentDate={controller.navigation.currentDate}
              events={controller.calendarEvents.items}
              selectable={controller.calendarEvents.selectable}
              onSelect={controller.calendarEvents.onSelectRange}
              onDateClick={controller.calendarEvents.onDateClick}
              onEventClick={controller.calendarEvents.onEventClick}
              onEventDrop={controller.calendarEvents.onEventDrop}
              onEventResize={controller.calendarEvents.onEventResize}
            />
          ) : (
            <CalendarWeekView
              currentDate={controller.navigation.currentDate}
              events={controller.calendarEvents.items}
              selectable={controller.calendarEvents.selectable}
              onSelect={controller.calendarEvents.onSelectRange}
              onDateClick={controller.calendarEvents.onDateClick}
              onEventClick={controller.calendarEvents.onEventClick}
              onEventDrop={controller.calendarEvents.onEventDrop}
              onEventResize={controller.calendarEvents.onEventResize}
            />
          )}

          {supplementalEmptyState ? (
            <EmptyState
              title={supplementalEmptyState.title}
              description={supplementalEmptyState.description}
            />
          ) : null}
        </>
      ) : null}

      <CalendarEventModal editor={controller.editor} />

      <CalendarManageModal
        isOpen={calendarManager.isOpen}
        calendars={controller.filters.calendars}
        draft={calendarManager.draft}
        editingCalendarId={calendarManager.editingCalendarId}
        errorMessage={calendarManager.error}
        isSubmitting={isSubmitting}
        onClose={closeCalendarManager}
        onDraftChange={onCalendarDraftChange}
        onSubmit={onSubmitCalendarManager}
        onDelete={
          calendarManager.editingCalendarId
            ? onDeleteCalendarManager
            : undefined
        }
        onCreateNew={openCreateCalendarManager}
        onEditCalendar={openEditCalendarManager}
      />
    </section>
  );
}

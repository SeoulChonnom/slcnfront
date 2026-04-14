import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { TextField, TextareaField } from '../../../components/ui/TextField';
import {
  createDraftFromSchedule,
  mapDraftToSchedulePayload,
  validateCalendarEventDraft,
  type CalendarEventDraft,
} from '../mappers/schedule-event-mappers';
import type { CalendarMeta, ScheduleEvent, ScheduleMutationPayload } from '../types';

type CalendarEventModalProps = {
  isOpen: boolean;
  calendars: CalendarMeta[];
  defaultDraft: CalendarEventDraft;
  event: ScheduleEvent | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: ScheduleMutationPayload) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

export function CalendarEventModal({
  isOpen,
  calendars,
  defaultDraft,
  event,
  isSubmitting,
  onClose,
  onSubmit,
  onDelete,
}: CalendarEventModalProps) {
  const [draft, setDraft] = useState<CalendarEventDraft>(defaultDraft);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraft(event ? createDraftFromSchedule(event) : defaultDraft);
    setFormError(null);
  }, [defaultDraft, event, isOpen]);

  const title = event ? '일정 수정' : '일정 만들기';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="달력과 시간을 정하고 바로 저장할 수 있어요."
      className="slcn-calendar-modal"
    >
      <form
        className="slcn-calendar-modal__form"
        onSubmit={async (submitEvent) => {
          submitEvent.preventDefault();
          const error = validateCalendarEventDraft(draft);

          if (error) {
            setFormError(error);
            return;
          }

          await onSubmit(mapDraftToSchedulePayload(draft, event?.id));
          onClose();
        }}
      >
        <label className="slcn-calendar-modal__select-field">
          <span className="slcn-field__label">캘린더</span>
          <select
            value={draft.calendarId}
            className="slcn-calendar-modal__select"
            onChange={(changeEvent) => {
              setDraft((current) => ({
                ...current,
                calendarId: changeEvent.target.value,
              }));
            }}
          >
            {calendars.map((calendar) => (
              <option key={calendar.id} value={calendar.id}>
                {calendar.name}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label="제목"
          value={draft.title}
          onChange={(changeEvent) => {
            setDraft((current) => ({
              ...current,
              title: changeEvent.target.value,
            }));
          }}
          required
        />
        <TextareaField
          label="설명"
          value={draft.body}
          onChange={(changeEvent) => {
            setDraft((current) => ({
              ...current,
              body: changeEvent.target.value,
            }));
          }}
          rows={4}
        />
        <TextField
          label="장소"
          value={draft.location}
          onChange={(changeEvent) => {
            setDraft((current) => ({
              ...current,
              location: changeEvent.target.value,
            }));
          }}
        />
        <label className="slcn-calendar-modal__checkbox">
          <input
            type="checkbox"
            checked={draft.allDay}
            onChange={(changeEvent) => {
              setDraft((current) => ({
                ...current,
                allDay: changeEvent.target.checked,
              }));
            }}
          />
          <span>종일 일정</span>
        </label>
        <div className="slcn-calendar-modal__datetime-grid">
          <TextField
            label="시작일"
            type="date"
            value={draft.startDate}
            onChange={(changeEvent) => {
              setDraft((current) => ({
                ...current,
                startDate: changeEvent.target.value,
              }));
            }}
            required
          />
          {!draft.allDay ? (
            <TextField
              label="시작 시각"
              type="time"
              value={draft.startTime}
              onChange={(changeEvent) => {
                setDraft((current) => ({
                  ...current,
                  startTime: changeEvent.target.value,
                }));
              }}
              required
            />
          ) : null}
          <TextField
            label="종료일"
            type="date"
            value={draft.endDate}
            onChange={(changeEvent) => {
              setDraft((current) => ({
                ...current,
                endDate: changeEvent.target.value,
              }));
            }}
            required
          />
          {!draft.allDay ? (
            <TextField
              label="종료 시각"
              type="time"
              value={draft.endTime}
              onChange={(changeEvent) => {
                setDraft((current) => ({
                  ...current,
                  endTime: changeEvent.target.value,
                }));
              }}
              required
            />
          ) : null}
        </div>
        {formError ? (
          <p className="slcn-calendar-modal__error" role="alert">
            {formError}
          </p>
        ) : null}
        <div className="slcn-calendar-modal__actions">
          {event && onDelete ? (
            <Button
              variant="danger"
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                await onDelete(event.id);
                onClose();
              }}
            >
              삭제
            </Button>
          ) : null}
          <Button
            variant="secondary"
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
          >
            취소
          </Button>
          <Button type="submit" loading={isSubmitting}>
            저장
          </Button>
        </div>
      </form>
    </Modal>
  );
}

import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { TextField } from '../../../components/ui/TextField';
import type { CalendarCreatePayload, CalendarMeta } from '../types';

export type CalendarManageDraft = CalendarCreatePayload;

type CalendarManageModalProps = {
  isOpen: boolean;
  calendars: CalendarMeta[];
  draft: CalendarManageDraft;
  editingCalendarId: string | null;
  errorMessage: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onDraftChange: (patch: Partial<CalendarManageDraft>) => void;
  onSubmit: () => Promise<void>;
  onDelete?: () => Promise<void>;
  onCreateNew: () => void;
  onEditCalendar: (calendarId: string) => void;
};

function getCalendarBadgeTone(calendar: CalendarMeta) {
  return calendar.editable ? '수정 가능' : '읽기 전용';
}

export function CalendarManageModal({
  isOpen,
  calendars,
  draft,
  editingCalendarId,
  errorMessage,
  isSubmitting,
  onClose,
  onDraftChange,
  onSubmit,
  onDelete,
  onCreateNew,
  onEditCalendar,
}: CalendarManageModalProps) {
  const title = editingCalendarId ? '캘린더 수정' : '캘린더 만들기';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description='일정 화면에서 바로 사용할 캘린더 색상과 편집 권한을 정리할 수 있어요.'
      className='slcn-calendar-manage-modal'
    >
      <div className='slcn-calendar-manage-modal__stack'>
        <div className='slcn-calendar-manage-modal__library'>
          <div className='slcn-calendar-manage-modal__library-header'>
            <div>
              <p className='slcn-field__label'>캘린더 목록</p>
              <p className='slcn-calendar-manage-modal__library-copy'>
                기존 캘린더를 수정하거나 새로운 캘린더를 추가해보세요.
              </p>
            </div>
            <Button variant='secondary' size='sm' onClick={onCreateNew}>
              새 캘린더
            </Button>
          </div>
          <div className='slcn-calendar-manage-modal__library-grid'>
            {calendars.map((calendar) => {
              const active = calendar.id === editingCalendarId;

              return (
                <button
                  key={calendar.id}
                  type='button'
                  aria-label={`${calendar.name} ${getCalendarBadgeTone(calendar)}`}
                  className='slcn-calendar-manage-modal__calendar-card'
                  data-active={active}
                  onClick={() => onEditCalendar(calendar.id)}
                >
                  <span
                    className='slcn-calendar-manage-modal__calendar-swatch'
                    style={{ backgroundColor: calendar.backgroundColor }}
                    aria-hidden='true'
                  />
                  <span className='slcn-calendar-manage-modal__calendar-meta'>
                    <span className='slcn-calendar-manage-modal__calendar-name'>
                      {calendar.name}
                    </span>
                    <span className='slcn-calendar-manage-modal__calendar-badge'>
                      {getCalendarBadgeTone(calendar)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form
          className='slcn-calendar-manage-modal__form'
          onSubmit={async (submitEvent) => {
            submitEvent.preventDefault();
            await onSubmit();
          }}
        >
          <TextField
            label='캘린더 이름'
            value={draft.name}
            onChange={(event) => {
              onDraftChange({ name: event.target.value });
            }}
            required
          />
          <div className='slcn-calendar-manage-modal__color-grid'>
            <label className='slcn-field slcn-calendar-manage-modal__color-field'>
              <span className='slcn-field__label'>배경 색상</span>
              <div className='slcn-calendar-manage-modal__color-control'>
                <input
                  type='color'
                  value={draft.backgroundColor}
                  className='slcn-calendar-manage-modal__color-picker'
                  onChange={(event) => {
                    onDraftChange({ backgroundColor: event.target.value });
                  }}
                />
                <input
                  type='text'
                  value={draft.backgroundColor}
                  className='slcn-calendar-manage-modal__color-code'
                  onChange={(event) => {
                    onDraftChange({ backgroundColor: event.target.value });
                  }}
                />
              </div>
            </label>
            <label className='slcn-field slcn-calendar-manage-modal__color-field'>
              <span className='slcn-field__label'>테두리 색상</span>
              <div className='slcn-calendar-manage-modal__color-control'>
                <input
                  type='color'
                  value={draft.borderColor}
                  className='slcn-calendar-manage-modal__color-picker'
                  onChange={(event) => {
                    onDraftChange({ borderColor: event.target.value });
                  }}
                />
                <input
                  type='text'
                  value={draft.borderColor}
                  className='slcn-calendar-manage-modal__color-code'
                  onChange={(event) => {
                    onDraftChange({ borderColor: event.target.value });
                  }}
                />
              </div>
            </label>
            <label className='slcn-field slcn-calendar-manage-modal__color-field'>
              <span className='slcn-field__label'>텍스트 색상</span>
              <div className='slcn-calendar-manage-modal__color-control'>
                <input
                  type='color'
                  value={draft.textColor}
                  className='slcn-calendar-manage-modal__color-picker'
                  onChange={(event) => {
                    onDraftChange({ textColor: event.target.value });
                  }}
                />
                <input
                  type='text'
                  value={draft.textColor}
                  className='slcn-calendar-manage-modal__color-code'
                  onChange={(event) => {
                    onDraftChange({ textColor: event.target.value });
                  }}
                />
              </div>
            </label>
          </div>
          <TextField
            label='정렬 순서'
            type='number'
            min='0'
            value={String(draft.sortOrder)}
            onChange={(event) => {
              onDraftChange({ sortOrder: Number(event.target.value || 0) });
            }}
            required
          />
          <div className='slcn-calendar-manage-modal__toggle-grid'>
            <label className='slcn-calendar-manage-modal__toggle'>
              <input
                type='checkbox'
                checked={draft.editable}
                onChange={(event) => {
                  const editable = event.target.checked;
                  onDraftChange({
                    editable,
                    startEditable: editable ? draft.startEditable : false,
                    durationEditable: editable ? draft.durationEditable : false,
                  });
                }}
              />
              <span>전체 편집 허용</span>
            </label>
            <label className='slcn-calendar-manage-modal__toggle'>
              <input
                type='checkbox'
                checked={draft.startEditable}
                onChange={(event) => {
                  onDraftChange({ startEditable: event.target.checked });
                }}
                disabled={!draft.editable}
              />
              <span>시작 시간 이동 허용</span>
            </label>
            <label className='slcn-calendar-manage-modal__toggle'>
              <input
                type='checkbox'
                checked={draft.durationEditable}
                onChange={(event) => {
                  onDraftChange({ durationEditable: event.target.checked });
                }}
                disabled={!draft.editable}
              />
              <span>기간 변경 허용</span>
            </label>
            <label className='slcn-calendar-manage-modal__toggle'>
              <input
                type='checkbox'
                checked={draft.defaultSelected}
                onChange={(event) => {
                  onDraftChange({ defaultSelected: event.target.checked });
                }}
              />
              <span>기본 선택 캘린더</span>
            </label>
          </div>

          {errorMessage ? (
            <p className='slcn-calendar-modal__error' role='alert'>
              {errorMessage}
            </p>
          ) : null}

          <div className='slcn-calendar-modal__actions'>
            {editingCalendarId && onDelete ? (
              <Button
                variant='danger'
                type='button'
                disabled={isSubmitting}
                onClick={async () => {
                  await onDelete();
                }}
              >
                삭제
              </Button>
            ) : null}
            <Button
              variant='secondary'
              type='button'
              disabled={isSubmitting}
              onClick={onClose}
            >
              닫기
            </Button>
            <Button type='submit' loading={isSubmitting}>
              저장
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

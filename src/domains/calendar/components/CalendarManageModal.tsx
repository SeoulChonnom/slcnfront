import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { TextField } from '../../../components/ui/TextField';
import type { CalendarCreatePayload, CalendarMeta } from '../types';

export type CalendarManageDraft = CalendarCreatePayload;

type CalendarManageModalProps = {
  isOpen: boolean;
  view: 'list' | 'editor';
  calendars: CalendarMeta[];
  visibleCalendarIds: string[];
  draft: CalendarManageDraft;
  editingCalendarId: string | null;
  errorMessage: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onToggleVisibility: (calendarId: string) => void;
  onDraftChange: (patch: Partial<CalendarManageDraft>) => void;
  onSubmit: () => Promise<void>;
  onDelete?: () => Promise<void>;
  onCreateNew: () => void;
  onEditCalendar: (calendarId: string) => void;
  onBackToList: () => void;
};

export function CalendarManageModal({
  isOpen,
  view,
  calendars,
  visibleCalendarIds,
  draft,
  editingCalendarId,
  errorMessage,
  isSubmitting,
  onClose,
  onToggleVisibility,
  onDraftChange,
  onSubmit,
  onDelete,
  onCreateNew,
  onEditCalendar,
  onBackToList,
}: CalendarManageModalProps) {
  const title =
    view === 'list'
      ? '캘린더 관리'
      : editingCalendarId
        ? '캘린더 수정'
        : '캘린더 만들기';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      align='left'
      titleVariant='heading'
      className='slcn-calendar-manage-modal'
    >
      {view === 'list' ? (
        <div className='slcn-calendar-manage-modal__list'>
          {calendars.map((calendar) => {
            const visible = visibleCalendarIds.includes(calendar.id);

            return (
              <div
                key={calendar.id}
                className='slcn-calendar-manage-modal__row'
              >
                <button
                  type='button'
                  aria-label={`${calendar.name} 편집`}
                  className='slcn-calendar-manage-modal__row-main'
                  onClick={() => onEditCalendar(calendar.id)}
                >
                  <span
                    className='slcn-calendar-manage-modal__row-dot'
                    style={{ backgroundColor: calendar.backgroundColor }}
                    aria-hidden='true'
                  />
                  <span className='slcn-calendar-manage-modal__row-name'>
                    {calendar.name}
                  </span>
                </button>
                <button
                  type='button'
                  role='switch'
                  aria-checked={visible}
                  aria-label={`${calendar.name} 표시`}
                  className='slcn-toggle'
                  data-on={visible}
                  onClick={() => onToggleVisibility(calendar.id)}
                >
                  <span className='slcn-toggle__thumb' aria-hidden='true' />
                </button>
              </div>
            );
          })}

          <button
            type='button'
            className='slcn-calendar-manage-modal__add'
            onClick={onCreateNew}
          >
            <span aria-hidden='true'>+</span> 새 캘린더 추가
          </button>
        </div>
      ) : (
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
            placeholder='예) 아영'
            autoFocus
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
              onClick={onBackToList}
            >
              뒤로
            </Button>
            <Button type='submit' loading={isSubmitting}>
              저장
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

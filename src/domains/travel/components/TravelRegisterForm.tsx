import type { FormEvent, KeyboardEvent } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { TextField } from '@/components/ui/TextField';
import { TravelDayEditor } from '@/domains/travel/components/TravelDayEditor';
import {
  computeNightsDays,
  type DayFormRow,
  type UseTravelRegisterFormReturn,
} from '@/domains/travel/hooks/useTravelRegisterForm';
import { formatDisplayDate } from '@/domains/travel/mappers/travel-mappers';
import {
  validateTravelFileSize,
  validateTravelFileType,
} from '@/domains/travel/utils/travel-validation';

type TravelRegisterFormProps = {
  form: UseTravelRegisterFormReturn;
  mode: 'register' | 'edit';
  submitPhase: 'idle' | 'uploading' | 'saving';
  submitError: string | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

/** Names of the files a restored draft cannot carry back, in field order. */
function describeMissingDraftFiles(
  restoredDraft: UseTravelRegisterFormReturn['restoredDraft']
): string[] {
  if (!restoredDraft) return [];

  const missing: string[] = [];

  if (restoredDraft.fileNames.coverPhotoFile) {
    missing.push('대표 사진');
  }

  if (
    restoredDraft.fileNames.albumPhotoFiles &&
    restoredDraft.fileNames.albumPhotoFiles.length > 0
  ) {
    missing.push(
      `사진 앨범 (${restoredDraft.fileNames.albumPhotoFiles.length}장)`
    );
  }

  return missing;
}

/** "2일차(2025.06.02)에 적은 기록이 사라져요. 계속할까요?" — names what is lost. */
function describeDaysAtRisk(days: DayFormRow[]): string {
  const list = days
    .map((day) => `${day.dayNumber}일차(${formatDisplayDate(day.date)})`)
    .join(', ');

  return `${list}에 적은 기록이 사라져요. 계속할까요?`;
}

type PendingDateChange =
  | { kind: 'start'; date: string; daysAtRisk: DayFormRow[] }
  | { kind: 'end'; date: string; daysAtRisk: DayFormRow[] }
  | { kind: 'decrement'; daysAtRisk: DayFormRow[] };

export function TravelRegisterForm({
  form,
  mode,
  submitPhase,
  submitError,
  onSubmit,
  onCancel,
}: TravelRegisterFormProps) {
  const { values, errors } = form;
  const nightsDays = computeNightsDays(values.startDate, values.endDate);
  const startDateId = useId();
  const endDateId = useId();
  // Matches TextField's `${inputId}-error` convention so the same
  // aria-describedby wiring pattern applies to these hand-rolled date
  // fields too.
  const startDateErrorId = errors.startDate
    ? `${startDateId}-error`
    : undefined;
  const endDateErrorId = errors.endDate ? `${endDateId}-error` : undefined;
  const isPending = submitPhase !== 'idle';

  const titleRef = useRef<HTMLInputElement | null>(null);
  const regionRef = useRef<HTMLInputElement | null>(null);
  const startDateRef = useRef<HTMLInputElement | null>(null);
  const endDateRef = useRef<HTMLInputElement | null>(null);
  const coverPhotoRef = useRef<HTMLInputElement | null>(null);
  const daysErrorRef = useRef<HTMLParagraphElement | null>(null);
  const submitErrorRef = useRef<HTMLParagraphElement | null>(null);
  const submitAttemptedRef = useRef(false);

  const [pendingDateChange, setPendingDateChange] =
    useState<PendingDateChange | null>(null);

  // Oversized- or wrong-type-file feedback lives here, not in the hook's
  // formal errors: an invalid pick never enters form state (see
  // handleCoverFileSelect / handleAlbumFilesSelect below), so there is
  // nothing for validate() to reject later — the dropzone just shows why
  // the pick didn't take.
  const [coverFileError, setCoverFileError] = useState<string | null>(null);
  const [albumFileError, setAlbumFileError] = useState<string | null>(null);

  // A submit attempt (handleFormSubmit) sets this ref just before calling
  // form.validate() one level up. When that validate() call fails, `errors`
  // changes and this effect moves focus to the first invalid field. Typing
  // in a field also changes `errors` (clearing that field's message), but
  // the ref guard keeps this effect inert for those — it only ever acts once
  // per genuine submit attempt.
  useEffect(() => {
    if (!submitAttemptedRef.current) return;
    submitAttemptedRef.current = false;

    if (errors.title) {
      titleRef.current?.focus();
      return;
    }

    if (errors.region) {
      regionRef.current?.focus();
      return;
    }

    if (errors.startDate) {
      startDateRef.current?.focus();
      return;
    }

    if (errors.endDate) {
      endDateRef.current?.focus();
      return;
    }

    if (errors.coverPhotoFile) {
      coverPhotoRef.current?.focus();
      return;
    }

    if (errors.days) {
      daysErrorRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]);

  // Today the user clicks 저장하기 at the bottom of a very long form and a
  // submit failure renders thousands of px above with no indication anything
  // happened — move focus onto it so it is actually seen.
  useEffect(() => {
    if (submitError) {
      submitErrorRef.current?.focus();
    }
  }, [submitError]);

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    submitAttemptedRef.current = true;
    onSubmit(e);
  }

  // FileDropzone routes both the drop path and the native picker's change
  // event through this same onFileSelect callback (see FileDropzone.tsx),
  // so validating here catches a dropped .txt file exactly as it catches
  // one chosen through the dialog -- `accept` only constrains the picker
  // UI, not a drop.
  function handleCoverFileSelect(file: File | null) {
    if (file) {
      const typeError = validateTravelFileType(file);

      if (typeError) {
        setCoverFileError(typeError);
        return;
      }

      const sizeError = validateTravelFileSize(file);

      if (sizeError) {
        setCoverFileError(sizeError);
        return;
      }
    }

    setCoverFileError(null);
    form.updateField('coverPhotoFile', file);
  }

  function handleCoverFileClear() {
    setCoverFileError(null);
    form.updateField('coverPhotoFile', null);
  }

  function handleAlbumFilesSelect(files: File[]) {
    const fileErrors = files
      .map(
        (file) => validateTravelFileType(file) ?? validateTravelFileSize(file)
      )
      .filter((message): message is string => message !== null);
    const validFiles = files.filter(
      (file) =>
        validateTravelFileType(file) === null &&
        validateTravelFileSize(file) === null
    );

    setAlbumFileError(fileErrors[0] ?? null);
    form.updateField('albumPhotoFiles', validFiles);
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      form.addTag();
    }
  }

  function handleStartDateChange(date: string) {
    const daysAtRisk = form.previewStartDate(date);

    if (daysAtRisk.length > 0) {
      setPendingDateChange({ kind: 'start', date, daysAtRisk });
      return;
    }

    form.updateStartDate(date);
  }

  function handleEndDateChange(date: string) {
    const daysAtRisk = form.previewEndDate(date);

    if (daysAtRisk.length > 0) {
      setPendingDateChange({ kind: 'end', date, daysAtRisk });
      return;
    }

    form.updateEndDate(date);
  }

  function handleDecrementDuration() {
    const daysAtRisk = form.previewDecrementDuration();

    if (daysAtRisk.length > 0) {
      setPendingDateChange({ kind: 'decrement', daysAtRisk });
      return;
    }

    form.decrementDuration();
  }

  function handleConfirmPendingDateChange() {
    if (!pendingDateChange) return;

    if (pendingDateChange.kind === 'start') {
      form.updateStartDate(pendingDateChange.date);
    } else if (pendingDateChange.kind === 'end') {
      form.updateEndDate(pendingDateChange.date);
    } else {
      form.decrementDuration();
    }

    setPendingDateChange(null);
  }

  function handleCancelPendingDateChange() {
    setPendingDateChange(null);
  }

  const missingDraftFiles = describeMissingDraftFiles(form.restoredDraft);

  const submitLabel =
    submitPhase === 'uploading'
      ? '사진 올리는 중…'
      : submitPhase === 'saving'
        ? '저장 중…'
        : mode === 'edit'
          ? '수정하기'
          : '저장하기';

  return (
    <form
      className='slcn-travel-register-form'
      onSubmit={handleFormSubmit}
      noValidate
    >
      {mode === 'register' && form.restoredDraft ? (
        <div className='slcn-travel-register-form__draft-notice' role='status'>
          <p className='slcn-travel-register-form__draft-text'>
            작성하던 내용이 남아 있어요.
            {missingDraftFiles.length > 0
              ? ` ${missingDraftFiles.join(' · ')} 파일은 다시 선택해 주세요.`
              : ''}
          </p>
          <div className='slcn-travel-register-form__draft-actions'>
            <Button variant='ghost' size='sm' onClick={form.resumeDraft}>
              이어서 쓰기
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='slcn-travel-register-form__draft-discard'
              onClick={form.discardDraft}
            >
              새로 쓰기
            </Button>
          </div>
        </div>
      ) : null}

      {/* ── Basic info card ─────────────────────────────────────────────── */}
      <div className='slcn-travel-register-form__card'>
        <div className='slcn-travel-register-form__name-row'>
          <TextField
            label='제목'
            required
            placeholder='예) 봄여행'
            value={values.title}
            error={errors.title}
            ref={titleRef}
            onChange={(e) => form.updateField('title', e.target.value)}
          />

          <TextField
            label='지역'
            required
            placeholder='예) 경주'
            value={values.region}
            error={errors.region}
            ref={regionRef}
            onChange={(e) => form.updateField('region', e.target.value)}
          />
        </div>

        <div className='slcn-travel-register-form__date-row'>
          <div className='slcn-field slcn-travel-register-form__date-field'>
            <label htmlFor={startDateId} className='slcn-field__label'>
              <span>시작일</span>
              <span aria-hidden='true'> *</span>
            </label>
            <div
              className='slcn-field__control slcn-travel-register-form__date-control'
              data-error={Boolean(errors.startDate)}
            >
              <input
                id={startDateId}
                type='date'
                className='slcn-field__input'
                value={values.startDate}
                ref={startDateRef}
                onChange={(e) => handleStartDateChange(e.target.value)}
                aria-invalid={Boolean(errors.startDate)}
                aria-describedby={startDateErrorId}
              />
              <span
                className='slcn-travel-register-form__date-icon'
                aria-hidden='true'
              >
                <svg
                  aria-hidden='true'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
                  <line x1='16' y1='2' x2='16' y2='6' />
                  <line x1='8' y1='2' x2='8' y2='6' />
                  <line x1='3' y1='10' x2='21' y2='10' />
                </svg>
              </span>
            </div>
            {errors.startDate ? (
              <p
                id={startDateErrorId}
                className='slcn-field__message'
                data-kind='error'
              >
                {errors.startDate}
              </p>
            ) : null}
          </div>

          <div className='slcn-field slcn-travel-register-form__date-field'>
            <label htmlFor={endDateId} className='slcn-field__label'>
              <span>종료일</span>
              <span aria-hidden='true'> *</span>
            </label>
            <div
              className='slcn-field__control slcn-travel-register-form__date-control'
              data-error={Boolean(errors.endDate)}
            >
              <input
                id={endDateId}
                type='date'
                className='slcn-field__input'
                value={values.endDate}
                ref={endDateRef}
                onChange={(e) => handleEndDateChange(e.target.value)}
                aria-invalid={Boolean(errors.endDate)}
                aria-describedby={endDateErrorId}
              />
              <span
                className='slcn-travel-register-form__date-icon'
                aria-hidden='true'
              >
                <svg
                  aria-hidden='true'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
                  <line x1='16' y1='2' x2='16' y2='6' />
                  <line x1='8' y1='2' x2='8' y2='6' />
                  <line x1='3' y1='10' x2='21' y2='10' />
                </svg>
              </span>
            </div>
            {errors.endDate ? (
              <p
                id={endDateErrorId}
                className='slcn-field__message'
                data-kind='error'
              >
                {errors.endDate}
              </p>
            ) : null}
          </div>
        </div>

        {/* 여행 기간 stepper */}
        <div className='slcn-travel-register-form__duration-row'>
          <div className='slcn-travel-register-form__duration-meta'>
            <span className='slcn-travel-register-form__duration-label'>
              여행 기간
            </span>
            <span className='slcn-travel-register-form__duration-helper'>
              늘리면 하루가 늘고, 줄이면 마지막 날이 빠져요.
            </span>
          </div>
          <div className='slcn-travel-register-form__duration-stepper'>
            <button
              type='button'
              className='slcn-travel-register-form__duration-btn'
              aria-label='여행 기간 줄이기'
              onClick={handleDecrementDuration}
              disabled={!nightsDays || nightsDays.nights === 0}
            >
              −
            </button>
            <span className='slcn-travel-register-form__duration-value'>
              {nightsDays
                ? nightsDays.nights === 0
                  ? '당일치기'
                  : `${nightsDays.nights}박 ${nightsDays.days}일`
                : '—'}
            </span>
            <button
              type='button'
              className='slcn-travel-register-form__duration-btn'
              aria-label='여행 기간 늘리기'
              onClick={form.incrementDuration}
              disabled={!values.startDate}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* ── Cover photo ─────────────────────────────────────────────────── */}
      <div className='slcn-travel-register-form__section'>
        <h2 className='slcn-travel-register-form__section-title'>
          대표 사진
          <span
            className='slcn-travel-register-form__required-mark'
            aria-hidden='true'
          >
            {' '}
            *
          </span>
        </h2>
        <p className='slcn-travel-register-form__section-sub'>
          여행 목록과 상세 상단에 보이는 대표 이미지예요. 반드시 등록해야 저장할
          수 있어요.
        </p>
        <FileDropzone
          label='대표 사진'
          hideLabel
          required
          accept='.jpg,.jpeg,.png'
          prompt='대표 사진을 끌어다 놓거나 선택하세요'
          file={values.coverPhotoFile}
          error={coverFileError ?? errors.coverPhotoFile}
          ref={coverPhotoRef}
          onFileSelect={handleCoverFileSelect}
          onClear={handleCoverFileClear}
        />
      </div>

      {/* ── 날짜별 기록 ─────────────────────────────────────────────────── */}
      <div className='slcn-travel-register-form__section'>
        <div className='slcn-travel-register-form__section-header-row'>
          <h2 className='slcn-travel-register-form__section-title'>
            날짜별 기록
          </h2>
          <span className='slcn-travel-register-form__section-count'>
            {values.days.length > 0 ? `총 ${values.days.length}일` : null}
          </span>
        </div>
        <p className='slcn-travel-register-form__section-sub'>
          날짜별로 방문한 장소와 기억을 기록해 주세요.
        </p>

        {errors.days ? (
          <p
            ref={daysErrorRef}
            tabIndex={-1}
            className='slcn-travel-register-form__submit-error'
            role='alert'
          >
            {errors.days}
          </p>
        ) : null}

        {values.days.length === 0 ? (
          <p className='slcn-travel-register-form__days-hint'>
            시작일과 종료일을 입력하면 날짜별 기록 카드가 자동으로 생성돼요.
          </p>
        ) : (
          <div className='slcn-travel-register-form__days'>
            {values.days.map((day) => (
              <TravelDayEditor
                key={day.localId}
                day={day}
                onAddPlace={form.addPlace}
                onRemovePlace={form.removePlace}
                onUpdatePlace={form.updatePlace}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 사진 앨범 ────────────────────────────────────────────────────── */}
      <div className='slcn-travel-register-form__section'>
        <div className='slcn-travel-register-form__section-header-row'>
          <h2 className='slcn-travel-register-form__section-title'>
            사진 앨범
          </h2>
          <span className='slcn-travel-register-form__section-count'>
            {values.albumPhotoFiles.length > 0
              ? `${values.albumPhotoFiles.length}장`
              : null}
          </span>
        </div>
        <p className='slcn-travel-register-form__section-sub'>
          여행에서 찍은 전체 사진을 올려 주세요.
        </p>
        <FileDropzone
          label='사진 앨범'
          hideLabel
          multiple
          accept='.jpg,.jpeg,.png'
          hint='PNG · JPG · 여러 장 선택 가능'
          prompt='사진을 끌어다 놓거나 선택하세요'
          error={albumFileError ?? undefined}
          files={values.albumPhotoFiles}
          onFilesSelect={handleAlbumFilesSelect}
        />
      </div>

      {/* ── 태그 ────────────────────────────────────────────────────────── */}
      <div className='slcn-travel-register-form__section'>
        <h2 className='slcn-travel-register-form__section-title'>태그</h2>
        <p className='slcn-travel-register-form__section-sub'>
          여행을 나타내는 키워드를 추가해 보세요. (예: 봄여행, 부부여행)
        </p>
        <div className='slcn-travel-register-form__tag-input-row'>
          <div className='slcn-field' style={{ flex: 1 }}>
            <div className='slcn-field__control'>
              <input
                type='text'
                className='slcn-field__input'
                placeholder='예) 봄여행'
                aria-label='태그 추가'
                value={form.tagInput}
                onChange={(e) => form.setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
          </div>
          <Button
            type='button'
            variant='secondary'
            size='sm'
            onClick={form.addTag}
          >
            추가
          </Button>
        </div>
        {values.tags.length > 0 ? (
          <div className='slcn-travel-register-form__tags'>
            {values.tags.map((tag) => (
              <span key={tag} className='slcn-travel-register-form__tag-chip'>
                #{tag}
                <button
                  type='button'
                  className='slcn-travel-register-form__tag-remove'
                  aria-label={`${tag} 태그 삭제`}
                  onClick={() => form.removeTag(tag)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {submitError ? (
        <p
          ref={submitErrorRef}
          tabIndex={-1}
          className='slcn-travel-register-form__submit-error'
          role='alert'
        >
          {submitError}
        </p>
      ) : null}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className='slcn-travel-register-form__footer'>
        <Button
          type='button'
          variant='secondary'
          onClick={onCancel}
          disabled={isPending}
        >
          취소
        </Button>
        <Button type='submit' variant='primary' fullWidth loading={isPending}>
          {submitLabel}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={pendingDateChange !== null}
        title='날짜를 바꿀까요?'
        description={
          pendingDateChange
            ? describeDaysAtRisk(pendingDateChange.daysAtRisk)
            : ''
        }
        confirmLabel='그래도 바꾸기'
        onConfirm={handleConfirmPendingDateChange}
        onCancel={handleCancelPendingDateChange}
      />
    </form>
  );
}

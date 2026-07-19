import type { ChangeEvent, FormEvent } from 'react';
import { useId } from 'react';
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import {
  computeNightsDays,
  type UseTravelRegisterFormReturn,
} from '../hooks/useTravelRegisterForm';
import { TravelDayEditor } from './TravelDayEditor';

type TravelRegisterFormProps = {
  form: UseTravelRegisterFormReturn;
  mode: 'register' | 'edit';
  isPending: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function TravelRegisterForm({
  form,
  mode,
  isPending,
  onSubmit,
  onCancel,
}: TravelRegisterFormProps) {
  const { values, errors } = form;
  const nightsDays = computeNightsDays(values.startDate, values.endDate);
  const startDateId = useId();
  const endDateId = useId();

  function handleCoverPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    form.updateField('coverPhotoFile', file);
  }

  function handleAlbumPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    form.updateField('albumPhotoFiles', files);
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      form.addTag();
    }
  }

  return (
    <form className='slcn-travel-register-form' onSubmit={onSubmit} noValidate>
      {/* ── Basic info card ─────────────────────────────────────────────── */}
      <div className='slcn-travel-register-form__card'>
        <TextField
          label='제목'
          required
          placeholder='예) 봄여행'
          value={values.title}
          error={errors.title}
          onChange={(e) => form.updateField('title', e.target.value)}
        />

        <TextField
          label='지역'
          required
          placeholder='예) 경주'
          value={values.region}
          onChange={(e) => form.updateField('region', e.target.value)}
        />

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
                onChange={(e) => form.updateStartDate(e.target.value)}
                aria-invalid={Boolean(errors.startDate)}
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
              <p className='slcn-field__message' data-kind='error'>
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
                onChange={(e) => form.updateEndDate(e.target.value)}
                aria-invalid={Boolean(errors.endDate)}
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
              <p className='slcn-field__message' data-kind='error'>
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
              늘리면 날짜 칸이 자동 생성, 줄이면 마지막 날 기록이 삭제돼요.
            </span>
          </div>
          <div className='slcn-travel-register-form__duration-stepper'>
            <button
              type='button'
              className='slcn-travel-register-form__duration-btn'
              aria-label='여행 기간 줄이기'
              onClick={form.decrementDuration}
              disabled={!nightsDays || nightsDays.nights === 0}
            >
              −
            </button>
            <span className='slcn-travel-register-form__duration-value'>
              {nightsDays
                ? nightsDays.nights === 0
                  ? '당일치기'
                  : `${nightsDays.nights}박 ${nightsDays.days}일`
                : '1박 2일'}
            </span>
            <button
              type='button'
              className='slcn-travel-register-form__duration-btn'
              aria-label='여행 기간 늘리기'
              onClick={form.incrementDuration}
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
        <label className='slcn-travel-register-form__dropzone'>
          <div className='slcn-travel-register-form__dropzone-inner'>
            <span
              className='slcn-travel-register-form__dropzone-icon'
              aria-hidden='true'
            >
              <svg
                aria-hidden='true'
                width='32'
                height='32'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M12 19V6' />
                <path d='M5 12l7-7 7 7' />
              </svg>
            </span>
            <span className='slcn-travel-register-form__dropzone-text'>
              {values.coverPhotoFile
                ? values.coverPhotoFile.name
                : '대표 사진을 끌어다 놓거나 선택하세요'}
            </span>
            <span className='slcn-travel-register-form__dropzone-hint'>
              PNG · JPG · 최대 10MB
            </span>
          </div>
          <input
            type='file'
            accept='.jpg,.jpeg,.png'
            className='slcn-travel-register-form__dropzone-input'
            onChange={handleCoverPhotoChange}
          />
        </label>
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
                onDayCoverPhoto={form.updateDayCoverPhoto}
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
        <label className='slcn-travel-register-form__dropzone'>
          <div className='slcn-travel-register-form__dropzone-inner'>
            <span
              className='slcn-travel-register-form__dropzone-icon'
              aria-hidden='true'
            >
              <svg
                aria-hidden='true'
                width='32'
                height='32'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M12 19V6' />
                <path d='M5 12l7-7 7 7' />
              </svg>
            </span>
            <span className='slcn-travel-register-form__dropzone-text'>
              {values.albumPhotoFiles.length > 0
                ? `${values.albumPhotoFiles.length}장 선택됨`
                : '사진을 끌어다 놓거나 선택하세요'}
            </span>
            <span className='slcn-travel-register-form__dropzone-hint'>
              PNG · JPG · 여러 장 선택 가능
            </span>
          </div>
          <input
            type='file'
            accept='.jpg,.jpeg,.png'
            multiple
            className='slcn-travel-register-form__dropzone-input'
            onChange={handleAlbumPhotoChange}
          />
        </label>
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
          {mode === 'edit' ? '수정하기' : '저장하기'}
        </Button>
      </div>
    </form>
  );
}

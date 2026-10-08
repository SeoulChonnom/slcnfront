import { useState } from 'react';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { TextField } from '@/components/ui/TextField';
import { ReviewDraftAction } from '@/domains/inspection/components/ReviewDraftAction';
import type { PhotoUploadProgress } from '@/domains/inspection/components/register/PhotoManager';
import { PhotoManager } from '@/domains/inspection/components/register/PhotoManager';
import { useInspectionTags } from '@/domains/inspection/hooks/inspection-queries';
import { useDraftedFields } from '@/domains/inspection/hooks/useDraftedFields';
import type {
  LocalPhotoItem,
  VisitBasicFormValues,
} from '@/domains/inspection/hooks/useInspectionRegisterWizard';
import type {
  ReviewSuggestion,
  RevisitIntent,
} from '@/domains/inspection/types';
import {
  getSuggestedFields,
  hasExistingReviewContent,
  REVIEW_DRAFT_MEMO_MAX_LENGTH,
} from '@/domains/inspection/utils/review-draft';

// 입력 폼 전용 짧은 문구 — 모바일에서도 세 개가 한 줄에 들어가야 한다.
// 목록·상세 표시는 REVISIT_INTENT_META의 긴 문구를 그대로 쓴다.
const REVISIT_INTENT_OPTIONS: { label: string; value: RevisitIntent }[] = [
  { value: 'YES', label: '살고싶어' },
  { value: 'MAYBE', label: '고민' },
  { value: 'NO', label: '안살아' },
];

type RegisterStepBasicInfoProps = {
  values: VisitBasicFormValues;
  onFieldChange: <Key extends keyof VisitBasicFormValues>(
    key: Key,
    value: VisitBasicFormValues[Key]
  ) => void;
  photos: LocalPhotoItem[];
  onAddPhotoFiles: (files: File[]) => void;
  onCaptionChange: (key: string, caption: string) => void;
  onRemovePhoto: (key: string) => void;
  onReorderPhotos: (next: LocalPhotoItem[]) => void;
  photoUploadProgress: PhotoUploadProgress | null;
  photoUploadError?: string | null;
  savedAtLabel: string;
  errors: Record<string, string>;
  /** Omit to hide the AI draft action. */
  reviewDraft?: { requestDraft: () => Promise<ReviewSuggestion> };
};

export function RegisterStepBasicInfo({
  values,
  onFieldChange,
  photos,
  onAddPhotoFiles,
  onCaptionChange,
  onRemovePhoto,
  onReorderPhotos,
  photoUploadProgress,
  photoUploadError = null,
  savedAtLabel,
  errors,
  reviewDraft,
}: RegisterStepBasicInfoProps) {
  const [tagInput, setTagInput] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const { drafted, markDrafted } = useDraftedFields();
  const suggestedTagsQuery = useInspectionTags('', 'VISIT');
  const suggestedTags = (suggestedTagsQuery.data ?? [])
    .filter((tag) => !values.tags.includes(tag.name))
    .slice(0, 8);

  function addTag(nameRaw: string) {
    const name = nameRaw.trim();

    if (!name || values.tags.includes(name)) {
      return;
    }

    onFieldChange('tags', [...values.tags, name]);
  }

  function removeTag(name: string) {
    onFieldChange(
      'tags',
      values.tags.filter((tag) => tag !== name)
    );
  }

  function applyDraft(suggestion: ReviewSuggestion) {
    const fields = getSuggestedFields(suggestion);

    for (const field of fields) {
      if (field === 'tags') {
        onFieldChange('tags', suggestion.tags);
      } else {
        onFieldChange(field, suggestion[field]);
      }
    }

    markDrafted(fields);
  }

  return (
    <div className='slcn-inspection-register-step'>
      <h2 className='slcn-inspection-register-step__title'>임장 기본 정보</h2>
      <p className='slcn-inspection-register-step__lead'>
        임장 일시와 재방문 의사만 있으면 됩니다. 나머지는 나중에 채워도 돼요.
      </p>

      <p
        className='slcn-inspection-register-autosave'
        role='status'
        data-saved={Boolean(savedAtLabel)}
      >
        {savedAtLabel || '아직 저장되지 않았습니다'}
      </p>

      <div className='slcn-inspection-register-datetime'>
        <TextField
          type='date'
          label='임장 일시'
          required
          value={values.visitedAtDate}
          onChange={(event) =>
            onFieldChange('visitedAtDate', event.target.value)
          }
          error={errors.visitedAt}
        />
        <TextField
          type='time'
          label='시각'
          required
          value={values.visitedAtTime}
          onChange={(event) =>
            onFieldChange('visitedAtTime', event.target.value)
          }
        />
      </div>

      <RadioGroup
        name='revisit-intent'
        label='재방문 의사'
        required
        value={values.revisitIntent ?? undefined}
        onChange={(next) =>
          onFieldChange('revisitIntent', next as RevisitIntent)
        }
        options={REVISIT_INTENT_OPTIONS}
        error={errors.revisitIntent}
        className='slcn-inspection-register-revisit-group'
      />

      <label className='slcn-field'>
        <span className='slcn-field__label'>전체 메모</span>
        <textarea
          className='slcn-field__textarea slcn-inspection-register-textarea'
          value={values.memo}
          maxLength={REVIEW_DRAFT_MEMO_MAX_LENGTH}
          readOnly={isDrafting}
          onChange={(event) => onFieldChange('memo', event.target.value)}
        />
      </label>

      {reviewDraft ? (
        <ReviewDraftAction
          memo={values.memo}
          hasExistingReview={hasExistingReviewContent(values)}
          requestDraft={reviewDraft.requestDraft}
          onApply={applyDraft}
          onBusyChange={setIsDrafting}
        />
      ) : null}

      <TextField
        label='한줄평'
        hint='선택 입력'
        maxLength={300}
        value={values.oneLineReview}
        readOnly={isDrafting}
        data-drafted={drafted.has('oneLineReview') || undefined}
        onChange={(event) => onFieldChange('oneLineReview', event.target.value)}
      />

      <div className='slcn-inspection-register-pros-cons'>
        <label className='slcn-field'>
          <span className='slcn-field__label'>장점</span>
          <textarea
            className='slcn-field__textarea slcn-inspection-register-textarea'
            value={values.pros}
            readOnly={isDrafting}
            data-drafted={drafted.has('pros') || undefined}
            onChange={(event) => onFieldChange('pros', event.target.value)}
          />
        </label>
        <label className='slcn-field'>
          <span className='slcn-field__label'>단점</span>
          <textarea
            className='slcn-field__textarea slcn-inspection-register-textarea'
            value={values.cons}
            readOnly={isDrafting}
            data-drafted={drafted.has('cons') || undefined}
            onChange={(event) => onFieldChange('cons', event.target.value)}
          />
        </label>
      </div>

      <div
        className='slcn-inspection-register-tags'
        data-drafted={drafted.has('tags') || undefined}
      >
        <span className='slcn-field__label'>태그</span>
        <div className='slcn-inspection-register-tags__input-row'>
          <TextField
            value={tagInput}
            readOnly={isDrafting}
            placeholder='태그를 입력하고 Enter'
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addTag(tagInput);
                setTagInput('');
              }
            }}
          />
        </div>
        {values.tags.length > 0 ? (
          <ul className='slcn-inspection-register-tags__list'>
            {values.tags.map((tag) => (
              <li key={tag}>
                <button
                  type='button'
                  className='slcn-inspection-tag-chip'
                  onClick={() => removeTag(tag)}
                  disabled={isDrafting}
                  aria-label={`태그 ${tag} 지우기`}
                >
                  {tag} ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {suggestedTags.length > 0 ? (
          <div className='slcn-inspection-register-tags__suggestions'>
            <span>자주 쓴 태그</span>
            {suggestedTags.map((tag) => (
              <button
                key={tag.tagId}
                type='button'
                className='slcn-inspection-tag-chip slcn-inspection-tag-chip--more'
                onClick={() => addTag(tag.name)}
              >
                + {tag.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <PhotoManager
        label='임장 사진'
        photos={photos}
        onAddFiles={onAddPhotoFiles}
        onCaptionChange={onCaptionChange}
        onRemove={onRemovePhoto}
        onReorder={onReorderPhotos}
        uploadProgress={photoUploadProgress}
        uploadError={photoUploadError}
      />
    </div>
  );
}

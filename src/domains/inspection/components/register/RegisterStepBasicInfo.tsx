import { useState } from 'react';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { TextField } from '@/components/ui/TextField';
import type { PhotoUploadProgress } from '@/domains/inspection/components/register/PhotoManager';
import { PhotoManager } from '@/domains/inspection/components/register/PhotoManager';
import { useInspectionTags } from '@/domains/inspection/hooks/inspection-queries';
import type {
  LocalPhotoItem,
  VisitBasicFormValues,
} from '@/domains/inspection/hooks/useInspectionRegisterWizard';
import type { RevisitIntent } from '@/domains/inspection/types';
import { REVISIT_INTENT_META } from '@/domains/inspection/utils/inspection-format';

const REVISIT_INTENT_OPTIONS: { label: string; value: RevisitIntent }[] = (
  ['YES', 'MAYBE', 'NO'] as const
).map((intent) => ({
  value: intent,
  label: `${REVISIT_INTENT_META[intent].icon} ${REVISIT_INTENT_META[intent].label}`,
}));

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
  savedAtLabel: string;
  errors: Record<string, string>;
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
  savedAtLabel,
  errors,
}: RegisterStepBasicInfoProps) {
  const [tagInput, setTagInput] = useState('');
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

      <TextField
        label='한줄평'
        hint='선택 입력'
        maxLength={300}
        value={values.oneLineReview}
        onChange={(event) => onFieldChange('oneLineReview', event.target.value)}
      />

      <label className='slcn-field'>
        <span className='slcn-field__label'>전체 메모</span>
        <textarea
          className='slcn-field__textarea slcn-inspection-register-textarea'
          value={values.memo}
          onChange={(event) => onFieldChange('memo', event.target.value)}
        />
      </label>

      <div className='slcn-inspection-register-pros-cons'>
        <label className='slcn-field'>
          <span className='slcn-field__label'>장점</span>
          <textarea
            className='slcn-field__textarea slcn-inspection-register-textarea'
            value={values.pros}
            onChange={(event) => onFieldChange('pros', event.target.value)}
          />
        </label>
        <label className='slcn-field'>
          <span className='slcn-field__label'>단점</span>
          <textarea
            className='slcn-field__textarea slcn-inspection-register-textarea'
            value={values.cons}
            onChange={(event) => onFieldChange('cons', event.target.value)}
          />
        </label>
      </div>

      <div className='slcn-inspection-register-tags'>
        <span className='slcn-field__label'>태그</span>
        <div className='slcn-inspection-register-tags__input-row'>
          <TextField
            value={tagInput}
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
      />
    </div>
  );
}

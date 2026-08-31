import { useEffect, useRef } from 'react';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { TextField } from '@/components/ui/TextField';
import { isTripType } from '@/domains/trip/types';
import type { TripRegisterWizardValues } from '@/domains/trip/utils/trip-form-data';
import type { TripValidationErrors } from '@/domains/trip/utils/trip-validation';

type TripRegisterBasicFieldKey = 'type' | 'date' | 'info2' | 'logo';

type TripRegisterBasicValues = Pick<
  TripRegisterWizardValues,
  TripRegisterBasicFieldKey
>;

type TripRegisterBasicErrors = Pick<
  TripValidationErrors,
  TripRegisterBasicFieldKey
>;

type TripRegisterStepBasicProps = {
  values: TripRegisterBasicValues;
  errors: TripRegisterBasicErrors;
  errorToken: number;
  onFieldChange: <Key extends TripRegisterBasicFieldKey>(
    key: Key,
    value: TripRegisterWizardValues[Key]
  ) => void;
};

export function TripRegisterStepBasic({
  values,
  errors,
  errorToken,
  onFieldChange,
}: TripRegisterStepBasicProps) {
  const typeRef = useRef<HTMLInputElement | null>(null);
  const dateRef = useRef<HTMLInputElement | null>(null);
  const info2Ref = useRef<HTMLInputElement | null>(null);
  const logoRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (errors.type) {
      typeRef.current?.focus();
      return;
    }

    if (errors.date) {
      dateRef.current?.focus();
      return;
    }

    if (errors.info2) {
      info2Ref.current?.focus();
      return;
    }

    if (errors.logo) {
      logoRef.current?.focus();
    }
  }, [errorToken]);

  return (
    <div className='slcn-trip-register-step'>
      <RadioGroup
        name='trip-type'
        label='유형'
        className='slcn-radio-group--inline'
        value={values.type}
        required
        error={errors.type}
        firstInputRef={typeRef}
        options={[
          { label: '아영', value: 'AYO' },
          { label: '일권', value: 'RYU' },
        ]}
        onChange={(value) => {
          if (isTripType(value)) {
            onFieldChange('type', value);
          }
        }}
      />
      <TextField
        type='date'
        label='날짜'
        required
        value={values.date}
        error={errors.date}
        ref={dateRef}
        onChange={(event) => onFieldChange('date', event.target.value)}
      />
      <TextField
        label='나들이 이름'
        placeholder='예) 부암동 나들이'
        required
        value={values.info2}
        error={errors.info2}
        ref={info2Ref}
        onChange={(event) => onFieldChange('info2', event.target.value)}
      />
      <FileDropzone
        label='로고 이미지'
        prompt='로고 파일을 끌어다 놓거나 선택하세요'
        hint='PNG · JPG · 최대 10MB'
        accept='.jpg,.jpeg,.png,.gif,.svg'
        required
        error={errors.logo}
        file={values.logo}
        ref={logoRef}
        onFileSelect={(file) => onFieldChange('logo', file)}
        onClear={() => onFieldChange('logo', null)}
      />
    </div>
  );
}

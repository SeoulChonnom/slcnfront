import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { TextField } from '@/components/ui/TextField';
import type { TripRegisterWizardValues } from '@/domains/trip/utils/trip-form-data';
import type { TripValidationErrors } from '@/domains/trip/utils/trip-validation';

type TripRegisterMapsFieldKey =
  | 'map1'
  | 'hasSecondMap'
  | 'map2'
  | 'button1'
  | 'button2'
  | 'drive';

type TripRegisterMapsErrorKey =
  | 'map1'
  | 'map2'
  | 'button1'
  | 'button2'
  | 'drive';

type TripRegisterMapsValues = Pick<
  TripRegisterWizardValues,
  TripRegisterMapsFieldKey
>;

type TripRegisterMapsErrors = Pick<
  TripValidationErrors,
  TripRegisterMapsErrorKey
>;

type TripRegisterStepMapsProps = {
  values: TripRegisterMapsValues;
  errors: TripRegisterMapsErrors;
  errorToken: number;
  onFieldChange: <Key extends TripRegisterMapsFieldKey>(
    key: Key,
    value: TripRegisterWizardValues[Key]
  ) => void;
};

export function TripRegisterStepMaps({
  values,
  errors,
  errorToken,
  onFieldChange,
}: TripRegisterStepMapsProps) {
  const map1Ref = useRef<HTMLInputElement | null>(null);
  const map2Ref = useRef<HTMLInputElement | null>(null);
  const button1Ref = useRef<HTMLInputElement | null>(null);
  const button2Ref = useRef<HTMLInputElement | null>(null);
  const driveRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (errors.map1) {
      map1Ref.current?.focus();
      return;
    }

    if (values.hasSecondMap && errors.map2) {
      map2Ref.current?.focus();
      return;
    }

    if (values.hasSecondMap && errors.button1) {
      button1Ref.current?.focus();
      return;
    }

    if (values.hasSecondMap && errors.button2) {
      button2Ref.current?.focus();
      return;
    }

    if (errors.drive) {
      driveRef.current?.focus();
    }
  }, [errorToken]);

  return (
    <div className='slcn-trip-register-step'>
      <FileDropzone
        label='지도 1'
        prompt='지도 1 파일을 끌어다 놓거나 선택하세요'
        accept='.jpg,.jpeg,.png,.gif,.svg'
        required
        error={errors.map1}
        file={values.map1}
        ref={map1Ref}
        onFileSelect={(file) => onFieldChange('map1', file)}
        onClear={() => onFieldChange('map1', null)}
      />
      <Button
        variant='secondary'
        fullWidth
        className='slcn-trip-register-step__toggle-map'
        onClick={() => {
          onFieldChange('hasSecondMap', !values.hasSecondMap);

          if (values.hasSecondMap) {
            onFieldChange('map2', null);
            onFieldChange('button1', '');
            onFieldChange('button2', '');
          }
        }}
      >
        {values.hasSecondMap ? '2번 지도 지우기' : '2번 지도 추가하기'}
      </Button>
      {values.hasSecondMap ? (
        <>
          <FileDropzone
            label='지도 2'
            prompt='지도 2 파일을 끌어다 놓거나 선택하세요'
            accept='.jpg,.jpeg,.png,.gif,.svg'
            required
            error={errors.map2}
            file={values.map2}
            ref={map2Ref}
            onFileSelect={(file) => onFieldChange('map2', file)}
            onClear={() => onFieldChange('map2', null)}
          />
          <TextField
            label='버튼 1'
            placeholder='버튼 1'
            required
            hint='상세 화면에서 지도 1을 여는 탭 이름이 돼요.'
            value={values.button1}
            error={errors.button1}
            ref={button1Ref}
            onChange={(event) => onFieldChange('button1', event.target.value)}
          />
          <TextField
            label='버튼 2'
            placeholder='버튼 2'
            required
            hint='상세 화면에서 지도 2를 여는 탭 이름이 돼요.'
            value={values.button2}
            error={errors.button2}
            ref={button2Ref}
            onChange={(event) => onFieldChange('button2', event.target.value)}
          />
        </>
      ) : null}
      <TextField
        label='드라이브 링크'
        placeholder='드라이브 링크'
        required
        value={values.drive}
        error={errors.drive}
        ref={driveRef}
        onChange={(event) => onFieldChange('drive', event.target.value)}
      />
      <p className='slcn-trip-register-step__hint'>
        드라이브 비밀번호는 상세 화면에서 입사일로 안내됩니다.
      </p>
    </div>
  );
}

import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/ui/FileDropzone';
import { TextField } from '../../../components/ui/TextField';
import type { TripRegisterWizardValues } from '../utils/trip-form-data';
import type { TripValidationErrors } from '../utils/trip-validation';

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
  onFieldChange: <Key extends TripRegisterMapsFieldKey>(
    key: Key,
    value: TripRegisterWizardValues[Key]
  ) => void;
};

export function TripRegisterStepMaps({
  values,
  errors,
  onFieldChange,
}: TripRegisterStepMapsProps) {
  return (
    <div className='slcn-trip-register-step'>
      <FileDropzone
        label='지도'
        accept='.jpg,.jpeg,.png,.gif,.svg'
        onChange={(event) =>
          onFieldChange('map1', event.target.files?.[0] ?? null)
        }
      />
      {values.map1 ? (
        <p className='slcn-trip-register-step__file-name'>{values.map1.name}</p>
      ) : null}
      {errors.map1 ? (
        <p className='slcn-trip-register-step__error'>{errors.map1}</p>
      ) : null}
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
            accept='.jpg,.jpeg,.png,.gif,.svg'
            onChange={(event) =>
              onFieldChange('map2', event.target.files?.[0] ?? null)
            }
          />
          {values.map2 ? (
            <p className='slcn-trip-register-step__file-name'>
              {values.map2.name}
            </p>
          ) : null}
          {errors.map2 ? (
            <p className='slcn-trip-register-step__error'>{errors.map2}</p>
          ) : null}
          <TextField
            label='버튼 1'
            placeholder='버튼 1'
            value={values.button1}
            error={errors.button1}
            onChange={(event) => onFieldChange('button1', event.target.value)}
          />
          <TextField
            label='버튼 2'
            placeholder='버튼 2'
            value={values.button2}
            error={errors.button2}
            onChange={(event) => onFieldChange('button2', event.target.value)}
          />
        </>
      ) : null}
      <TextField
        label='드라이브 링크'
        placeholder='드라이브 링크'
        value={values.drive}
        error={errors.drive}
        onChange={(event) => onFieldChange('drive', event.target.value)}
      />
      <p className='slcn-trip-register-step__hint'>
        드라이브 비밀번호는 상세 화면에서 입사일로 안내됩니다.
      </p>
    </div>
  );
}

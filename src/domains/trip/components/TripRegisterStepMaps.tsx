import { Button } from '../../../components/ui/Button';
import { FileDropzone } from '../../../components/ui/FileDropzone';
import { TextField } from '../../../components/ui/TextField';
import type { TripValidationErrors } from '../utils/trip-validation';
import type { TripRegisterWizardValues } from '../utils/trip-form-data';

type TripRegisterStepMapsProps = {
  values: TripRegisterWizardValues;
  errors: TripValidationErrors;
  onFieldChange: <Key extends keyof TripRegisterWizardValues>(
    key: Key,
    value: TripRegisterWizardValues[Key],
  ) => void;
};

export function TripRegisterStepMaps({
  values,
  errors,
  onFieldChange,
}: TripRegisterStepMapsProps) {
  return (
    <div className="slcn-trip-register-step">
      <FileDropzone
        label="지도 1 업로드"
        accept=".jpg,.jpeg,.png,.gif,.svg"
        onChange={(event) =>
          onFieldChange('map1', event.target.files?.[0] ?? null)
        }
      />
      {values.map1 ? (
        <p className="slcn-trip-register-step__file-name">{values.map1.name}</p>
      ) : null}
      {errors.map1 ? <p className="slcn-trip-register-step__error">{errors.map1}</p> : null}
      <Button
        variant="secondary"
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
            label="지도 2 업로드"
            accept=".jpg,.jpeg,.png,.gif,.svg"
            onChange={(event) =>
              onFieldChange('map2', event.target.files?.[0] ?? null)
            }
          />
          {values.map2 ? (
            <p className="slcn-trip-register-step__file-name">{values.map2.name}</p>
          ) : null}
          {errors.map2 ? (
            <p className="slcn-trip-register-step__error">{errors.map2}</p>
          ) : null}
          <TextField
            label="버튼 1"
            value={values.button1}
            error={errors.button1}
            onChange={(event) => onFieldChange('button1', event.target.value)}
          />
          <TextField
            label="버튼 2"
            value={values.button2}
            error={errors.button2}
            onChange={(event) => onFieldChange('button2', event.target.value)}
          />
        </>
      ) : null}
      <TextField
        label="드라이브 링크"
        value={values.drive}
        error={errors.drive}
        onChange={(event) => onFieldChange('drive', event.target.value)}
      />
      <p className="slcn-trip-register-step__hint">
        드라이브 비밀번호 안내는 상세 화면에서 고정 문구로 노출됩니다.
      </p>
    </div>
  );
}

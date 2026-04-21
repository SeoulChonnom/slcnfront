import { RadioGroup } from '../../../components/ui/RadioGroup';
import { FileDropzone } from '../../../components/ui/FileDropzone';
import { TextField } from '../../../components/ui/TextField';
import type { TripValidationErrors } from '../utils/trip-validation';
import type { TripRegisterWizardValues } from '../utils/trip-form-data';

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
  onFieldChange: <Key extends TripRegisterBasicFieldKey>(
    key: Key,
    value: TripRegisterWizardValues[Key]
  ) => void;
};

export function TripRegisterStepBasic({
  values,
  errors,
  onFieldChange,
}: TripRegisterStepBasicProps) {
  return (
    <div className="slcn-trip-register-step">
      <RadioGroup
        name="trip-type"
        value={values.type}
        options={[
          { label: '아영', value: 'A' },
          { label: '일권', value: 'I' },
        ]}
        onChange={(value) => onFieldChange('type', value)}
      />
      {errors.type ? (
        <p className="slcn-trip-register-step__error">{errors.type}</p>
      ) : null}
      <TextField
        type="date"
        label="날짜"
        value={values.date}
        error={errors.date}
        onChange={(event) => onFieldChange('date', event.target.value)}
      />
      <TextField
        label="나들이 이름"
        placeholder="나들이 이름"
        value={values.info2}
        error={errors.info2}
        onChange={(event) => onFieldChange('info2', event.target.value)}
      />
      <FileDropzone
        label="로고"
        accept=".jpg,.jpeg,.png,.gif,.svg"
        onChange={(event) =>
          onFieldChange('logo', event.target.files?.[0] ?? null)
        }
      />
      {values.logo ? (
        <p className="slcn-trip-register-step__file-name">{values.logo.name}</p>
      ) : null}
      {errors.logo ? (
        <p className="slcn-trip-register-step__error">{errors.logo}</p>
      ) : null}
    </div>
  );
}

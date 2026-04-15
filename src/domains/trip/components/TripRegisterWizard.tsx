import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '../../../app/router/route-constants';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PageSectionHeader } from '../../../components/ui/PageSectionHeader';
import { buildDeviceTripListPath } from '../../../lib/routing/route-builders';
import type { TripRegisterWizardValues } from '../utils/trip-form-data';
import { useTripRegisterForm } from '../hooks/useTripRegisterForm';
import { TripRegisterStepBasic } from './TripRegisterStepBasic';
import { TripRegisterStepMaps } from './TripRegisterStepMaps';
import { TripRegisterStepQuiz } from './TripRegisterStepQuiz';

type TripRegisterWizardProps = {
  device: DeviceType;
  onSubmit?: (values: TripRegisterWizardValues) => Promise<void> | void;
};

export function TripRegisterWizard({
  device,
  onSubmit,
}: TripRegisterWizardProps) {
  const navigate = useNavigate();
  const form = useTripRegisterForm({
    onSubmit,
    onSuccess: () => {
      navigate(buildDeviceTripListPath(device));
    },
  });

  return (
    <section className="slcn-trip-register-wizard">
      <PageSectionHeader
        title="새 나들이 기록하기"
        description="기존 필드는 유지하되, 3단계 wizard로 입력을 분리했습니다."
      />
      <Card className="slcn-trip-register-wizard__card">
        <div className="slcn-trip-register-wizard__step-indicator">
          <span data-active={form.step === 1}>STEP 1</span>
          <span data-active={form.step === 2}>STEP 2</span>
          <span data-active={form.step === 3}>STEP 3</span>
        </div>

        {form.step === 1 ? (
          <TripRegisterStepBasic
            values={form.values}
            errors={form.errors}
            onFieldChange={form.updateField}
          />
        ) : null}

        {form.step === 2 ? (
          <TripRegisterStepMaps
            values={form.values}
            errors={form.errors}
            onFieldChange={form.updateField}
          />
        ) : null}

        {form.step === 3 ? (
          <TripRegisterStepQuiz
            values={form.values}
            errors={form.errors}
            onFieldChange={form.updateField}
            onQuizOptionChange={form.updateQuizOption}
          />
        ) : null}

        {form.submitError ? (
          <p className="slcn-trip-register-step__error" role="alert">
            {form.submitError.message}
          </p>
        ) : null}

        <div className="slcn-trip-register-wizard__actions">
          {form.step > 1 ? (
            <Button variant="secondary" onClick={form.goPrev}>
              이전
            </Button>
          ) : null}
          {form.step < 3 ? (
            <Button onClick={form.goNext}>다음 단계</Button>
          ) : (
            <Button
              loading={form.isSubmitting}
              onClick={() => void form.submit()}
            >
              저장
            </Button>
          )}
        </div>
      </Card>
    </section>
  );
}

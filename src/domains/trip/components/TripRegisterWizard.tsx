import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '../../../app/router/route-constants';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PageSectionHeader } from '../../../components/ui/PageSectionHeader';
import { buildDeviceTripListPath } from '../../../lib/routing/route-builders';
import { useTripRegisterForm } from '../hooks/useTripRegisterForm';
import type { TripRegisterWizardValues } from '../utils/trip-form-data';
import { TripRegisterStepBasic } from './TripRegisterStepBasic';
import { TripRegisterStepMaps } from './TripRegisterStepMaps';
import { TripRegisterStepQuiz } from './TripRegisterStepQuiz';

type TripRegisterWizardProps = {
  device: DeviceType;
  onSubmit?: (values: TripRegisterWizardValues) => Promise<void> | void;
};

type TripRegisterFormState = ReturnType<typeof useTripRegisterForm>;

type TripRegisterStepConfig = {
  step: 1 | 2 | 3;
  label: string;
  render: (form: TripRegisterFormState) => ReactNode;
};

const TRIP_REGISTER_STEP_CONFIGS: readonly TripRegisterStepConfig[] = [
  {
    step: 1,
    label: '기본 정보',
    render: (form) => (
      <TripRegisterStepBasic
        values={form.values}
        errors={form.errors}
        onFieldChange={form.updateField}
      />
    ),
  },
  {
    step: 2,
    label: '지도 정보',
    render: (form) => (
      <TripRegisterStepMaps
        values={form.values}
        errors={form.errors}
        onFieldChange={form.updateField}
      />
    ),
  },
  {
    step: 3,
    label: '퀴즈 정보',
    render: (form) => (
      <TripRegisterStepQuiz
        values={form.values}
        errors={form.errors}
        onFieldChange={form.updateField}
        onQuizOptionChange={form.updateQuizOption}
      />
    ),
  },
] as const;

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
  const activeStep = TRIP_REGISTER_STEP_CONFIGS.find(
    (config) => config.step === form.step,
  );

  return (
    <section className="slcn-trip-register-wizard">
      {device === 'main' ? (
        <PageSectionHeader
          title="서울 촌놈 나들이 추가"
          description="날짜, 지도, 퀴즈 정보를 차례대로 입력해 나들이 기록을 남겨보세요."
        />
      ) : null}
      <Card className="slcn-trip-register-wizard__card">
        <div className="slcn-trip-register-wizard__step-indicator">
          {TRIP_REGISTER_STEP_CONFIGS.map((config) => (
            <span key={config.step} data-active={form.step === config.step}>
              {config.label}
            </span>
          ))}
        </div>

        {activeStep ? activeStep.render(form) : null}

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
            <Button onClick={form.goNext}>다음</Button>
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

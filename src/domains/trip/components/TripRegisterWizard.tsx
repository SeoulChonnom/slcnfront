import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TripRegisterStepBasic } from '@/domains/trip/components/TripRegisterStepBasic';
import { TripRegisterStepMaps } from '@/domains/trip/components/TripRegisterStepMaps';
import { TripRegisterStepQuiz } from '@/domains/trip/components/TripRegisterStepQuiz';
import { useTripRegisterForm } from '@/domains/trip/hooks/useTripRegisterForm';
import type { TripRegisterWizardValues } from '@/domains/trip/utils/trip-form-data';
import { buildDeviceTripListPath } from '@/lib/routing/route-builders';

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
        errorToken={form.errorToken}
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
        errorToken={form.errorToken}
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
        errorToken={form.errorToken}
        onFieldChange={form.updateField}
        onQuizOptionChange={form.updateQuizOption}
        onAddQuizOption={form.addQuizOption}
        onRemoveQuizOption={form.removeQuizOption}
      />
    ),
  },
] as const;

const STEP_STATE_LABEL = {
  complete: '완료',
  current: '진행 중',
  upcoming: '예정',
} as const;

/** Names of the files a restored draft cannot carry back, in field order. */
const DRAFT_FILE_LABELS = [
  ['logo', '로고 이미지'],
  ['map1', '지도 1'],
  ['map2', '지도 2'],
] as const;

export function TripRegisterWizard({
  device,
  onSubmit,
}: TripRegisterWizardProps) {
  const navigate = useNavigate();
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const form = useTripRegisterForm({
    onSubmit,
    onSuccess: () => {
      navigate(buildDeviceTripListPath(device));
    },
  });
  const activeStep = TRIP_REGISTER_STEP_CONFIGS.find(
    (config) => config.step === form.step
  );
  const tripListPath = buildDeviceTripListPath(device);
  const { isDirty, step, restoredDraft } = form;
  const previousStepRef = useRef(step);
  const missingDraftFiles = restoredDraft
    ? DRAFT_FILE_LABELS.filter(([key]) => restoredDraft.fileNames[key]).map(
        ([, label]) => label
      )
    : [];

  /* A refresh or a closed tab is the one exit the draft cannot fully cover:
     the picked files never make it into sessionStorage. */
  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', warnBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', warnBeforeUnload);
    };
  }, [isDirty]);

  /* Every step is taller than the viewport, so arriving at step 2 or 3
     halfway down the previous step's scroll position hides its first field. */
  useEffect(() => {
    if (previousStepRef.current === step) {
      return;
    }

    previousStepRef.current = step;

    if (typeof window.scrollTo !== 'function') {
      return;
    }

    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [step]);

  function leaveRegister() {
    setIsLeaveConfirmOpen(false);
    navigate(tripListPath);
  }

  function requestLeave() {
    if (isDirty) {
      setIsLeaveConfirmOpen(true);

      return;
    }

    leaveRegister();
  }

  return (
    <section className='slcn-trip-register-wizard'>
      {device === 'main' ? (
        <h1 className='slcn-trip-register-wizard__title'>새 나들이 기록하기</h1>
      ) : (
        <h1 className='slcn-visually-hidden'>새 나들이 기록하기</h1>
      )}
      <Card className='slcn-trip-register-wizard__card'>
        <ol
          className='slcn-trip-register-wizard__step-indicator'
          aria-label='나들이 등록 단계'
        >
          {TRIP_REGISTER_STEP_CONFIGS.map((config) => {
            const state =
              config.step < form.step
                ? 'complete'
                : config.step === form.step
                  ? 'current'
                  : 'upcoming';

            return (
              <li
                key={config.step}
                data-state={state}
                data-active={state === 'current'}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <span
                  className='slcn-trip-register-wizard__step-num'
                  aria-hidden='true'
                >
                  {config.step}
                </span>
                <span className='slcn-trip-register-wizard__step-label'>
                  {config.label}
                </span>
                <span className='slcn-visually-hidden'>
                  {' '}
                  {STEP_STATE_LABEL[state]}
                </span>
              </li>
            );
          })}
        </ol>

        {restoredDraft ? (
          <div
            className='slcn-trip-register-wizard__draft-notice'
            role='status'
          >
            <p className='slcn-trip-register-wizard__draft-text'>
              작성하던 내용을 불러왔어요.
              {missingDraftFiles.length > 0
                ? ` ${missingDraftFiles.join(' · ')} 파일은 다시 선택해 주세요.`
                : ''}
            </p>
            <div className='slcn-trip-register-wizard__draft-actions'>
              <Button
                variant='ghost'
                size='sm'
                onClick={form.dismissRestoredDraft}
              >
                이어서 쓰기
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='slcn-trip-register-wizard__draft-discard'
                onClick={form.discardDraft}
              >
                새로 쓰기
              </Button>
            </div>
          </div>
        ) : null}

        {activeStep ? activeStep.render(form) : null}

        {form.submitErrorMessage ? (
          <p className='slcn-trip-register-step__error' role='alert'>
            {form.submitErrorMessage}
          </p>
        ) : null}

        <div className='slcn-trip-register-wizard__actions'>
          <Button
            variant='ghost'
            className='slcn-trip-register-wizard__cancel'
            onClick={requestLeave}
          >
            취소
          </Button>
          {form.step > 1 ? (
            <Button variant='secondary' onClick={form.goPrev}>
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

      <ConfirmDialog
        isOpen={isLeaveConfirmOpen}
        title='작성을 그만둘까요?'
        description='지금까지 고른 파일은 사라져요. 적어 둔 글은 이 브라우저에 남아 있어서 다시 들어오면 이어서 쓸 수 있어요.'
        confirmLabel='나가기'
        cancelLabel='계속 쓸게요'
        onConfirm={leaveRegister}
        onCancel={() => setIsLeaveConfirmOpen(false)}
      />
    </section>
  );
}

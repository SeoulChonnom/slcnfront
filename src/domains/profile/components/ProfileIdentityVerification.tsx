import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { useAuthStore } from '@/domains/auth/store/auth-store';
import { useVerifyProfilePassword } from '@/domains/profile/hooks/useVerifyProfilePassword';
import { grantProfileEditAccess } from '@/domains/profile/utils/profile-verification';
import { AppError } from '@/lib/api/errors';

type ProfileIdentityVerificationProps = {
  device: 'desktop' | 'mobile';
  onCancel?: () => void;
  onContinue: () => void;
};

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true'>
      <path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z' />
      <circle cx='12' cy='12' r='3' />
      {hidden ? <path d='M4 4l16 16' /> : null}
    </svg>
  );
}

function isPasswordMismatch(error: Error | null) {
  return (
    error instanceof AppError &&
    error.code === 'HTTP_ERROR' &&
    (error.status === 400 || error.status === 401)
  );
}

export function ProfileIdentityVerification({
  device,
  onCancel,
  onContinue,
}: ProfileIdentityVerificationProps) {
  const errorId = useId();
  const passwordInputId = useId();
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const submissionInFlightRef = useRef(false);
  const mutation = useVerifyProfilePassword();
  const username = useAuthStore((state) => state.userInfo?.userName ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const hasPassword = password.length > 0;
  const errorMessage = mutation.error
    ? isPasswordMismatch(mutation.error)
      ? '현재 비밀번호가 일치하지 않습니다. 다시 입력해 주세요.'
      : '일시적인 오류로 확인하지 못했어요. 잠시 후 다시 시도해 주세요.'
    : null;

  useEffect(() => {
    if (device === 'desktop') {
      passwordInputRef.current?.focus();
    }
  }, [device]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasPassword || mutation.isPending || submissionInFlightRef.current) {
      return;
    }

    submissionInFlightRef.current = true;

    try {
      await mutation.mutateAsync(password);
      grantProfileEditAccess(username);
      onContinue();
    } catch {
      submissionInFlightRef.current = false;
      return;
    }
  }

  return (
    <form
      className='slcn-profile-verify-form'
      data-device={device}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className='slcn-profile-verify-form__heading'>
        <span className='slcn-profile-lock-icon'>
          <svg viewBox='0 0 24 24' aria-hidden='true'>
            <rect x='5' y='11' width='14' height='9' rx='2' />
            <path d='M8 11V8a4 4 0 018 0v3' />
          </svg>
        </span>
        <h2>본인 확인</h2>
      </div>
      <p className='slcn-profile-verify-form__description'>
        사용자 정보를 수정하려면 현재 비밀번호로 본인 확인이 필요해요.
      </p>
      <label className='slcn-profile-field-label' htmlFor={passwordInputId}>
        현재 비밀번호
      </label>
      <div
        className='slcn-profile-password-field'
        data-error={Boolean(errorMessage)}
      >
        <input
          ref={passwordInputRef}
          id={passwordInputId}
          name='currentPassword'
          type={showPassword ? 'text' : 'password'}
          value={password}
          autoComplete='current-password'
          placeholder={
            device === 'mobile'
              ? '현재 비밀번호'
              : '현재 비밀번호를 입력해 주세요'
          }
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? errorId : undefined}
          onChange={(event) => {
            setPassword(event.target.value);
            mutation.reset();
          }}
        />
        <button
          type='button'
          aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
          onClick={() => setShowPassword((visible) => !visible)}
        >
          <EyeIcon hidden={showPassword} />
        </button>
      </div>
      {errorMessage ? (
        <div id={errorId} className='slcn-profile-alert' role='alert'>
          <svg viewBox='0 0 24 24' aria-hidden='true'>
            <circle cx='12' cy='12' r='9' />
            <path d='M12 7v6M12 16.5v.5' />
          </svg>
          <span>{errorMessage}</span>
        </div>
      ) : null}
      <div className='slcn-profile-verify-form__actions'>
        {device === 'desktop' && onCancel ? (
          <button
            type='button'
            className='slcn-profile-secondary-action'
            onClick={onCancel}
          >
            취소
          </button>
        ) : null}
        <button
          type='submit'
          className='slcn-profile-primary-action'
          disabled={!hasPassword || mutation.isPending}
        >
          {mutation.isPending ? (
            <span className='slcn-profile-spinner' aria-hidden='true' />
          ) : null}
          {mutation.isPending ? '확인 중…' : '확인'}
        </button>
      </div>
    </form>
  );
}

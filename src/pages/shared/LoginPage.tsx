import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { DeviceType } from '../../app/router/route-constants';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SLCNLogoBlob } from '../../components/ui/SLCNLogoBlob';
import { TextField } from '../../components/ui/TextField';
import { useLogin } from '../../domains/auth/hooks/useLogin';
import {
  selectAuthPhase,
  useAuthStore,
} from '../../domains/auth/store/auth-store';
import { resolvePostAuthRedirectTarget } from '../../domains/auth/utils/redirect-target';

type LoginPageProps = {
  device: DeviceType;
};

export function LoginPage({ device }: LoginPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const authPhase = useAuthStore(selectAuthPhase);
  const loginMutation = useLogin();
  const redirectTarget = resolvePostAuthRedirectTarget(location.search, device);
  const userNameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (authPhase === 'authenticated') {
      navigate(redirectTarget, { replace: true });
    }
  }, [authPhase, navigate, redirectTarget]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await loginMutation.mutateAsync({
        userName,
        password,
      });
    } catch {
      return;
    }
  }

  function clearUserName() {
    setUserName('');
    userNameInputRef.current?.focus();
  }

  function clearPassword() {
    setPassword('');
    passwordInputRef.current?.focus();
  }

  return (
    <Card className='slcn-login-page' tone='default'>
      <div className='slcn-login-page__hero'>
        <div className='slcn-login-page__brand'>
          <SLCNLogoBlob size='md' />
        </div>
        <p className='slcn-login-page__welcome'>Seoul Chonnom</p>
      </div>
      <form className='slcn-login-page__form' onSubmit={handleSubmit}>
        <TextField
          ref={userNameInputRef}
          name='userName'
          label='아이디'
          placeholder='아이디를 입력해 주세요'
          autoComplete='username'
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          trailing={
            <button
              type='button'
              className='slcn-login-page__clear-button'
              onClick={clearUserName}
              aria-label='아이디 입력값 지우기'
              disabled={!userName}
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.4'
                strokeLinecap='round'
                aria-hidden='true'
              >
                <path d='M6 6l12 12M18 6L6 18' />
              </svg>
            </button>
          }
          required
        />
        <TextField
          ref={passwordInputRef}
          name='password'
          type='password'
          label='비밀번호'
          placeholder='비밀번호를 입력해 주세요'
          autoComplete='current-password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          trailing={
            <button
              type='button'
              className='slcn-login-page__clear-button'
              onClick={clearPassword}
              aria-label='비밀번호 입력값 지우기'
              disabled={!password}
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.4'
                strokeLinecap='round'
                aria-hidden='true'
              >
                <path d='M6 6l12 12M18 6L6 18' />
              </svg>
            </button>
          }
          required
        />
        <div className='slcn-login-page__actions'>
          <Button type='submit' fullWidth loading={loginMutation.isPending}>
            로그인
          </Button>
        </div>
        {loginMutation.error ? (
          <p className='slcn-login-page__error' role='alert'>
            아이디 또는 비밀번호를 다시 확인해 주세요.
          </p>
        ) : null}
      </form>
    </Card>
  );
}

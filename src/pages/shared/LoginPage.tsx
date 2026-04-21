import { useEffect, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { DeviceType } from '../../app/router/route-constants';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TextField } from '../../components/ui/TextField';
import { SLCNLogoBlob } from '../../components/ui/SLCNLogoBlob';
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

  useEffect(() => {
    if (authPhase === 'authenticated') {
      navigate(redirectTarget, { replace: true });
    }
  }, [authPhase, navigate, redirectTarget]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    try {
      await loginMutation.mutateAsync({
        userName: String(formData.get('userName') || ''),
        password: String(formData.get('password') || ''),
      });
    } catch {
      return;
    }
  }

  return (
    <Card className="slcn-login-page" tone="default">
      <div className="slcn-login-page__hero">
        <div className="slcn-login-page__brand">
          <SLCNLogoBlob size="sm" />
          <span className="slcn-login-page__brand-text">SLCN</span>
        </div>
        <p className="slcn-login-page__welcome">SLCN Login</p>
      </div>
      <form className="slcn-login-page__form" onSubmit={handleSubmit}>
        <TextField
          name="userName"
          label="아이디"
          placeholder="Enter your id"
          autoComplete="username"
          trailing={<span className="slcn-login-page__field-icon">◔</span>}
          required
        />
        <TextField
          name="password"
          type="password"
          label="비밀번호"
          placeholder="Enter your password"
          autoComplete="current-password"
          trailing={<span className="slcn-login-page__field-icon">◌</span>}
          required
        />
        <div className="slcn-login-page__actions">
          <Button type="submit" fullWidth loading={loginMutation.isPending}>
            Login
          </Button>
        </div>
        {loginMutation.error ? (
          <p className="slcn-login-page__error" role="alert">
            {loginMutation.error.message}
          </p>
        ) : null}
        <div className="slcn-login-page__links" aria-label="로그인 도움 링크">
          <button type="button">아이디 찾기</button>
          <span aria-hidden="true">|</span>
          <button type="button">비밀번호 찾기</button>
          <span aria-hidden="true">|</span>
          <button type="button">회원가입</button>
        </div>
      </form>
    </Card>
  );
}

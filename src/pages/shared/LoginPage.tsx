import { useEffect, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { DeviceType } from '../../app/router/route-constants';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageSectionHeader } from '../../components/ui/PageSectionHeader';
import { TextField } from '../../components/ui/TextField';
import { useLogin } from '../../domains/auth/hooks/useLogin';
import { useAuthStore } from '../../domains/auth/store/auth-store';
import { buildDeviceRootPath } from '../../lib/routing/route-builders';

type LoginPageProps = {
  device: DeviceType;
};

function getRedirectTarget(search: string, device: DeviceType) {
  const searchParams = new URLSearchParams(search);

  return searchParams.get('redirect') || buildDeviceRootPath(device);
}

export function LoginPage({ device }: LoginPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) =>
    Boolean(state.accessToken && state.userInfo),
  );
  const loginMutation = useLogin();
  const redirectTarget = getRedirectTarget(location.search, device);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTarget]);

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
      <PageSectionHeader
        title="SEOUL CHONNOM LOGIN"
        description="서울 촌놈의 서울 구경 일지"
      />
      <form className="slcn-login-page__form" onSubmit={handleSubmit}>
        <TextField
          name="userName"
          label="USER NAME"
          placeholder="아이디를 입력하세요"
          required
        />
        <TextField
          name="password"
          type="password"
          label="PASSWORD"
          placeholder="비밀번호를 입력하세요"
          required
        />
        <div className="slcn-login-page__actions">
          <Button type="submit" fullWidth loading={loginMutation.isPending}>
            LOGIN
          </Button>
        </div>
        {loginMutation.error ? (
          <p className="slcn-login-page__error" role="alert">
            {loginMutation.error.message}
          </p>
        ) : null}
      </form>
    </Card>
  );
}

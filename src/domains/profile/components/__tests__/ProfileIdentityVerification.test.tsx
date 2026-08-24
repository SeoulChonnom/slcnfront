import { act, screen, waitFor } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/domains/auth/store/auth-store';
import { ProfileIdentityVerification } from '@/domains/profile/components/ProfileIdentityVerification';
import { hasProfileEditAccess } from '@/domains/profile/utils/profile-verification';
import { AppError } from '@/lib/api/errors';
import { renderWithProviders } from '@/test/helpers/render';

const { verifyPassword } = vi.hoisted(() => ({ verifyPassword: vi.fn() }));

vi.mock('@/domains/profile/api/profile-api', () => ({
  profileApi: { verifyPassword },
}));

function renderVerification(onContinue = vi.fn()) {
  return {
    onContinue,
    ...renderWithProviders(
      <ProfileIdentityVerification device='mobile' onContinue={onContinue} />
    ),
  };
}

describe('ProfileIdentityVerification', () => {
  beforeEach(() => {
    verifyPassword.mockReset();
    window.sessionStorage.clear();
    useAuthStore.getState().setSession({
      accessToken: 'access-token',
      userInfo: {
        name: '사용자',
        userName: 'string',
        roleList: ['user'],
      },
    });
  });

  it('keeps verification unavailable until a current password is entered', () => {
    renderVerification();

    expect(
      screen.getByRole('button', { name: '확인' }).hasAttribute('disabled')
    ).toBe(true);
  });

  it('lets a user reveal and hide their current password', async () => {
    const { user } = renderVerification();
    const password = screen.getByLabelText('현재 비밀번호');

    expect(password.getAttribute('type')).toBe('password');
    await user.click(screen.getByRole('button', { name: '비밀번호 표시' }));
    expect(password.getAttribute('type')).toBe('text');
    await user.click(screen.getByRole('button', { name: '비밀번호 숨기기' }));
    expect(password.getAttribute('type')).toBe('password');
  });

  it('exposes current-password metadata without forcing focus on mobile', () => {
    renderVerification();
    const password = screen.getByLabelText('현재 비밀번호');

    expect(password.id).not.toBe('');
    expect(password).toMatchObject({
      name: 'currentPassword',
      autocomplete: 'current-password',
    });
    expect(document.activeElement).not.toBe(password);
  });

  it('shows progress and advances immediately after successful verification', async () => {
    let resolveVerification: (() => void) | undefined;
    verifyPassword.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveVerification = resolve;
        })
    );
    const { onContinue, user } = renderVerification();

    await user.type(screen.getByLabelText('현재 비밀번호'), 'current-password');
    await user.click(screen.getByRole('button', { name: '확인' }));

    expect(
      screen.getByRole('button', { name: '확인 중…' }).hasAttribute('disabled')
    ).toBe(true);
    resolveVerification?.();

    await waitFor(() => {
      expect(hasProfileEditAccess('string')).toBe(true);
      expect(onContinue).toHaveBeenCalledOnce();
    });
    expect(screen.queryByText('확인되었습니다')).toBeNull();
  });

  it('coalesces duplicate submit events while the same verification is pending', async () => {
    let resolveVerification: (() => void) | undefined;
    verifyPassword.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveVerification = resolve;
        })
    );
    const { user } = renderVerification();

    await user.type(screen.getByLabelText('현재 비밀번호'), 'current-password');
    const form = screen.getByRole('button', { name: '확인' }).closest('form');

    if (!form) {
      throw new Error('Verification form was not rendered.');
    }

    act(() => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
    });

    await waitFor(() => {
      expect(verifyPassword).toHaveBeenCalledTimes(1);
    });
    resolveVerification?.();
    await waitFor(() => expect(verifyPassword).toHaveBeenCalledTimes(1));
  });

  it('explains an incorrect password without advancing to the edit flow', async () => {
    verifyPassword.mockRejectedValueOnce(
      new AppError({
        code: 'HTTP_ERROR',
        message: 'incorrect password',
        status: 401,
      })
    );
    const { onContinue, user } = renderVerification();

    await user.type(screen.getByLabelText('현재 비밀번호'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: '확인' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      '현재 비밀번호가 일치하지 않습니다.'
    );
    await waitFor(() => expect(onContinue).not.toHaveBeenCalled());
  });
});

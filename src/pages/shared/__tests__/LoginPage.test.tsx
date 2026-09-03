import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoginPage } from '@/pages/shared/LoginPage';
import { renderWithMinimalProviders } from '@/test/helpers/render';

describe('LoginPage keyboard navigation', () => {
  it.each(['main', 'mobile'] as const)(
    'tabs from the filled username to password and submit without stopping on clear buttons (%s)',
    async (device) => {
      const { user } = renderWithMinimalProviders(
        <LoginPage device={device} />,
        {
          route: `/${device}/login`,
        }
      );
      const userNameInput = screen.getByLabelText(/아이디/, {
        selector: 'input',
      });
      const passwordInput = screen.getByLabelText(/비밀번호/, {
        selector: 'input',
      });
      const submitButton = screen.getByRole('button', { name: '로그인' });
      const clearUserNameButton = screen.getByRole('button', {
        name: '아이디 입력값 지우기',
      });
      const clearPasswordButton = screen.getByRole('button', {
        name: '비밀번호 입력값 지우기',
      });

      expect((clearUserNameButton as HTMLButtonElement).disabled).toBe(true);
      expect((clearPasswordButton as HTMLButtonElement).disabled).toBe(true);

      await user.type(userNameInput, 'test-user');
      await user.type(passwordInput, 'test-password');

      expect((clearUserNameButton as HTMLButtonElement).disabled).toBe(false);
      expect((clearPasswordButton as HTMLButtonElement).disabled).toBe(false);

      await user.click(clearUserNameButton);
      expect((userNameInput as HTMLInputElement).value).toBe('');
      expect((clearUserNameButton as HTMLButtonElement).disabled).toBe(true);
      expect(document.activeElement).toBe(userNameInput);

      await user.click(clearPasswordButton);
      expect((passwordInput as HTMLInputElement).value).toBe('');
      expect((clearPasswordButton as HTMLButtonElement).disabled).toBe(true);
      expect(document.activeElement).toBe(passwordInput);

      await user.type(userNameInput, 'test-user');
      await user.type(passwordInput, 'test-password');

      userNameInput.focus();
      expect(document.activeElement).toBe(userNameInput);

      await user.tab();
      expect(document.activeElement).toBe(passwordInput);

      await user.tab();
      expect(document.activeElement).toBe(submitButton);
    }
  );
});

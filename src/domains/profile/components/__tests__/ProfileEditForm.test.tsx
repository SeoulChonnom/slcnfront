import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/domains/auth/store/auth-store';
import { ProfileEditForm } from '@/domains/profile/components/ProfileEditForm';
import type { UserProfile } from '@/domains/profile/types';
import { renderWithProviders } from '@/test/helpers/render';

const {
  downloadProfileImage,
  getProfile,
  restoreSession,
  updateProfile,
  uploadProfileImage,
} = vi.hoisted(() => ({
  downloadProfileImage: vi.fn(),
  getProfile: vi.fn(),
  restoreSession: vi.fn(),
  updateProfile: vi.fn(),
  uploadProfileImage: vi.fn(),
}));

vi.mock('@/domains/profile/api/profile-api', () => ({
  profileApi: {
    downloadProfileImage,
    getProfile,
    updateProfile,
    uploadProfileImage,
  },
}));

vi.mock('@/domains/auth/api/auth-api', () => ({
  authApi: {
    restoreSession,
  },
}));

const currentProfile: UserProfile = {
  username: 'string',
  name: '기존 이름',
  profileImage: null,
};

function renderEditForm() {
  return renderWithProviders(<ProfileEditForm device='mobile' />);
}

describe('ProfileEditForm', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'access-token',
      userInfo: {
        name: '기존 이름',
        userName: 'string',
        roleList: ['user'],
      },
      hydrated: true,
      restoreState: 'success',
    });
    downloadProfileImage.mockReset();
    getProfile.mockReset();
    restoreSession.mockReset();
    updateProfile.mockReset();
    uploadProfileImage.mockReset();
    getProfile.mockResolvedValue(currentProfile);
    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: vi.fn(() => 'blob:profile-preview'),
        revokeObjectURL: vi.fn(),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps an all-empty update disabled while explaining that untouched fields remain unchanged', async () => {
    renderEditForm();

    expect(await screen.findByText('기존 이름')).toBeTruthy();
    expect(screen.getByText('변경하지 않으려면 비워 두세요.')).toBeTruthy();
    expect(
      screen
        .getByRole('button', { name: '프로필 이미지 선택' })
        .querySelector('svg')
    ).toBeTruthy();
    expect(
      screen
        .getByRole('button', { name: '변경 사항 저장' })
        .hasAttribute('disabled')
    ).toBe(true);
  });

  it('associates every editable field with a stable browser-facing identity', async () => {
    renderEditForm();

    await screen.findByText('기존 이름');
    const image = screen.getByLabelText('프로필 이미지');
    const name = screen.getByLabelText('이름');
    const password = screen.getByLabelText('비밀번호 변경');
    const confirmation = screen.getByLabelText('변경할 비밀번호 확인');

    expect(image).toMatchObject({ name: 'profileImage' });
    expect(name).toMatchObject({
      name: 'name',
      autocomplete: 'name',
    });
    expect(password).toMatchObject({
      name: 'newPassword',
      autocomplete: 'new-password',
    });
    expect(confirmation).toMatchObject({
      name: 'newPasswordConfirmation',
      autocomplete: 'new-password',
    });
    expect(image.id).not.toBe('');
    expect(name.id).not.toBe('');
    expect(password.id).not.toBe('');
    expect(confirmation.id).not.toBe('');
  });

  it('blocks a password change until its confirmation matches', async () => {
    const { user } = renderEditForm();

    await user.type(
      screen.getByPlaceholderText('변경할 비밀번호'),
      'new-password'
    );

    expect(screen.getByRole('alert').textContent).toContain(
      '비밀번호 확인란도 함께 입력해야 해요.'
    );
    expect(
      screen
        .getByRole('button', { name: '변경 사항 저장' })
        .hasAttribute('disabled')
    ).toBe(true);

    await user.type(
      screen.getByPlaceholderText('변경할 비밀번호 확인'),
      'different-password'
    );

    expect(screen.getByRole('alert').textContent).toContain(
      '두 비밀번호가 일치하지 않습니다.'
    );
    expect(
      screen
        .getByRole('button', { name: '변경 사항 저장' })
        .hasAttribute('disabled')
    ).toBe(true);
  });

  it('previews an image and omits whitespace-only text fields when saving it', async () => {
    const newProfileImage = {
      fileId: 'new-profile-image',
      type: 'profile' as const,
      originalFilename: 'new-avatar.png',
      filename: 'new-avatar.png',
      path: '/profile/new-avatar.png',
      mimeType: 'image/png',
      size: 128,
    };
    uploadProfileImage.mockResolvedValue(newProfileImage);
    updateProfile.mockResolvedValue({
      ...currentProfile,
      profileImage: newProfileImage,
    });
    const { container, user } = renderEditForm();

    await user.type(screen.getByPlaceholderText('변경할 이름'), '   ');
    const fileInput =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput) {
      throw new Error('Profile image input was not rendered.');
    }
    await user.upload(
      fileInput,
      new File(['profile image'], 'new-avatar.png', { type: 'image/png' })
    );

    expect(
      screen
        .getByRole('img', { name: '현재 프로필 이미지' })
        .getAttribute('src')
    ).toBe('blob:profile-preview');
    await user.click(screen.getByRole('button', { name: '변경 사항 저장' }));

    expect((await screen.findByRole('status')).textContent).toContain(
      '저장되었어요.'
    );
    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({
        profileImageFileId: 'new-profile-image',
      });
    });
    expect((screen.getByLabelText('이름') as HTMLInputElement).value).toBe('');
    expect(
      (screen.getByLabelText('프로필 이미지') as HTMLInputElement).value
    ).toBe('');
    expect(
      screen
        .getByRole('button', { name: '변경 사항 저장' })
        .hasAttribute('disabled')
    ).toBe(true);
    await user.click(screen.getByRole('button', { name: '변경 사항 저장' }));
    expect(updateProfile).toHaveBeenCalledTimes(1);
  });

  it('shows the upload-specific recovery only when the upload itself fails', async () => {
    uploadProfileImage.mockRejectedValueOnce(new Error('upload failed'));
    const { container, user } = renderEditForm();
    const fileInput =
      container.querySelector<HTMLInputElement>('input[type="file"]');

    if (!fileInput) {
      throw new Error('Profile image input was not rendered.');
    }

    await user.upload(
      fileInput,
      new File(['profile image'], 'new-avatar.png', { type: 'image/png' })
    );
    await user.click(screen.getByRole('button', { name: '변경 사항 저장' }));

    expect(await screen.findByText('업로드에 실패했어요.')).toBeTruthy();
    expect(screen.queryByText(/저장에 실패했어요/)).toBeNull();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('reuses an uploaded file id when retrying a failed profile PUT', async () => {
    const newProfileImage = {
      fileId: 'reusable-profile-image',
      type: 'profile' as const,
      originalFilename: 'new-avatar.png',
      filename: 'new-avatar.png',
      path: '/profile/new-avatar.png',
      mimeType: 'image/png',
      size: 128,
    };
    uploadProfileImage.mockResolvedValueOnce(newProfileImage);
    updateProfile
      .mockRejectedValueOnce(new Error('PUT failed'))
      .mockResolvedValueOnce({
        ...currentProfile,
        profileImage: newProfileImage,
      });
    const { container, user } = renderEditForm();
    const fileInput =
      container.querySelector<HTMLInputElement>('input[type="file"]');

    if (!fileInput) {
      throw new Error('Profile image input was not rendered.');
    }

    await user.upload(
      fileInput,
      new File(['profile image'], 'new-avatar.png', { type: 'image/png' })
    );
    await user.click(screen.getByRole('button', { name: '변경 사항 저장' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      '저장에 실패했어요. 다시 시도해 주세요.'
    );
    expect(screen.queryByText('업로드에 실패했어요.')).toBeNull();
    expect(uploadProfileImage).toHaveBeenCalledOnce();
    expect(updateProfile).toHaveBeenNthCalledWith(1, {
      profileImageFileId: newProfileImage.fileId,
    });

    await user.click(screen.getByRole('button', { name: '변경 사항 저장' }));

    expect((await screen.findByRole('status')).textContent).toContain(
      '저장되었어요.'
    );
    expect(uploadProfileImage).toHaveBeenCalledOnce();
    expect(updateProfile).toHaveBeenNthCalledWith(2, {
      profileImageFileId: newProfileImage.fileId,
    });
  });

  it('warns before unloading while an unsaved draft exists', async () => {
    const { user } = renderEditForm();

    await user.type(screen.getByLabelText('이름'), '저장 전 이름');
    const unloadEvent = new Event('beforeunload', { cancelable: true });

    expect(window.dispatchEvent(unloadEvent)).toBe(false);
    expect(unloadEvent.defaultPrevented).toBe(true);
  });

  it('separates a saved password change with a failed refresh from a retriable save error', async () => {
    updateProfile.mockResolvedValueOnce({
      ...currentProfile,
      name: '저장된 이름',
    });
    restoreSession.mockRejectedValueOnce(new Error('refresh failed'));
    const { user } = renderEditForm();

    await user.type(screen.getByLabelText('비밀번호 변경'), 'new-password');
    await user.type(
      screen.getByLabelText('변경할 비밀번호 확인'),
      'new-password'
    );
    await user.click(screen.getByRole('button', { name: '변경 사항 저장' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      '변경 사항은 저장되었지만 세션을 갱신하지 못했어요.'
    );
    expect(screen.queryByText(/저장에 실패했어요/)).toBeNull();
    expect(screen.queryByText('업로드에 실패했어요.')).toBeNull();
    expect(
      (screen.getByLabelText('비밀번호 변경') as HTMLInputElement).value
    ).toBe('');
    expect(
      (screen.getByLabelText('변경할 비밀번호 확인') as HTMLInputElement).value
    ).toBe('');
    expect(
      screen
        .getByRole('button', { name: '변경 사항 저장' })
        .hasAttribute('disabled')
    ).toBe(true);
    expect(updateProfile).toHaveBeenCalledTimes(1);
    expect(restoreSession).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      userInfo: null,
      restoreState: 'error',
    });
  });

  it('shows a retriable save error when the profile update fails', async () => {
    updateProfile.mockRejectedValueOnce(new Error('temporary failure'));
    const { user } = renderEditForm();

    await user.type(screen.getByPlaceholderText('변경할 이름'), '새 이름');
    await user.click(screen.getByRole('button', { name: '변경 사항 저장' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      '저장에 실패했어요. 다시 시도해 주세요.'
    );
  });
});

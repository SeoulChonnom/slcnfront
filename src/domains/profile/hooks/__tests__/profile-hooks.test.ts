import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { profileQueryKeys } from '../../../../lib/api/query-keys';
import { createTestQueryClient } from '../../../../test/helpers/query-client';
import { useAuthStore } from '../../../auth/store/auth-store';
import type { UserProfile } from '../../types';
import {
  grantProfileEditAccess,
  hasProfileEditAccess,
} from '../../utils/profile-verification';
import { useProfile } from '../useProfile';
import {
  type ProfileImageUploadError,
  type ProfileUpdateSessionRefreshError,
  type ProfileUpdateWithUploadedImageError,
  useUpdateProfile,
} from '../useUpdateProfile';
import { useVerifyProfilePassword } from '../useVerifyProfilePassword';

const {
  downloadProfileImage,
  getProfile,
  restoreSession,
  updateProfile,
  uploadProfileImage,
  verifyPassword,
} = vi.hoisted(() => ({
  downloadProfileImage: vi.fn(),
  getProfile: vi.fn(),
  restoreSession: vi.fn(),
  updateProfile: vi.fn(),
  uploadProfileImage: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock('../../api/profile-api', () => ({
  profileApi: {
    downloadProfileImage,
    getProfile,
    updateProfile,
    uploadProfileImage,
    verifyPassword,
  },
}));

vi.mock('../../../auth/api/auth-api', () => ({
  authApi: {
    restoreSession,
  },
}));

const originalProfile: UserProfile = {
  username: 'string',
  name: '기존 이름',
  profileImage: null,
};

const uploadedProfileImage: NonNullable<UserProfile['profileImage']> = {
  fileId: 'profile-1',
  type: 'profile',
  originalFilename: 'avatar.png',
  filename: 'avatar-stored.png',
  path: '/profile/avatar-stored.png',
  mimeType: 'image/png',
  size: 1024,
};

const updatedProfile: UserProfile = {
  username: 'string',
  name: '새 이름',
  profileImage: uploadedProfileImage,
};

function createWrapper(client = createTestQueryClient()) {
  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('profile hooks', () => {
  beforeEach(() => {
    downloadProfileImage.mockReset();
    getProfile.mockReset();
    restoreSession.mockReset();
    updateProfile.mockReset();
    uploadProfileImage.mockReset();
    verifyPassword.mockReset();
    window.sessionStorage.clear();
    useAuthStore.setState({
      accessToken: null,
      userInfo: null,
      hydrated: true,
      restoreState: 'idle',
    });
  });

  it('loads the current access-token owner profile', async () => {
    useAuthStore.getState().setSession({
      accessToken: 'access-token',
      userInfo: {
        name: '기존 이름',
        userName: 'string',
        roleList: ['user'],
      },
    });
    getProfile.mockResolvedValueOnce(originalProfile);
    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(originalProfile);
    });

    expect(getProfile).toHaveBeenCalledWith({
      signal: expect.any(AbortSignal),
    });
  });

  it('isolates cached profiles by authenticated username across logout and login', async () => {
    const client = createTestQueryClient();
    client.setQueryDefaults(profileQueryKeys.all, { staleTime: 60_000 });
    const firstUserProfile: UserProfile = {
      username: 'user-a',
      name: '사용자 A',
      profileImage: {
        ...uploadedProfileImage,
        fileId: 'profile-a',
      },
    };
    const secondUserProfile: UserProfile = {
      username: 'user-b',
      name: '사용자 B',
      profileImage: {
        ...uploadedProfileImage,
        fileId: 'profile-b',
      },
    };
    getProfile
      .mockResolvedValueOnce(firstUserProfile)
      .mockResolvedValueOnce(secondUserProfile);
    useAuthStore.getState().setSession({
      accessToken: 'access-token-a',
      userInfo: {
        name: '사용자 A',
        userName: 'user-a',
        roleList: ['user'],
      },
    });

    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(firstUserProfile);
    });
    expect(client.getQueryData(profileQueryKeys.detail('user-a'))).toEqual(
      firstUserProfile
    );

    act(() => {
      useAuthStore.getState().clearSession();
    });

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
    });

    act(() => {
      useAuthStore.getState().setSession({
        accessToken: 'access-token-b',
        userInfo: {
          name: '사용자 B',
          userName: 'user-b',
          roleList: ['user'],
        },
      });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(secondUserProfile);
    });

    expect(getProfile).toHaveBeenCalledTimes(2);
    expect(client.getQueryData(profileQueryKeys.detail('user-b'))).toEqual(
      secondUserProfile
    );
  });

  it('verifies the current password through a dedicated mutation', async () => {
    verifyPassword.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useVerifyProfilePassword(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('current-password');
    });

    expect(verifyPassword).toHaveBeenCalledWith('current-password');
  });

  it('uploads a selected image before updating and caches the returned profile', async () => {
    const client = createTestQueryClient();
    const selectedImage = new File(['avatar'], 'avatar.png', {
      type: 'image/png',
    });
    uploadProfileImage.mockResolvedValueOnce(updatedProfile.profileImage);
    updateProfile.mockResolvedValueOnce(updatedProfile);
    grantProfileEditAccess('string');

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await result.current.mutateAsync({
        name: '새 이름',
        newPassword: '',
        profileImageFile: selectedImage,
      });
    });

    expect(uploadProfileImage).toHaveBeenCalledWith(selectedImage);
    expect(updateProfile).toHaveBeenCalledWith({
      name: '새 이름',
      newPassword: '',
      profileImageFileId: 'profile-1',
    });
    expect(uploadProfileImage.mock.invocationCallOrder[0]).toBeLessThan(
      updateProfile.mock.invocationCallOrder[0] ?? 0
    );
    expect(restoreSession).not.toHaveBeenCalled();
    expect(client.getQueryData(profileQueryKeys.detail('string'))).toEqual(
      updatedProfile
    );
    expect(hasProfileEditAccess('string')).toBe(false);
  });

  it('classifies an image upload failure without attempting the profile PUT', async () => {
    const uploadError = new Error('upload failed');
    uploadProfileImage.mockRejectedValueOnce(uploadError);
    const selectedImage = new File(['avatar'], 'avatar.png', {
      type: 'image/png',
    });
    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({ profileImageFile: selectedImage })
    ).rejects.toMatchObject({
      name: 'ProfileImageUploadError',
      cause: uploadError,
    } satisfies Partial<ProfileImageUploadError>);

    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('returns the reusable file id when the PUT fails after a successful upload', async () => {
    const updateError = new Error('update failed');
    uploadProfileImage.mockResolvedValueOnce(uploadedProfileImage);
    updateProfile.mockRejectedValueOnce(updateError);
    const selectedImage = new File(['avatar'], 'avatar.png', {
      type: 'image/png',
    });
    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({ profileImageFile: selectedImage })
    ).rejects.toMatchObject({
      name: 'ProfileUpdateWithUploadedImageError',
      profileImageFileId: uploadedProfileImage.fileId,
      cause: updateError,
    } satisfies Partial<ProfileUpdateWithUploadedImageError>);

    expect(uploadProfileImage).toHaveBeenCalledOnce();
    expect(updateProfile).toHaveBeenCalledWith({
      profileImageFileId: uploadedProfileImage.fileId,
    });
  });

  it('preserves empty fields and synchronizes the existing auth user name', async () => {
    useAuthStore.getState().setSession({
      accessToken: 'old-access-token',
      userInfo: {
        name: '기존 이름',
        userName: 'string',
        roleList: ['user'],
      },
    });
    updateProfile.mockResolvedValueOnce(updatedProfile);
    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        name: '',
        newPassword: '',
      });
    });

    expect(updateProfile).toHaveBeenCalledWith({
      name: '',
      newPassword: '',
    });
    expect(restoreSession).not.toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'old-access-token',
      userInfo: {
        name: '새 이름',
        userName: 'string',
        roleList: ['user'],
      },
    });
  });

  it('refreshes and stores the session after a nonempty password change', async () => {
    updateProfile.mockResolvedValueOnce(updatedProfile);
    restoreSession.mockResolvedValueOnce({
      accessToken: 'new-access-token',
      userInfo: {
        name: '새 이름',
        userName: 'string',
        roleList: ['user'],
      },
    });
    grantProfileEditAccess('string');
    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        newPassword: 'new-password',
      });
    });

    expect(restoreSession).toHaveBeenCalledTimes(1);
    expect(updateProfile.mock.invocationCallOrder[0]).toBeLessThan(
      restoreSession.mock.invocationCallOrder[0] ?? 0
    );
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'new-access-token',
      userInfo: {
        name: '새 이름',
        userName: 'string',
      },
    });
    expect(hasProfileEditAccess('string')).toBe(false);
  });

  it('does not publish a password-change profile image until the refreshed token is stored', async () => {
    const client = createTestQueryClient();
    client.setQueryDefaults(profileQueryKeys.all, {
      gcTime: Number.POSITIVE_INFINITY,
    });
    const refreshedSession = {
      accessToken: 'new-access-token',
      userInfo: {
        name: '새 이름',
        userName: 'string',
        roleList: ['user' as const],
      },
    };
    let resolveRestore:
      | ((session: typeof refreshedSession) => void)
      | undefined;
    const selectedImage = new File(['avatar'], 'avatar.png', {
      type: 'image/png',
    });
    client.setQueryData(profileQueryKeys.detail('string'), originalProfile);
    uploadProfileImage.mockResolvedValueOnce(uploadedProfileImage);
    updateProfile.mockResolvedValueOnce(updatedProfile);
    restoreSession.mockImplementationOnce(
      () =>
        new Promise<typeof refreshedSession>((resolve) => {
          resolveRestore = resolve;
        })
    );
    const setSessionSpy = vi.spyOn(useAuthStore.getState(), 'setSession');
    const setQueryDataSpy = vi.spyOn(client, 'setQueryData');
    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(client),
    });

    const updatePromise = result.current.mutateAsync({
      newPassword: 'new-password',
      profileImageFile: selectedImage,
    });

    await waitFor(() => {
      expect(restoreSession).toHaveBeenCalledTimes(1);
    });
    expect(setSessionSpy).not.toHaveBeenCalled();
    expect(setQueryDataSpy).not.toHaveBeenCalled();
    expect(client.getQueryData(profileQueryKeys.detail('string'))).toEqual(
      originalProfile
    );

    resolveRestore?.(refreshedSession);
    await act(async () => {
      await updatePromise;
    });

    expect(setSessionSpy).toHaveBeenCalledWith(refreshedSession);
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      profileQueryKeys.detail('string'),
      updatedProfile
    );
    expect(setSessionSpy.mock.invocationCallOrder[0]).toBeLessThan(
      setQueryDataSpy.mock.invocationCallOrder[0] ?? 0
    );
    expect(client.getQueryData(profileQueryKeys.detail('string'))).toEqual(
      updatedProfile
    );
    setSessionSpy.mockRestore();
    setQueryDataSpy.mockRestore();
  });

  it('clears every cached domain, the grant, and the session when password-change token refresh fails', async () => {
    const client = createTestQueryClient();
    useAuthStore.getState().setSession({
      accessToken: 'expired-access-token',
      userInfo: {
        name: '기존 이름',
        userName: 'string',
        roleList: ['user'],
      },
    });
    updateProfile.mockResolvedValueOnce(updatedProfile);
    const refreshError = new Error('refresh failed');
    restoreSession.mockRejectedValueOnce(refreshError);
    client.setQueryData(['trip', 'list'], [{ id: 1 }]);
    client.setQueryData(['calendar', 'month'], [{ id: 2 }]);
    client.setQueryData(profileQueryKeys.detail('string'), originalProfile);
    grantProfileEditAccess('string');
    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(client),
    });

    await expect(
      result.current.mutateAsync({ newPassword: 'new-password' })
    ).rejects.toMatchObject({
      name: 'ProfileUpdateSessionRefreshError',
      updatedProfile,
      cause: refreshError,
    } satisfies Partial<ProfileUpdateSessionRefreshError>);

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      userInfo: null,
      restoreState: 'error',
    });
    expect(client.getQueryCache().getAll()).toHaveLength(0);
    expect(hasProfileEditAccess('string')).toBe(false);
  });
});

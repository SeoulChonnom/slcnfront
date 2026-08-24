import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/domains/auth/api/auth-api';
import { useAuthStore } from '@/domains/auth/store/auth-store';
import { profileApi } from '@/domains/profile/api/profile-api';
import type {
  UpdateProfileInput,
  UpdateProfilePayload,
  UserProfile,
} from '@/domains/profile/types';
import { revokeProfileEditAccess } from '@/domains/profile/utils/profile-verification';
import { profileQueryKeys } from '@/lib/api/query-keys';

function hasNewPassword(newPassword: string | undefined) {
  return newPassword !== undefined && newPassword.length > 0;
}

export class ProfileImageUploadError extends Error {
  readonly cause: unknown;

  constructor(cause: unknown) {
    super('The profile image upload failed.');
    this.name = 'ProfileImageUploadError';
    this.cause = cause;
  }
}

export class ProfileUpdateWithUploadedImageError extends Error {
  readonly cause: unknown;
  readonly profileImageFileId: string;

  // The API has no uploaded-file deletion endpoint. Retaining the file id for
  // the next PUT avoids creating another orphan while the user retries.
  constructor(profileImageFileId: string, cause: unknown) {
    super('The profile update failed after the image upload completed.');
    this.name = 'ProfileUpdateWithUploadedImageError';
    this.profileImageFileId = profileImageFileId;
    this.cause = cause;
  }
}

export class ProfileUpdateSessionRefreshError extends Error {
  readonly cause: unknown;
  readonly updatedProfile: UserProfile;

  constructor(updatedProfile: UserProfile, cause: unknown) {
    super('The profile was updated, but the session refresh failed.');
    this.name = 'ProfileUpdateSessionRefreshError';
    this.cause = cause;
    this.updatedProfile = updatedProfile;
  }
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const username = useAuthStore((state) => state.userInfo?.userName ?? null);

  return useMutation({
    mutationKey: profileQueryKeys.update(username),
    mutationFn: async ({
      profileImageFile,
      ...profileValues
    }: UpdateProfileInput) => {
      let profileImageFileId = profileValues.profileImageFileId;

      if (profileImageFile && !profileImageFileId) {
        try {
          const uploadedImage =
            await profileApi.uploadProfileImage(profileImageFile);
          profileImageFileId = uploadedImage.fileId;
        } catch (error) {
          throw new ProfileImageUploadError(error);
        }
      }

      const payload: UpdateProfilePayload = {
        ...profileValues,
        ...(profileImageFileId === undefined ? {} : { profileImageFileId }),
      };
      let updatedProfile: UserProfile;

      try {
        updatedProfile = await profileApi.updateProfile(payload);
      } catch (error) {
        if (profileImageFileId) {
          throw new ProfileUpdateWithUploadedImageError(
            profileImageFileId,
            error
          );
        }

        throw error;
      }
      revokeProfileEditAccess();

      if (hasNewPassword(payload.newPassword)) {
        try {
          const session = await authApi.restoreSession();
          useAuthStore.getState().setSession(session);
        } catch (error) {
          queryClient.clear();
          revokeProfileEditAccess();
          useAuthStore.getState().markRestoreFailed();
          throw new ProfileUpdateSessionRefreshError(updatedProfile, error);
        }

        queryClient.setQueryData(
          profileQueryKeys.detail(updatedProfile.username),
          updatedProfile
        );
      } else {
        queryClient.setQueryData(
          profileQueryKeys.detail(updatedProfile.username),
          updatedProfile
        );

        const authState = useAuthStore.getState();

        if (authState.accessToken && authState.userInfo) {
          authState.setSession({
            accessToken: authState.accessToken,
            userInfo: {
              ...authState.userInfo,
              name: updatedProfile.name,
              userName: updatedProfile.username,
            },
          });
        }
      }

      return updatedProfile;
    },
  });
}

import {
  type ProfileFileAssetDto,
  parseProfileFileAssetResponse,
  parseUserProfileResponse,
  type UserProfileDto,
} from '@/domains/profile/api/profile-schemas';
import type {
  ProfileFileAsset,
  UpdateProfilePayload,
  UserProfile,
} from '@/domains/profile/types';
import {
  type ApiRequestOptions,
  apiClient,
  type createApiClient,
} from '@/lib/api/api-client';

type ApiClientLike = Pick<
  ReturnType<typeof createApiClient>,
  'get' | 'post' | 'put'
>;

export function createProfileApi(client: ApiClientLike = apiClient) {
  return {
    async getProfile(
      options?: Pick<ApiRequestOptions, 'signal'>
    ): Promise<UserProfile> {
      const response = await client.get<UserProfileDto>({
        path: '/users/me',
        signal: options?.signal,
      });

      return parseUserProfileResponse(response, 'get');
    },
    async verifyPassword(password: string): Promise<void> {
      await client.post<void>({
        path: '/users/me/password/verify',
        body: { password },
        responseType: 'void',
      });
    },
    async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
      const response = await client.put<UserProfileDto>({
        path: '/users/me',
        body: payload,
      });

      return parseUserProfileResponse(response, 'update');
    },
    async uploadProfileImage(file: File): Promise<ProfileFileAsset> {
      const formData = new FormData();
      formData.append('file', file);

      const response = await client.post<ProfileFileAssetDto>({
        path: '/assets/file',
        query: { type: 'profile' },
        body: formData,
      });

      return parseProfileFileAssetResponse(response);
    },
  };
}

export const profileApi = createProfileApi();

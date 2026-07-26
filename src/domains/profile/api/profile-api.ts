import {
  type ApiRequestOptions,
  apiClient,
  type createApiClient,
} from '../../../lib/api/api-client';
import type {
  ProfileFileAsset,
  UpdateProfilePayload,
  UserProfile,
} from '../types';
import {
  type ProfileFileAssetDto,
  parseProfileFileAssetResponse,
  parseUserProfileResponse,
  type UserProfileDto,
} from './profile-schemas';

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
    downloadProfileImage(asset: ProfileFileAsset): Promise<Blob> {
      return client.get<Blob>({
        path: `/assets/files/${encodeURIComponent(asset.fileId)}`,
        responseType: 'blob',
      });
    },
  };
}

export const profileApi = createProfileApi();

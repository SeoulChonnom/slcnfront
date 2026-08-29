import { describe, expect, it, vi } from 'vitest';
import { createProfileApi } from '@/domains/profile/api/profile-api';
import type { ProfileFileAsset } from '@/domains/profile/types';
import { createApiClient } from '@/lib/api/api-client';
import type { AppError } from '@/lib/api/errors';

const profileImage: ProfileFileAsset = {
  fileId: 'profile-1',
  type: 'profile',
  originalFilename: 'avatar.png',
  filename: 'avatar-stored.png',
  path: '/profile/avatar-stored.png',
  mimeType: 'image/png',
  size: 1024,
};

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('profile-api', () => {
  it('calls every profile endpoint with the expected authenticated request shape', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          username: 'string',
          name: '서울촌놈',
          profileImage,
        })
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(jsonResponse(profileImage))
      .mockResolvedValueOnce(
        jsonResponse({
          username: 'string',
          name: '새 이름',
          profileImage,
        })
      );
    const profileApi = createProfileApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
        getAccessToken: () => 'access-token',
      })
    );
    const selectedImage = new File(['avatar'], 'avatar.png', {
      type: 'image/png',
    });

    const profile = await profileApi.getProfile();
    await profileApi.verifyPassword('current-password');
    const uploadedImage = await profileApi.uploadProfileImage(selectedImage);
    const updatedProfile = await profileApi.updateProfile({
      name: '새 이름',
      newPassword: 'new-password',
      profileImageFileId: uploadedImage.fileId,
    });

    expect(profile).toEqual({
      username: 'string',
      name: '서울촌놈',
      profileImage,
    });
    expect(updatedProfile.name).toBe('새 이름');
    expect(fetchFn.mock.calls.map(([url]) => url)).toEqual([
      'http://localhost:8080/api/users/me',
      'http://localhost:8080/api/users/me/password/verify',
      'http://localhost:8080/api/assets/file?type=profile',
      'http://localhost:8080/api/users/me',
    ]);

    for (const [, init] of fetchFn.mock.calls) {
      expect(new Headers(init?.headers).get('X-AUTH-TOKEN')).toBe(
        'access-token'
      );
      expect(init?.credentials).toBe('include');
    }

    expect(fetchFn.mock.calls[1]?.[1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ password: 'current-password' }),
    });

    const uploadInit = fetchFn.mock.calls[2]?.[1];
    expect(uploadInit?.method).toBe('POST');
    expect(new Headers(uploadInit?.headers).get('content-type')).toBeNull();
    if (!(uploadInit?.body instanceof FormData)) {
      throw new Error('Expected the profile image upload body to be FormData.');
    }
    expect(uploadInit.body.get('file')).toBe(selectedImage);

    expect(fetchFn.mock.calls[3]?.[1]).toMatchObject({
      method: 'PUT',
      body: JSON.stringify({
        name: '새 이름',
        newPassword: 'new-password',
        profileImageFileId: 'profile-1',
      }),
    });
  });

  it('preserves empty strings in update requests for backend no-change semantics', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        username: 'string',
        name: '기존 이름',
        profileImage: null,
      })
    );
    const profileApi = createProfileApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
        getAccessToken: () => 'access-token',
      })
    );

    await profileApi.updateProfile({
      name: '',
      newPassword: '',
    });

    expect(fetchFn.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({ name: '', newPassword: '' })
    );
  });

  it('normalizes an omitted profileImage as null', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        username: 'string',
        name: '서울촌놈',
      })
    );
    const profileApi = createProfileApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(profileApi.getProfile()).resolves.toEqual({
      username: 'string',
      name: '서울촌놈',
      profileImage: null,
    });
  });

  it('rejects malformed profile payloads as INVALID_RESPONSE', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        username: 'string',
        name: 123,
        profileImage: null,
      })
    );
    const profileApi = createProfileApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(profileApi.getProfile()).rejects.toMatchObject({
      name: 'AppError',
      code: 'INVALID_RESPONSE',
      message: 'User profile response payload is invalid.',
    } satisfies Partial<AppError>);
  });
});

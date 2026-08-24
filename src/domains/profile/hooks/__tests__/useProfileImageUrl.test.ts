import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useProfileImageUrl } from '@/domains/profile/hooks/useProfileImageUrl';
import type { ProfileFileAsset } from '@/domains/profile/types';

const { downloadProfileImage } = vi.hoisted(() => ({
  downloadProfileImage: vi.fn(),
}));

vi.mock('@/domains/profile/api/profile-api', () => ({
  profileApi: {
    downloadProfileImage,
  },
}));

const profileImage: ProfileFileAsset = {
  fileId: 'profile-1',
  type: 'profile',
  originalFilename: 'avatar.png',
  filename: 'avatar-stored.png',
  path: '/profile/avatar-stored.png',
  mimeType: 'image/png',
  size: 1024,
};

describe('useProfileImageUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    downloadProfileImage.mockReset();
  });

  it('creates an object URL from the authenticated blob and revokes it on unmount', async () => {
    const createObjectURL = vi.fn(() => 'blob:profile-image');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    const imageBlob = new Blob(['avatar'], { type: 'image/png' });
    downloadProfileImage.mockResolvedValueOnce(imageBlob);

    const { result, unmount } = renderHook(() =>
      useProfileImageUrl(profileImage)
    );

    await waitFor(() => {
      expect(result.current.profileImageUrl).toBe('blob:profile-image');
    });

    expect(downloadProfileImage).toHaveBeenCalledWith(profileImage);
    expect(createObjectURL).toHaveBeenCalledWith(imageBlob);

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:profile-image');
  });
});

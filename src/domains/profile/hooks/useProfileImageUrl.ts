import { useMemo } from 'react';
import { profileApi } from '@/domains/profile/api/profile-api';
import type { ProfileFileAsset } from '@/domains/profile/types';
import { useAssetObjectUrls } from '@/lib/hooks/useAssetObjectUrls';

const profileImageOptions = {
  getKey: (asset: ProfileFileAsset) => asset.fileId,
  download: (asset: ProfileFileAsset) => profileApi.downloadProfileImage(asset),
};

export function useProfileImageUrl(profileImage: ProfileFileAsset | null) {
  const profileImages = useMemo(
    () => (profileImage ? [profileImage] : []),
    [profileImage]
  );
  const { objectUrls, isLoading } = useAssetObjectUrls(
    profileImages,
    profileImageOptions
  );

  return {
    profileImageUrl: profileImage
      ? (objectUrls[profileImage.fileId] ?? null)
      : null,
    isLoading,
  };
}

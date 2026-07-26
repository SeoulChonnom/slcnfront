import { useMemo } from 'react';
import { useAssetObjectUrls } from '../../../lib/hooks/useAssetObjectUrls';
import { profileApi } from '../api/profile-api';
import type { ProfileFileAsset } from '../types';

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

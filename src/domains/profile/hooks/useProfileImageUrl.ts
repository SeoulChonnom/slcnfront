import { useMemo } from 'react';
import { profileApi } from '@/domains/profile/api/profile-api';
import type { ProfileFileAsset } from '@/domains/profile/types';
import type { ImageVariant } from '@/lib/api/image-variant';
import { useAssetObjectUrls } from '@/lib/hooks/useAssetObjectUrls';

type ProfileImageRef = {
  asset: ProfileFileAsset;
  variant: ImageVariant;
};

const profileImageOptions = {
  getKey: (ref: ProfileImageRef) => ref.asset.fileId,
  download: (ref: ProfileImageRef) =>
    profileApi.downloadProfileImage(ref.asset, ref.variant),
};

export function useProfileImageUrl(
  profileImage: ProfileFileAsset | null,
  variant: ImageVariant = 'home-thumb'
) {
  const refs = useMemo<ProfileImageRef[]>(
    () => (profileImage ? [{ asset: profileImage, variant }] : []),
    [profileImage, variant]
  );
  const { objectUrls, isLoading } = useAssetObjectUrls(
    refs,
    profileImageOptions
  );

  return {
    profileImageUrl: profileImage
      ? (objectUrls[profileImage.fileId] ?? null)
      : null,
    isLoading,
  };
}

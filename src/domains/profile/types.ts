export type ProfileFileAsset = {
  fileId: string;
  type: string;
  originalFilename: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
};

export type UserProfile = {
  username: string;
  name: string;
  profileImage: ProfileFileAsset | null;
};

export type UpdateProfilePayload = {
  name?: string;
  newPassword?: string;
  profileImageFileId?: string;
};

export type UpdateProfileInput = UpdateProfilePayload & {
  profileImageFile?: File | null;
};

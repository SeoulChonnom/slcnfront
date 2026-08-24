import { z } from 'zod';
import { parseOrThrow } from '@/lib/api/errors';

const profileFileAssetSchema = z.object({
  fileId: z.string(),
  type: z.string(),
  originalFilename: z.string(),
  filename: z.string(),
  path: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

const userProfileSchema = z.object({
  username: z.string(),
  name: z.string(),
  profileImage: profileFileAssetSchema
    .nullish()
    .transform((profileImage) => profileImage ?? null),
});

export type ProfileFileAssetDto = z.infer<typeof profileFileAssetSchema>;
export type UserProfileDto = z.input<typeof userProfileSchema>;

export function parseProfileFileAssetResponse(payload: unknown) {
  return parseOrThrow(profileFileAssetSchema, payload, 'Profile file upload');
}

export function parseUserProfileResponse(
  payload: unknown,
  context: 'get' | 'update'
) {
  return parseOrThrow(
    userProfileSchema,
    payload,
    context === 'get' ? 'User profile' : 'User profile update'
  );
}

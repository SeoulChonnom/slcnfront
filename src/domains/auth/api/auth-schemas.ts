import { z } from 'zod';
import { createInvalidResponseError } from '../../../lib/api/errors';
import type { AuthSuccess } from './auth-api';

const userResponseSchema = z.object({
  accessToken: z.string(),
  username: z.string(),
  name: z.string(),
  roleList: z.array(z.string()),
});

export type UserResponseDto = z.infer<typeof userResponseSchema>;

export function parseUserResponse(
  payload: unknown,
  context: keyof AuthSuccessMap
) {
  const result = userResponseSchema.safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError(AUTH_SUCCESS_CONTEXT[context], {
      issues: result.error.issues,
      payload,
    });
  }

  return result.data;
}

const AUTH_SUCCESS_CONTEXT = {
  login: 'Login',
  restoreSession: 'Restore session',
} as const;

type AuthSuccessMap = {
  login: AuthSuccess;
  restoreSession: AuthSuccess;
};

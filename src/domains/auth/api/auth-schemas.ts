import { z } from 'zod';
import type { AuthSuccess } from '@/domains/auth/api/auth-api';
import { parseOrThrow } from '@/lib/api/errors';

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
  return parseOrThrow(
    userResponseSchema,
    payload,
    AUTH_SUCCESS_CONTEXT[context]
  );
}

const AUTH_SUCCESS_CONTEXT = {
  login: 'Login',
  restoreSession: 'Restore session',
} as const;

type AuthSuccessMap = {
  login: AuthSuccess;
  restoreSession: AuthSuccess;
};

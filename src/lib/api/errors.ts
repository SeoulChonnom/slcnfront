import type { z } from 'zod';

export type AppErrorCode = 'HTTP_ERROR' | 'NETWORK_ERROR' | 'INVALID_RESPONSE';

type AppErrorOptions = {
  code: AppErrorCode;
  message: string;
  status?: number;
  details?: unknown;
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status?: number;
  readonly details?: unknown;

  constructor({ code, message, status, details }: AppErrorOptions) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function createInvalidResponseError(context: string, details?: unknown) {
  return new AppError({
    code: 'INVALID_RESPONSE',
    message: `${context} response payload is invalid.`,
    details,
  });
}

export function parseOrThrow<T>(
  schema: z.ZodType<T>,
  payload: unknown,
  context: string
): T {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError(context, {
      issues: result.error.issues,
      payload,
    });
  }

  return result.data;
}

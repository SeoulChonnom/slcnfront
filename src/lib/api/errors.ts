import type { z } from 'zod';

export type AppErrorCode = 'HTTP_ERROR' | 'NETWORK_ERROR' | 'INVALID_RESPONSE';

/** One entry of the server error body's `errors` (field-level validation). */
export type ApiFieldError = {
  field: string;
  code: string;
  message: string;
};

type AppErrorOptions = {
  code: AppErrorCode;
  message: string;
  status?: number;
  apiCode?: string;
  fieldErrors?: ApiFieldError[];
  details?: unknown;
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status?: number;
  /** Server-side cause identifier (error body `code`), e.g. `INSPECTION_QUESTION_CONFLICT`. */
  readonly apiCode?: string;
  readonly fieldErrors: ApiFieldError[];
  readonly details?: unknown;

  constructor({
    code,
    message,
    status,
    apiCode,
    fieldErrors = [],
    details,
  }: AppErrorOptions) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.apiCode = apiCode;
    this.fieldErrors = fieldErrors;
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

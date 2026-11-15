import { getAccessToken } from '@/domains/auth/store/auth-store';
import { resolveApiBaseUrl } from '@/lib/api/base-url';
import { type ApiFieldError, AppError } from '@/lib/api/errors';
import { getAppEnv } from '@/lib/env/env';

type Primitive = string | number | boolean;
type QueryValue = Primitive | null | undefined;
type QueryParams = Record<string, QueryValue>;
type JsonBody = Record<string, unknown> | unknown[];

type ApiMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
type ResponseType = 'blob' | 'json' | 'text' | 'void';

/**
 * Reissues the access token from the refresh-token cookie. Resolves to the
 * new token, or `null` when the session cannot be renewed.
 */
type AccessTokenRefresher = () => Promise<string | null>;

type ApiClientConfig = {
  fetchFn?: typeof fetch;
  getAccessToken?: () => string | null;
  getBaseUrl?: () => string;
  refreshAccessToken?: AccessTokenRefresher;
};

/*
 * The auth domain registers its refresher at app start instead of being
 * imported here: auth-api itself is built on this client, so a direct import
 * would be a cycle.
 */
let registeredAccessTokenRefresher: AccessTokenRefresher | null = null;

export function setAccessTokenRefresher(
  refresher: AccessTokenRefresher | null
) {
  registeredAccessTokenRefresher = refresher;
}

function refreshWithRegisteredRefresher() {
  return registeredAccessTokenRefresher?.() ?? Promise.resolve(null);
}

export type ApiRequestOptions = {
  path: string;
  method?: ApiMethod;
  query?: QueryParams;
  headers?: HeadersInit;
  body?: FormData | JsonBody;
  signal?: AbortSignal;
  auth?: boolean;
  responseType?: ResponseType;
  /** Disable replay for explicitly requested external paid operations. */
  retryAfterUnauthorized?: boolean;
};

/**
 * Server error body: `{ title, status, code, errors }`. `title` is the
 * human-readable sentence and `code` the cause identifier FE branches on.
 * `message` is the legacy `{ success, message }` field, kept as a fallback.
 */
type ErrorPayload = {
  title?: unknown;
  code?: unknown;
  errors?: unknown;
  message?: unknown;
};

function readNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readFieldErrors(value: unknown): ApiFieldError[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item !== 'object' || item === null) {
      return [];
    }

    const { field, code, message } = item as Record<string, unknown>;

    return [
      {
        field: typeof field === 'string' ? field : '',
        code: typeof code === 'string' ? code : '',
        message: typeof message === 'string' ? message : '',
      },
    ];
  });
}

function buildUrl(
  path: string,
  query: QueryParams | undefined,
  baseUrl: string
) {
  const normalizedBaseUrl = resolveApiBaseUrl(baseUrl);
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(normalizedPath, normalizedBaseUrl);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined) {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

function isFormData(body: ApiRequestOptions['body']): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

async function parseError(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  const fallbackMessage = `${response.status} ${response.statusText}`;

  if (contentType.includes('application/json')) {
    const payload = (await response.json()) as ErrorPayload | null;

    return {
      message:
        readNonEmptyString(payload?.title) ??
        readNonEmptyString(payload?.message) ??
        fallbackMessage,
      apiCode: readNonEmptyString(payload?.code),
      fieldErrors: readFieldErrors(payload?.errors),
      details: payload,
    };
  }

  const message = await response.text();

  return {
    message: message || fallbackMessage,
    apiCode: undefined,
    fieldErrors: [],
    details: message || null,
  };
}

async function parseResponse<T>(
  response: Response,
  responseType: ResponseType
) {
  if (responseType === 'void' || response.status === 204) {
    return undefined as T;
  }

  if (responseType === 'blob') {
    return (await response.blob()) as T;
  }

  if (responseType === 'text') {
    return (await response.text()) as T;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return text as T;
}

function buildRequestBody(
  body: ApiRequestOptions['body'],
  headers: Headers
): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (isFormData(body)) {
    return body;
  }

  headers.set('Content-Type', 'application/json');

  return JSON.stringify(body);
}

async function toHttpError(response: Response) {
  const parsedError = await parseError(response);

  return new AppError({
    code: 'HTTP_ERROR',
    message: parsedError.message,
    status: response.status,
    apiCode: parsedError.apiCode,
    fieldErrors: parsedError.fieldErrors,
    details: parsedError.details,
  });
}

export function createApiClient(config: ApiClientConfig = {}) {
  // Resolve `fetch` per call, not once at module load: msw (tests) patches
  // `globalThis.fetch` after this module was imported.
  const fetchFn: typeof fetch =
    config.fetchFn ?? ((...args) => globalThis.fetch(...args));
  const resolveAccessToken = config.getAccessToken ?? getAccessToken;
  const getBaseUrl = config.getBaseUrl ?? (() => getAppEnv().apiUrl);
  const refreshAccessToken =
    config.refreshAccessToken ?? refreshWithRegisteredRefresher;

  async function send(
    { path, method = 'GET', query, headers, body, signal }: ApiRequestOptions,
    accessToken: string | null
  ) {
    const requestHeaders = new Headers(headers);

    if (accessToken) {
      requestHeaders.set('X-AUTH-TOKEN', accessToken);
    }

    const requestBody = buildRequestBody(body, requestHeaders);

    try {
      return await fetchFn(buildUrl(path, query, getBaseUrl()), {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal,
        credentials: 'include',
      });
    } catch (error) {
      throw new AppError({
        code: 'NETWORK_ERROR',
        message: 'The network request failed.',
        details: error,
      });
    }
  }

  /*
   * An access token that expired while the page stayed open comes back as
   * 401. Another request may already have renewed it; otherwise reissue it
   * from the refresh-token cookie. Either way the request is retried once.
   */
  async function renewAccessToken(expiredToken: string) {
    const currentToken = resolveAccessToken();

    if (!currentToken) {
      return null;
    }

    if (currentToken !== expiredToken) {
      return currentToken;
    }

    return refreshAccessToken();
  }

  async function request<T = unknown>(options: ApiRequestOptions) {
    const { auth = true, responseType = 'json' } = options;
    const accessToken = auth ? resolveAccessToken() : null;
    let response = await send(options, accessToken);

    if (
      response.status === 401 &&
      accessToken &&
      options.retryAfterUnauthorized !== false
    ) {
      const renewedToken = await renewAccessToken(accessToken);

      if (renewedToken) {
        response = await send(options, renewedToken);
      }
    }

    if (!response.ok) {
      throw await toHttpError(response);
    }

    return parseResponse<T>(response, responseType);
  }

  return {
    request,
    get: <T = unknown>(options: Omit<ApiRequestOptions, 'method'>) =>
      request<T>({ ...options, method: 'GET' }),
    post: <T = unknown>(options: Omit<ApiRequestOptions, 'method'>) =>
      request<T>({ ...options, method: 'POST' }),
    put: <T = unknown>(options: Omit<ApiRequestOptions, 'method'>) =>
      request<T>({ ...options, method: 'PUT' }),
    patch: <T = unknown>(options: Omit<ApiRequestOptions, 'method'>) =>
      request<T>({ ...options, method: 'PATCH' }),
    delete: <T = unknown>(options: Omit<ApiRequestOptions, 'method'>) =>
      request<T>({ ...options, method: 'DELETE' }),
  };
}

export const apiClient = createApiClient();

import { getAppEnv } from '../env/env';
import { getAccessToken } from '../../domains/auth/store/auth-store';
import { AppError } from './errors';

type Primitive = string | number | boolean;
type QueryValue = Primitive | null | undefined;
type QueryParams = Record<string, QueryValue>;
type JsonBody = Record<string, unknown> | unknown[];

type ApiMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
type ResponseType = 'blob' | 'json' | 'text' | 'void';

type ApiClientConfig = {
  fetchFn?: typeof fetch;
  getAccessToken?: () => string | null;
  getBaseUrl?: () => string;
};

export type ApiRequestOptions = {
  path: string;
  method?: ApiMethod;
  query?: QueryParams;
  headers?: HeadersInit;
  body?: FormData | JsonBody;
  signal?: AbortSignal;
  auth?: boolean;
  responseType?: ResponseType;
};

type ErrorPayload = {
  message?: string;
};

function buildUrl(
  path: string,
  query: QueryParams | undefined,
  baseUrl: string
) {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
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

  if (contentType.includes('application/json')) {
    const payload = (await response.json()) as ErrorPayload;

    return {
      message: payload.message ?? `${response.status} ${response.statusText}`,
      details: payload,
    };
  }

  const message = await response.text();

  return {
    message: message || `${response.status} ${response.statusText}`,
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

export function createApiClient(config: ApiClientConfig = {}) {
  const fetchFn = config.fetchFn ?? fetch;
  const resolveAccessToken = config.getAccessToken ?? getAccessToken;
  const getBaseUrl = config.getBaseUrl ?? (() => getAppEnv().apiUrl);

  async function request<T = unknown>({
    path,
    method = 'GET',
    query,
    headers,
    body,
    signal,
    auth = true,
    responseType = 'json',
  }: ApiRequestOptions) {
    const requestHeaders = new Headers(headers);
    const accessToken = auth ? resolveAccessToken() : null;

    if (accessToken) {
      requestHeaders.set('X-AUTH-TOKEN', accessToken);
    }

    let requestBody: BodyInit | undefined;

    if (body !== undefined) {
      if (isFormData(body)) {
        requestBody = body;
      } else {
        requestHeaders.set('Content-Type', 'application/json');
        requestBody = JSON.stringify(body);
      }
    }

    let response: Response;

    try {
      response = await fetchFn(buildUrl(path, query, getBaseUrl()), {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal,
      });
    } catch (error) {
      throw new AppError({
        code: 'NETWORK_ERROR',
        message: 'The network request failed.',
        details: error,
      });
    }

    if (!response.ok) {
      const parsedError = await parseError(response);

      throw new AppError({
        code: 'HTTP_ERROR',
        message: parsedError.message,
        status: response.status,
        details: parsedError.details,
      });
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

const ABSOLUTE_URL = /^[a-z][a-z0-9+.-]*:/i;

/**
 * The base URL every request path is resolved against, as an absolute URL.
 *
 * `VITE_API_URL` is relative in development (`/api`) so requests leave the app
 * same-origin and the dev server's proxy, not the browser, is what reaches the
 * backend. That keeps the session cookie a first-party one and stops the dev
 * server's port from being baked into checked-in config. `new URL(path, base)`
 * rejects a relative base, so a relative one is resolved against the current
 * origin here; an absolute base is returned unchanged, trailing slash aside.
 */
export function resolveApiBaseUrl(baseUrl: string) {
  const withTrailingSlash = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  if (ABSOLUTE_URL.test(withTrailingSlash)) {
    return withTrailingSlash;
  }

  const origin = globalThis.location?.origin;

  if (!origin) {
    throw new Error(
      `VITE_API_URL is relative ("${baseUrl}") but there is no document origin to resolve it against.`
    );
  }

  return new URL(withTrailingSlash, origin).toString();
}

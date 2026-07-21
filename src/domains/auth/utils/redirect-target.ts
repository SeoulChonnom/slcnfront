import type { DeviceType } from '../../../app/router/route-constants';
import { EXTERNAL_APP_PREFIXES } from '../../../app/router/route-constants';
import { buildDeviceRootPath } from '../../../lib/routing/route-builders';

function getDevicePrefix(device: DeviceType) {
  return device === 'mobile' ? '/mobile' : '/main';
}

function matchesPrefix(target: string, prefix: string) {
  return target === prefix || target.startsWith(`${prefix}/`);
}

function isSafePath(target: string | null): target is string {
  return !!target && target.startsWith('/') && !target.startsWith('//');
}

function isSameDeviceTarget(target: string, device: DeviceType) {
  return matchesPrefix(target, getDevicePrefix(device));
}

function getRedirectParam(search: string) {
  return new URLSearchParams(search).get('redirect');
}

export function resolvePostAuthRedirectTarget(
  search: string,
  device: DeviceType
) {
  const redirectTarget = getRedirectParam(search);

  return isSafePath(redirectTarget) &&
    isSameDeviceTarget(redirectTarget, device)
    ? redirectTarget
    : buildDeviceRootPath(device);
}

// A `redirect` target pointing at another reverse-proxied app (e.g.
// stockfront at /stock/...) isn't a route in this SPA's router, so it can't
// be handed to react-router's navigate(). Callers should hard-navigate
// (window.location) to this instead when it's non-null.
export function resolveExternalRedirectTarget(search: string) {
  const redirectTarget = getRedirectParam(search);

  if (!isSafePath(redirectTarget)) {
    return null;
  }

  const isExternal = EXTERNAL_APP_PREFIXES.some((prefix) =>
    matchesPrefix(redirectTarget, prefix)
  );

  return isExternal ? redirectTarget : null;
}

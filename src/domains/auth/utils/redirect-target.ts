import type { DeviceType } from '../../../app/router/route-constants';
import { buildDeviceRootPath } from '../../../lib/routing/route-builders';

function getDevicePrefix(device: DeviceType) {
  return device === 'mobile' ? '/mobile' : '/main';
}

function isSafeRedirectTarget(
  target: string | null,
  device: DeviceType
): target is string {
  if (!target) {
    return false;
  }

  if (!target.startsWith('/')) {
    return false;
  }

  if (target.startsWith('//')) {
    return false;
  }

  return (
    target === getDevicePrefix(device) ||
    target.startsWith(`${getDevicePrefix(device)}/`)
  );
}

export function resolvePostAuthRedirectTarget(
  search: string,
  device: DeviceType
) {
  const searchParams = new URLSearchParams(search);
  const redirectTarget = searchParams.get('redirect');

  return isSafeRedirectTarget(redirectTarget, device)
    ? redirectTarget
    : buildDeviceRootPath(device);
}

import type { DeviceType } from '../../../app/router/route-constants';
import { buildDeviceRootPath } from '../../../lib/routing/route-builders';

function isSafeRedirectTarget(target: string | null): target is string {
  if (!target) {
    return false;
  }

  if (!target.startsWith('/')) {
    return false;
  }

  if (target.startsWith('//')) {
    return false;
  }

  return true;
}

export function resolvePostAuthRedirectTarget(
  search: string,
  device: DeviceType
) {
  const searchParams = new URLSearchParams(search);
  const redirectTarget = searchParams.get('redirect');

  return isSafeRedirectTarget(redirectTarget)
    ? redirectTarget
    : buildDeviceRootPath(device);
}

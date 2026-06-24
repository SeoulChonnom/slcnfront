import { Navigate } from 'react-router-dom';
import { buildDeviceRootPath } from '../../lib/routing/route-builders';

function isMobileUserAgent() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function DeviceRedirect() {
  const device = isMobileUserAgent() ? 'mobile' : 'main';
  return <Navigate replace to={buildDeviceRootPath(device)} />;
}

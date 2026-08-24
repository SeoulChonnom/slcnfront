import { Navigate } from 'react-router-dom';
import { buildDeviceRootPath } from '@/lib/routing/route-builders';

export function ProfilePage() {
  return <Navigate replace to={buildDeviceRootPath('main')} />;
}

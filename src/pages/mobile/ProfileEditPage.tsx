import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/domains/auth/store/auth-store';
import { ProfileEditForm } from '@/domains/profile/components/ProfileEditForm';
import { ProfileEditNavigationBlocker } from '@/domains/profile/components/ProfileEditNavigationBlocker';
import {
  hasProfileEditAccess,
  revokeProfileEditAccess,
} from '@/domains/profile/utils/profile-verification';
import { buildDeviceProfileVerifyPath } from '@/lib/routing/route-builders';

export function ProfileEditPage() {
  const username = useAuthStore((state) => state.userInfo?.userName ?? '');
  const [isDirty, setIsDirty] = useState(false);
  const [verifiedUsername] = useState(() =>
    hasProfileEditAccess(username) ? username : null
  );

  useEffect(() => {
    revokeProfileEditAccess();
  }, []);

  if (!verifiedUsername || verifiedUsername !== username) {
    return <Navigate replace to={buildDeviceProfileVerifyPath('mobile')} />;
  }

  return (
    <div className='slcn-mobile-profile-flow-page'>
      <ProfileEditNavigationBlocker when={isDirty} />
      <ProfileEditForm device='mobile' onDirtyChange={setIsDirty} />
    </div>
  );
}

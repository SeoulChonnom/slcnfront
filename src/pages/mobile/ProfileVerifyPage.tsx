import { useNavigate } from 'react-router-dom';
import { ProfileIdentityVerification } from '../../domains/profile/components/ProfileIdentityVerification';
import { buildDeviceProfileEditPath } from '../../lib/routing/route-builders';

export function ProfileVerifyPage() {
  const navigate = useNavigate();

  return (
    <div className='slcn-mobile-profile-flow-page'>
      <ProfileIdentityVerification
        device='mobile'
        onContinue={() =>
          navigate(buildDeviceProfileEditPath('mobile'), { replace: true })
        }
      />
    </div>
  );
}

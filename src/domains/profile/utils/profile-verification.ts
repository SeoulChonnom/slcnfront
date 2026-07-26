const PROFILE_EDIT_VERIFICATION_KEY = 'slcn.profile-edit.verified-at';
const PROFILE_EDIT_VERIFICATION_TTL_MS = 5 * 60 * 1000;

type ProfileEditVerificationGrant = {
  username: string;
  verifiedAt: number;
};

function canUseSessionStorage() {
  return (
    typeof window !== 'undefined' &&
    typeof window.sessionStorage !== 'undefined'
  );
}

export function grantProfileEditAccess(username: string, now = Date.now()) {
  if (!canUseSessionStorage() || !username) {
    return;
  }

  const grant: ProfileEditVerificationGrant = {
    username,
    verifiedAt: now,
  };

  window.sessionStorage.setItem(
    PROFILE_EDIT_VERIFICATION_KEY,
    JSON.stringify(grant)
  );
}

export function revokeProfileEditAccess() {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(PROFILE_EDIT_VERIFICATION_KEY);
}

export function hasProfileEditAccess(username: string, now = Date.now()) {
  if (!canUseSessionStorage() || !username) {
    return false;
  }

  const rawGrant = window.sessionStorage.getItem(PROFILE_EDIT_VERIFICATION_KEY);

  if (!rawGrant) {
    return false;
  }

  let grant: ProfileEditVerificationGrant;

  try {
    grant = JSON.parse(rawGrant) as ProfileEditVerificationGrant;
  } catch {
    revokeProfileEditAccess();
    return false;
  }

  const { verifiedAt } = grant;
  const isValid =
    grant.username === username &&
    Number.isFinite(verifiedAt) &&
    verifiedAt <= now &&
    now - verifiedAt <= PROFILE_EDIT_VERIFICATION_TTL_MS;

  if (!isValid) {
    revokeProfileEditAccess();
  }

  return isValid;
}

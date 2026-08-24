import {
  grantProfileEditAccess,
  hasProfileEditAccess,
  revokeProfileEditAccess,
} from '@/domains/profile/utils/profile-verification';

describe('profile edit verification grant', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('only authorizes the username that completed verification', () => {
    grantProfileEditAccess('user-a', 1_000);

    expect(hasProfileEditAccess('user-a', 1_001)).toBe(true);
    expect(hasProfileEditAccess('user-b', 1_001)).toBe(false);
    expect(hasProfileEditAccess('user-a', 1_001)).toBe(false);
  });

  it('expires and removes stale grants', () => {
    grantProfileEditAccess('user-a', 1_000);

    expect(hasProfileEditAccess('user-a', 5 * 60 * 1_000 + 1_001)).toBe(false);
    expect(hasProfileEditAccess('user-a', 1_001)).toBe(false);
  });

  it('can be explicitly revoked', () => {
    grantProfileEditAccess('user-a', 1_000);
    revokeProfileEditAccess();

    expect(hasProfileEditAccess('user-a', 1_001)).toBe(false);
  });
});

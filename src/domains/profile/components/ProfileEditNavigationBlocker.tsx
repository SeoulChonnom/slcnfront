import { useContext, useEffect } from 'react';
import { UNSAFE_DataRouterContext, useBlocker } from 'react-router-dom';

const UNSAVED_PROFILE_CHANGES_MESSAGE =
  '저장하지 않은 변경 사항이 있어요. 돌아갈까요?';

type ProfileEditNavigationBlockerProps = {
  when: boolean;
};

function DataRouterProfileEditNavigationBlocker({
  when,
}: ProfileEditNavigationBlockerProps) {
  const blocker = useBlocker(when);

  useEffect(() => {
    if (blocker.state !== 'blocked') {
      return;
    }

    if (!when || window.confirm(UNSAVED_PROFILE_CHANGES_MESSAGE)) {
      blocker.proceed();
      return;
    }

    blocker.reset();
  }, [blocker, when]);

  return null;
}

export function ProfileEditNavigationBlocker(
  props: ProfileEditNavigationBlockerProps
) {
  const dataRouterContext = useContext(UNSAFE_DataRouterContext);

  return dataRouterContext ? (
    <DataRouterProfileEditNavigationBlocker {...props} />
  ) : null;
}

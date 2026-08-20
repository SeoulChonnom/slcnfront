import { useContext } from 'react';
import { UNSAFE_DataRouterContext, useBlocker } from 'react-router-dom';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

const UNSAVED_PROFILE_CHANGES_TITLE = '저장하지 않은 변경 사항이 있어요';
const UNSAVED_PROFILE_CHANGES_DESCRIPTION =
  '지금 나가면 수정한 내용이 사라져요. 그래도 돌아갈까요?';

type ProfileEditNavigationBlockerProps = {
  when: boolean;
};

function DataRouterProfileEditNavigationBlocker({
  when,
}: ProfileEditNavigationBlockerProps) {
  const blocker = useBlocker(when);
  const isBlocked = blocker.state === 'blocked';

  return (
    <ConfirmDialog
      isOpen={isBlocked}
      title={UNSAVED_PROFILE_CHANGES_TITLE}
      description={UNSAVED_PROFILE_CHANGES_DESCRIPTION}
      confirmLabel='나가기'
      cancelLabel='계속 수정'
      onCancel={() => {
        if (isBlocked) {
          blocker.reset();
        }
      }}
      onConfirm={() => {
        if (isBlocked) {
          blocker.proceed();
        }
      }}
    />
  );
}

export function ProfileEditNavigationBlocker(
  props: ProfileEditNavigationBlockerProps
) {
  const dataRouterContext = useContext(UNSAFE_DataRouterContext);

  return dataRouterContext ? (
    <DataRouterProfileEditNavigationBlocker {...props} />
  ) : null;
}

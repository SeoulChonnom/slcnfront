import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useAuthStore } from '@/domains/auth/store/auth-store';
import { ProfileAvatar } from '@/domains/profile/components/ProfileAvatar';
import { useProfile } from '@/domains/profile/hooks/useProfile';
import { useProfileImageUrl } from '@/domains/profile/hooks/useProfileImageUrl';
import {
  ProfileImageUploadError,
  ProfileUpdateSessionRefreshError,
  ProfileUpdateWithUploadedImageError,
  useUpdateProfile,
} from '@/domains/profile/hooks/useUpdateProfile';

type ProfileEditFormProps = {
  device: 'desktop' | 'mobile';
  onCancel?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

function StatusIcon({ success = false }: { success?: boolean }) {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true'>
      {success ? (
        <path d='M5 13l4 4L19 7' />
      ) : (
        <>
          <circle cx='12' cy='12' r='9' />
          <path d='M12 7v6M12 16.5v.5' />
        </>
      )}
    </svg>
  );
}

export function ProfileEditForm({
  device,
  onCancel,
  onDirtyChange,
}: ProfileEditFormProps) {
  const passwordErrorId = useId();
  const fileInputId = useId();
  const nameInputId = useId();
  const newPasswordInputId = useId();
  const newPasswordConfirmationInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profile = useProfile();
  const authName = useAuthStore((state) => state.userInfo?.name ?? '');
  const currentName = profile.data?.name ?? authName;
  const { profileImageUrl, isLoading: isProfileImageLoading } =
    useProfileImageUrl(profile.data?.profileImage ?? null);
  const updateMutation = useUpdateProfile();
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sessionRefreshFailure, setSessionRefreshFailure] = useState(false);
  const [fileInputVersion, setFileInputVersion] = useState(0);
  const [reusableProfileImageFileId, setReusableProfileImageFileId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!profileImageFile) {
      setPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(profileImageFile);
    setPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [profileImageFile]);

  const hasFirstPassword = newPassword.length > 0;
  const hasConfirmation = newPasswordConfirmation.length > 0;
  const incompletePassword = hasFirstPassword !== hasConfirmation;
  const passwordMismatch =
    hasFirstPassword &&
    hasConfirmation &&
    newPassword !== newPasswordConfirmation;
  const passwordError = incompletePassword
    ? '비밀번호 확인란도 함께 입력해야 해요.'
    : passwordMismatch
      ? '두 비밀번호가 일치하지 않습니다.'
      : null;
  const hasChanges =
    name.trim().length > 0 ||
    hasFirstPassword ||
    hasConfirmation ||
    Boolean(profileImageFile);
  const saveDisabled =
    !hasChanges ||
    Boolean(passwordError) ||
    updateMutation.isPending ||
    profile.isLoading;
  const sessionRefreshFailed =
    sessionRefreshFailure ||
    updateMutation.error instanceof ProfileUpdateSessionRefreshError;
  const imageUploadFailed =
    updateMutation.error instanceof ProfileImageUploadError;
  const isImageUploading =
    updateMutation.isPending &&
    Boolean(profileImageFile) &&
    !reusableProfileImageFileId;

  useEffect(() => {
    onDirtyChange?.(hasChanges);

    return () => {
      onDirtyChange?.(false);
    };
  }, [hasChanges, onDirtyChange]);

  useEffect(() => {
    if (!hasChanges) {
      return;
    }

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [hasChanges]);

  function resetDrafts() {
    setName('');
    setNewPassword('');
    setNewPasswordConfirmation('');
    setProfileImageFile(null);
    setReusableProfileImageFileId(null);
    setFileInputVersion((version) => version + 1);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function resetMutationResult() {
    setSessionRefreshFailure(false);

    if (updateMutation.isError || updateMutation.isSuccess) {
      updateMutation.reset();
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const [file] = Array.from(event.target.files ?? []);
    setProfileImageFile(file ?? null);
    setReusableProfileImageFileId(null);
    resetMutationResult();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saveDisabled) {
      return;
    }

    const trimmedName = name.trim();
    setSessionRefreshFailure(false);

    try {
      await updateMutation.mutateAsync({
        ...(trimmedName ? { name: trimmedName } : {}),
        ...(hasFirstPassword && hasConfirmation ? { newPassword } : {}),
        ...(profileImageFile && reusableProfileImageFileId
          ? { profileImageFileId: reusableProfileImageFileId }
          : profileImageFile
            ? { profileImageFile }
            : {}),
      });
      resetDrafts();
    } catch (error) {
      if (error instanceof ProfileUpdateWithUploadedImageError) {
        setReusableProfileImageFileId(error.profileImageFileId);
      }

      if (error instanceof ProfileUpdateSessionRefreshError) {
        setSessionRefreshFailure(true);
        resetDrafts();
      }
      return;
    }
  }

  return (
    <form
      className='slcn-profile-edit-form'
      data-device={device}
      onSubmit={handleSubmit}
      noValidate
    >
      {device === 'desktop' ? (
        <div className='slcn-profile-edit-form__intro'>
          <h2>사용자 정보 수정</h2>
          <p>
            변경할 항목만 입력하세요. 비워 둔 항목은 기존 값이 그대로
            유지됩니다.
          </p>
        </div>
      ) : null}

      {updateMutation.isSuccess ? (
        <div
          className='slcn-profile-result-banner slcn-profile-result-banner--success'
          role='status'
        >
          <StatusIcon success />
          <span>
            {device === 'desktop'
              ? '변경 사항이 저장되었어요. 프로필에 즉시 반영됩니다.'
              : '저장되었어요. 프로필에 즉시 반영됩니다.'}
          </span>
        </div>
      ) : null}
      {sessionRefreshFailed ? (
        <div
          className='slcn-profile-result-banner slcn-profile-result-banner--session'
          role='alert'
        >
          <StatusIcon />
          <span>
            변경 사항은 저장되었지만 세션을 갱신하지 못했어요. 다시 로그인해
            주세요.
          </span>
        </div>
      ) : null}
      {updateMutation.isError && !imageUploadFailed && !sessionRefreshFailed ? (
        <div
          className='slcn-profile-result-banner slcn-profile-result-banner--error'
          role='alert'
        >
          <StatusIcon />
          <span>
            {device === 'desktop'
              ? '저장에 실패했어요. 잠시 후 다시 시도해 주세요.'
              : '저장에 실패했어요. 다시 시도해 주세요.'}
          </span>
        </div>
      ) : null}

      <section className='slcn-profile-edit-card slcn-profile-edit-card--image'>
        {device === 'desktop' ? (
          <h3 className='slcn-profile-edit-card__title'>
            <label htmlFor={fileInputId}>프로필 이미지</label>
          </h3>
        ) : null}
        <div className='slcn-profile-image-editor'>
          <ProfileAvatar
            imageUrl={previewUrl ?? profileImageUrl}
            alt={(previewUrl ?? profileImageUrl) ? '현재 프로필 이미지' : ''}
            loading={isProfileImageLoading || isImageUploading}
            className={
              imageUploadFailed ? 'slcn-profile-avatar--error' : undefined
            }
            size={device === 'desktop' ? 76 : 66}
          />
          <div className='slcn-profile-image-editor__content'>
            {device === 'mobile' ? (
              <h3 className='slcn-profile-edit-card__title'>
                <label htmlFor={fileInputId}>프로필 이미지</label>
              </h3>
            ) : null}
            {imageUploadFailed ? (
              <>
                <p className='slcn-profile-image-editor__error'>
                  업로드에 실패했어요.
                </p>
                <button
                  type='submit'
                  className='slcn-profile-image-picker'
                  disabled={updateMutation.isPending}
                >
                  다시 시도
                </button>
              </>
            ) : isImageUploading ? (
              <>
                <p className='slcn-profile-image-editor__uploading'>
                  업로드 중…
                </p>
                <span className='slcn-profile-upload-progress'>
                  <span />
                </span>
              </>
            ) : (
              <>
                <input
                  key={fileInputVersion}
                  ref={fileInputRef}
                  id={fileInputId}
                  name='profileImage'
                  type='file'
                  accept='image/*'
                  className='slcn-profile-file-input'
                  onChange={handleImageChange}
                />
                <button
                  type='button'
                  className='slcn-profile-image-picker'
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg viewBox='0 0 24 24' aria-hidden='true'>
                    <rect x='3.5' y='4.5' width='17' height='15' rx='2.5' />
                    <circle cx='9' cy='10' r='1.7' />
                    <path d='M5.5 17l4.2-4.1 3.1 3 2.3-2.2 3.4 3.3' />
                  </svg>
                  {profileImageFile ? '이미지 다시 선택' : '프로필 이미지 선택'}
                </button>
                {device === 'desktop' ? (
                  <p className='slcn-profile-image-editor__helper'>
                    {profileImageFile
                      ? '새 이미지를 저장하면 반영됩니다.'
                      : '선택하지 않으면 기존 이미지가 유지됩니다.'}
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>

      <section className='slcn-profile-edit-card'>
        <div className='slcn-profile-edit-card__header'>
          <h3 className='slcn-profile-edit-card__title'>
            <label htmlFor={nameInputId}>이름</label>
          </h3>
          <span>
            {device === 'desktop' ? '현재 이름 · ' : '현재 · '}
            <b>{currentName}</b>
          </span>
        </div>
        <input
          id={nameInputId}
          name='name'
          className='slcn-profile-edit-input'
          autoComplete='name'
          value={name}
          placeholder={
            device === 'desktop' ? '변경할 이름을 입력하세요' : '변경할 이름'
          }
          onChange={(event) => {
            setName(event.target.value);
            resetMutationResult();
          }}
        />
        <p className='slcn-profile-edit-card__helper'>
          변경하지 않으려면 비워 두세요.
        </p>
      </section>

      <section className='slcn-profile-edit-card slcn-profile-edit-card--password'>
        <h3 className='slcn-profile-edit-card__title'>
          <label htmlFor={newPasswordInputId}>비밀번호 변경</label>
        </h3>
        {device === 'desktop' ? (
          <p className='slcn-profile-edit-card__helper slcn-profile-edit-card__helper--password'>
            변경하지 않으려면 두 칸을 모두 비워 두세요.
          </p>
        ) : null}
        <input
          id={newPasswordInputId}
          name='newPassword'
          className='slcn-profile-edit-input'
          type='password'
          autoComplete='new-password'
          value={newPassword}
          placeholder='변경할 비밀번호'
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? passwordErrorId : undefined}
          onChange={(event) => {
            setNewPassword(event.target.value);
            resetMutationResult();
          }}
        />
        <label
          className='slcn-profile-sr-only'
          htmlFor={newPasswordConfirmationInputId}
        >
          변경할 비밀번호 확인
        </label>
        <input
          id={newPasswordConfirmationInputId}
          name='newPasswordConfirmation'
          className='slcn-profile-edit-input'
          type='password'
          autoComplete='new-password'
          value={newPasswordConfirmation}
          placeholder='변경할 비밀번호 확인'
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? passwordErrorId : undefined}
          onChange={(event) => {
            setNewPasswordConfirmation(event.target.value);
            resetMutationResult();
          }}
        />
        {passwordError ? (
          <div
            id={passwordErrorId}
            className='slcn-profile-inline-error'
            role='alert'
          >
            <StatusIcon />
            <span>{passwordError}</span>
          </div>
        ) : null}
      </section>

      <div className='slcn-profile-edit-form__actions'>
        {device === 'desktop' && onCancel ? (
          <button
            type='button'
            className='slcn-profile-secondary-action'
            onClick={onCancel}
          >
            취소
          </button>
        ) : null}
        <button
          type='submit'
          className='slcn-profile-primary-action'
          disabled={saveDisabled}
        >
          {updateMutation.isPending ? (
            <span className='slcn-profile-spinner' aria-hidden='true' />
          ) : null}
          {updateMutation.isPending ? '저장 중…' : '변경 사항 저장'}
        </button>
      </div>

      {device === 'desktop' && updateMutation.isSuccess ? (
        <div className='slcn-profile-reflection'>
          <p>즉시 반영</p>
          <div>
            <ProfileAvatar
              imageUrl={previewUrl ?? profileImageUrl}
              size={38}
              alt=''
            />
            <b>{name.trim() || currentName}</b>
            <span>Header · Popover 갱신됨</span>
          </div>
        </div>
      ) : null}
    </form>
  );
}

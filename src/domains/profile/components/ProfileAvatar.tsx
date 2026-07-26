import type { CSSProperties } from 'react';
import { cn } from '../../../lib/utils/cn';

type ProfileAvatarProps = {
  imageUrl?: string | null;
  alt?: string;
  className?: string;
  size?: number;
  loading?: boolean;
};

export function ProfileAvatar({
  imageUrl,
  alt = '',
  className,
  size,
  loading = false,
}: ProfileAvatarProps) {
  const style = size
    ? ({
        '--slcn-profile-avatar-size': `${size}px`,
      } as CSSProperties)
    : undefined;

  return (
    <span
      className={cn(
        'slcn-profile-avatar',
        loading && 'slcn-profile-avatar--loading',
        className
      )}
      style={style}
      aria-busy={loading || undefined}
    >
      {imageUrl ? (
        <img
          className='slcn-profile-avatar__image'
          src={imageUrl}
          alt={alt}
          width={size ?? 42}
          height={size ?? 42}
        />
      ) : (
        <svg
          className='slcn-profile-avatar__fallback'
          viewBox='0 1 24 24'
          aria-hidden='true'
        >
          <circle cx='12' cy='9' r='3.6' />
          <path d='M5.4 20.5c0-3.7 3-6.2 6.6-6.2s6.6 2.5 6.6 6.2z' />
        </svg>
      )}
    </span>
  );
}

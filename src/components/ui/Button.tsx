import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import {
  getButtonClassName,
  type ButtonSize,
  type ButtonVariant,
} from './button-class-name';

type SharedButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
};

export type ButtonProps = PropsWithChildren<
  SharedButtonProps & ButtonHTMLAttributes<HTMLButtonElement>
>;

export type LinkButtonProps = PropsWithChildren<SharedButtonProps & LinkProps>;

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={getButtonClassName({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth}
      data-disabled={disabled || loading}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={getButtonClassName({ variant, size, fullWidth, className })}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth}
      {...props}
    >
      {children}
    </Link>
  );
}

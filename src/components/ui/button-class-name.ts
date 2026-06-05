import { cn } from '../../lib/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

type SharedButtonClassNameOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export function getButtonClassName({
  variant = 'primary',
  size = 'md',
  className,
}: SharedButtonClassNameOptions) {
  void variant;
  void size;
  return cn('slcn-button', className);
}

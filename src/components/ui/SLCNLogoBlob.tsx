import { cn } from '../../lib/utils/cn';

type SLCNLogoBlobProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function SLCNLogoBlob({ className, size = 'md' }: SLCNLogoBlobProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('slcn-logo-blob display-hand', className)}
      data-size={size}
    >
      <span>
        SL
        <br />
        CN
      </span>
    </span>
  );
}

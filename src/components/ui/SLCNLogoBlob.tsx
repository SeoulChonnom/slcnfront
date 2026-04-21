import { cn } from '../../lib/utils/cn';
import logo from '../../assets/img/SLCN.png';

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
      <img src={logo} alt="SLCN" />
    </span>
  );
}

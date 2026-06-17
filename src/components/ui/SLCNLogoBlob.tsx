import logo from '../../assets/img/SLCN.png';
import { cn } from '../../lib/utils/cn';

type SLCNLogoBlobProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function SLCNLogoBlob({ className, size = 'md' }: SLCNLogoBlobProps) {
  return (
    <span className={cn('slcn-logo-blob', className)} data-size={size}>
      <img src={logo} alt='Seoul Chonnom' />
    </span>
  );
}

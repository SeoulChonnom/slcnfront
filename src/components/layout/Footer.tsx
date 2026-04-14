import { cn } from '../../lib/utils/cn';

type FooterProps = {
  className?: string;
};

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('slcn-footer pink-mesh', className)}>
      <div className="slcn-footer__inner">
        <p className="slcn-footer__headline display-hand">
          Contact . Terms . Privacy
        </p>
        <p className="slcn-footer__caption">
          © 2026 SLCN. Hand-crafted with love in Seoul.
        </p>
      </div>
    </footer>
  );
}

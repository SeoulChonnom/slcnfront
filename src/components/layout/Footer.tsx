import { cn } from '../../lib/utils/cn';

type FooterProps = {
  className?: string;
};

const FILM_URL = 'http://naver.me/52RjLNuT';

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('slcn-footer pink-mesh', className)}>
      <div className='slcn-footer__inner'>
        <p className='slcn-footer__headline display-hand'>
          This is for Seoul Trip Records.
        </p>
        <a
          href={FILM_URL}
          target='_blank'
          rel='noreferrer'
          className='slcn-footer__link'
        >
          Choi&apos;s Film Art
          <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
          >
            <path d='M7 17L17 7M9 7h8v8' />
          </svg>
        </a>
        <p className='slcn-footer__caption'>© 2024 SLCN.</p>
      </div>
    </footer>
  );
}

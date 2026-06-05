import { Link } from 'react-router-dom';
import type { DeviceType } from '../../app/router/route-constants';
import { LinkButton } from '../../components/ui/Button';
import { getButtonClassName } from '../../components/ui/button-class-name';
import { Card } from '../../components/ui/Card';
import {
  buildDeviceCalendarMonthPath,
  buildDeviceShoesCatalogPath,
  buildDeviceTripListPath,
  buildDeviceTripRegisterPath,
} from '../../lib/routing/route-builders';
import { cn } from '../../lib/utils/cn';

type HomeHubPageProps = {
  device: DeviceType;
};

function getDecorativeDotKeys(kind: DesktopPanel['kind'], dots: number) {
  return Array.from(
    { length: dots },
    (_, dotIndex) => `${kind}-decorative-dot-${dotIndex + 1}`
  );
}

type MobileTile = {
  eyebrow: string;
  title: string;
  description: string;
  to: string;
  tone: 'default' | 'pink' | 'muted';
  dashed?: boolean;
  external?: boolean;
};

type DesktopPanel = {
  eyebrow: string;
  title: string;
  description: string;
  label: string;
  to: string;
  icon: string;
  kind: 'anniversary' | 'calendar' | 'outing' | 'shoes' | 'film' | 'new-log';
  meta?: string;
  badge?: string;
  dots?: number;
  stars?: number;
  dashed?: boolean;
  external?: boolean;
};

export function HomeHubPage({ device }: HomeHubPageProps) {
  const tripListPath = buildDeviceTripListPath(device);
  const calendarPath = buildDeviceCalendarMonthPath(device);
  const shoesPath = buildDeviceShoesCatalogPath(device);
  const tripRegisterPath = buildDeviceTripRegisterPath(device);
  const filmArtUrl = 'http://naver.me/52RjLNuT';
  const ddayDays =
    Math.floor(
      (Date.now() - new Date('2024-11-10T00:00:00+09:00').getTime()) /
        86_400_000
    ) + 1;
  const isMobile = device === 'mobile';
  const mobileTiles: MobileTile[] = [
    {
      eyebrow: '나들이',
      title: 'map',
      description: '서울 촌놈 나들이 기록 📷',
      to: tripListPath,
      tone: 'default' as const,
    },
    {
      eyebrow: '일정',
      title: 'calendar',
      description: '서울촌놈 나들이 일정 🗓️',
      to: calendarPath,
      tone: 'pink' as const,
    },
    {
      eyebrow: '신발',
      title: 'recom',
      description: '서울 촌놈의 신발 추천 👟',
      to: shoesPath,
      tone: 'default' as const,
    },
  ];
  const desktopPanels: DesktopPanel[] = [
    {
      eyebrow: 'D-day',
      title: '만난지',
      description: `${ddayDays} 일째`,
      label: '만난지',
      to: tripListPath,
      icon: '♥',
      kind: 'anniversary',
    },
    {
      eyebrow: 'Calendar',
      title: 'calendar',
      description: '서울촌놈 나들이 일정 🗓️',
      label: 'calendar',
      to: calendarPath,
      icon: '◫',
      kind: 'calendar',
    },
    {
      eyebrow: 'Map',
      title: 'map',
      description: '서울 촌놈 나들이 기록 📷',
      label: 'map',
      to: tripListPath,
      icon: '◉',
      kind: 'outing',
    },
    {
      eyebrow: 'Shoes',
      title: 'recom',
      description: '서울 촌놈의 신발 추천~👟',
      label: 'recom',
      to: shoesPath,
      icon: '♞',
      kind: 'shoes',
    },
    {
      eyebrow: 'Film',
      title: "Choi's Film Art~🎞",
      description: '',
      label: "Choi's Film Art~🎞",
      to: filmArtUrl,
      icon: '▣',
      kind: 'film',
      external: true,
    },
    {
      eyebrow: 'Trip',
      title: '새 나들이 기록하기',
      description: '서울 촌놈 나들이는 계속 될 예정....🥳',
      label: '새 나들이 기록하기',
      to: tripRegisterPath,
      icon: '+',
      kind: 'new-log',
      dashed: true,
    },
  ];

  if (!isMobile) {
    return (
      <section className='slcn-home-hub slcn-home-hub--desktop'>
        <span
          className='slcn-home-hub__decor slcn-home-hub__decor--top-left'
          aria-hidden='true'
        >
          ◎
        </span>
        <span
          className='slcn-home-hub__decor slcn-home-hub__decor--top-right'
          aria-hidden='true'
        >
          ●
        </span>
        <span
          className='slcn-home-hub__decor slcn-home-hub__decor--bottom-right'
          aria-hidden='true'
        >
          ∿
        </span>

        <header className='slcn-home-hub__desktop-intro'>
          <div className='slcn-home-hub__desktop-mark'>
            <span
              className='slcn-home-hub__desktop-mini-logo display-hand'
              aria-hidden='true'
            >
              SL
              <br />
              CN
            </span>

            <div className='slcn-home-hub__desktop-logo-wrap'>
              <div
                className='slcn-home-hub__desktop-orb slcn-home-hub__desktop-orb--top'
                aria-hidden='true'
              />
              <div
                className='slcn-home-hub__desktop-orb slcn-home-hub__desktop-orb--left'
                aria-hidden='true'
              />
              <div
                className='slcn-home-hub__desktop-logo display-hand'
                aria-hidden='true'
              >
                <span>
                  SL
                  <br />
                  CN
                </span>
              </div>
            </div>
          </div>

          <p className='slcn-home-hub__desktop-caption display-hand'>
            © Seoul Chonnom.
          </p>
          <p className='slcn-home-hub__desktop-subtitle'>
            서울 촌놈 나들이 기록 📷
          </p>
        </header>

        <div className='slcn-home-hub__desktop-grid'>
          {desktopPanels.map((panel) => {
            const surfaceClassName = cn(
              'slcn-home-hub__desktop-panel',
              `slcn-home-hub__desktop-panel--${panel.kind}`,
              panel.dashed && 'slcn-home-hub__desktop-panel--dashed'
            );
            const cardBody = (
              <>
                <div className={surfaceClassName}>
                  <span
                    className='slcn-home-hub__desktop-panel-icon display-hand'
                    aria-hidden='true'
                  >
                    {panel.icon}
                  </span>
                  <p className='slcn-home-hub__desktop-panel-eyebrow'>
                    {panel.eyebrow}
                  </p>
                  <h2 className='slcn-home-hub__desktop-panel-title display-hand'>
                    {panel.title}
                  </h2>
                  <p className='slcn-home-hub__desktop-panel-description'>
                    {panel.description}
                  </p>
                  {panel.meta ? (
                    <span className='slcn-home-hub__desktop-panel-meta'>
                      {panel.meta}
                    </span>
                  ) : null}
                  {panel.badge ? (
                    <span className='slcn-home-hub__desktop-panel-badge'>
                      {panel.badge}
                    </span>
                  ) : null}
                  {panel.dots ? (
                    <span
                      className='slcn-home-hub__desktop-panel-dots'
                      aria-hidden='true'
                    >
                      {getDecorativeDotKeys(panel.kind, panel.dots).map(
                        (dotKey) => (
                          <span key={dotKey} />
                        )
                      )}
                    </span>
                  ) : null}
                  {panel.stars ? (
                    <span
                      className='slcn-home-hub__desktop-panel-stars'
                      aria-hidden='true'
                    >
                      {'★'.repeat(panel.stars - 1)}
                      {'✦'}
                    </span>
                  ) : null}
                </div>

                <span className='slcn-home-hub__desktop-panel-label display-hand'>
                  {panel.label}
                </span>
              </>
            );

            return panel.external ? (
              <a
                key={panel.title}
                href={panel.to}
                target='_blank'
                rel='noreferrer'
                className='slcn-home-hub__desktop-link'
              >
                {cardBody}
              </a>
            ) : (
              <Link
                key={panel.title}
                to={panel.to}
                className='slcn-home-hub__desktop-link'
              >
                {cardBody}
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className='slcn-home-hub'>
      <Card
        className='slcn-home-hub__hero'
        tone='pink'
        blob={!isMobile}
        data-device={device}
      >
        <div className='slcn-home-hub__hero-copy'>
          <p className='slcn-home-hub__eyebrow'>
            {isMobile ? 'SLCN Mobile' : 'Seoul Chonnom'}
          </p>
          <h1 className='slcn-home-hub__title display-hand'>
            {isMobile ? '서울 촌놈 나들이 기록 📷' : '서울 촌놈 나들이 기록'}
          </h1>
          <p className='slcn-home-hub__description'>
            {isMobile
              ? '서울 촌놈 나들이는 계속 될 예정....🥳'
              : '대시보드에서 일정, 나들이, 신발 추천, 필름 기록을 한 번에 이어봅니다.'}
          </p>
        </div>
        <div className='slcn-home-hub__hero-stats'>
          <div className='slcn-home-hub__stat'>
            <span className='slcn-home-hub__stat-label'>만난지</span>
            <strong className='slcn-home-hub__stat-value display-hand'>
              {ddayDays}
            </strong>
          </div>
          <div className='slcn-home-hub__stat'>
            <span className='slcn-home-hub__stat-label'>Film</span>
            <strong className='slcn-home-hub__stat-value display-hand'>
              Art~🎞
            </strong>
          </div>
        </div>
        {isMobile ? (
          <div className='slcn-home-hub__hero-actions'>
            <a
              href={filmArtUrl}
              target='_blank'
              rel='noreferrer'
              className={cn(
                getButtonClassName({ variant: 'secondary', size: 'md' })
              )}
            >
              Choi&apos;s Film Art~🎞
            </a>
          </div>
        ) : null}
      </Card>

      <div className='slcn-home-hub__grid'>
        {mobileTiles.map((tile) => (
          <Card
            key={tile.title}
            className='slcn-home-hub__tile'
            tone={tile.tone}
            data-dashed={tile.dashed}
          >
            <p className='slcn-home-hub__tile-eyebrow'>{tile.eyebrow}</p>
            <h2 className='slcn-home-hub__tile-title display-hand'>
              {tile.title}
            </h2>
            <p className='slcn-home-hub__tile-description'>
              {tile.description}
            </p>
            <div className='slcn-home-hub__tile-actions'>
              {tile.external ? (
                <a
                  href={tile.to}
                  target='_blank'
                  rel='noreferrer'
                  className={cn(
                    getButtonClassName({ variant: 'secondary', size: 'md' })
                  )}
                >
                  열기
                </a>
              ) : (
                <LinkButton to={tile.to}>
                  {isMobile ? '바로 이동' : 'Open'}
                </LinkButton>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

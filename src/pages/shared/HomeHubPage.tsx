import type { DeviceType } from '../../app/router/route-constants';
import { LinkButton } from '../../components/ui/Button';
import { getButtonClassName } from '../../components/ui/button-class-name';
import { Card } from '../../components/ui/Card';
import {
  buildDeviceCalendarMonthPath,
  buildDeviceShoesCatalogPath,
  buildDeviceTripListPath,
} from '../../lib/routing/route-builders';
import { cn } from '../../lib/utils/cn';

type HomeHubPageProps = {
  device: DeviceType;
};

export function HomeHubPage({ device }: HomeHubPageProps) {
  const tiles = [
    {
      eyebrow: 'Trip',
      title: '나들이 기록',
      description:
        '퀴즈를 풀고 경로 지도를 확인하고, 관리자 권한이면 새 기록까지 등록합니다.',
      to: buildDeviceTripListPath(device),
      tone: 'pink' as const,
    },
    {
      eyebrow: 'Calendar',
      title: '일정 관리',
      description:
        '월간과 주간 화면을 넘기며 일정을 생성, 수정, 삭제할 수 있습니다.',
      to: buildDeviceCalendarMonthPath(device),
      tone: 'default' as const,
    },
    {
      eyebrow: 'Shoes',
      title: '신발 추천',
      description:
        '브랜드별 카탈로그와 상세 리뷰 카드, 영상 레퍼런스를 확인합니다.',
      to: buildDeviceShoesCatalogPath(device),
      tone: 'default' as const,
    },
  ];

  return (
    <section className="slcn-home-hub">
      <Card className="slcn-home-hub__hero" tone="pink" blob>
        <p className="slcn-home-hub__eyebrow">Seoul Chonnom System</p>
        <h1 className="slcn-home-hub__title display-hand">
          서울 촌놈 서비스 허브
        </h1>
        <p className="slcn-home-hub__description">
          기존 Vue 기능을 React/Vite 구조로 옮긴 현재 진입점입니다. 나들이, 일정,
          신발 추천을 동일한 shell과 routing 계약 안에서 이동할 수 있습니다.
        </p>
      </Card>

      <div className="slcn-home-hub__grid">
        {tiles.map((tile) => (
          <Card
            key={tile.title}
            className="slcn-home-hub__tile"
            tone={tile.tone}
          >
            <p className="slcn-home-hub__tile-eyebrow">{tile.eyebrow}</p>
            <h2 className="slcn-home-hub__tile-title display-hand">
              {tile.title}
            </h2>
            <p className="slcn-home-hub__tile-description">
              {tile.description}
            </p>
            <div className="slcn-home-hub__tile-actions">
              <LinkButton to={tile.to}>바로 이동</LinkButton>
            </div>
          </Card>
        ))}

        <Card className="slcn-home-hub__tile" tone="muted">
          <p className="slcn-home-hub__tile-eyebrow">Film</p>
          <h2 className="slcn-home-hub__tile-title display-hand">
            외부 필름 링크
          </h2>
          <p className="slcn-home-hub__tile-description">
            기존 메인 화면의 외부 필름 진입점을 유지하기 위해 외부 링크를 별도 카드로
            둡니다.
          </p>
          <div className="slcn-home-hub__tile-actions">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              className={cn(
                getButtonClassName({ variant: 'secondary', size: 'md' }),
              )}
            >
              인스타그램 열기
            </a>
          </div>
        </Card>
      </div>
    </section>
  );
}

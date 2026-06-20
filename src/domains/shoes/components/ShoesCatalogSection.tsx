import type { DeviceType } from '../../../app/router/route-constants';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useShoeCatalog } from '../hooks/useShoeCatalog';
import { ShoeBrandSection } from './ShoeBrandSection';

type ShoesCatalogSectionProps = {
  device: DeviceType;
};

export function ShoesCatalogSection({ device }: ShoesCatalogSectionProps) {
  const catalog = useShoeCatalog();
  const showIntro = true;

  return (
    <section className='slcn-shoes-catalog-page'>
      {showIntro ? (
        <Card className='slcn-shoes-catalog-page__intro' tone='pink' blob>
          <p className='slcn-shoes-catalog-page__eyebrow'>SLCN Shoes</p>
          <h1 className='slcn-shoes-catalog-page__title'>
            서울 촌놈's 신발 추천
          </h1>
          <p className='slcn-shoes-catalog-page__description'>
            오래 걸어도 편한 신발들만 골랐어요. 클릭하면 상세 정보를 볼 수
            있어요.
          </p>
        </Card>
      ) : null}

      {catalog.length ? (
        <nav
          className='slcn-shoes-catalog-page__brand-nav'
          aria-label='브랜드 이동'
        >
          <a
            href='#'
            className='slcn-shoes-catalog-page__brand-link slcn-shoes-catalog-page__brand-link--active'
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            전체
          </a>
          {catalog.map((brand) => (
            <a
              key={brand.brandId}
              href={`#brand-${brand.brandId}`}
              className='slcn-shoes-catalog-page__brand-link'
            >
              {brand.name}
            </a>
          ))}
        </nav>
      ) : null}

      {!catalog.length ? (
        <EmptyState
          title='추천할 신발이 아직 없어요.'
          description='신발 추천 목록이 준비되면 여기에서 바로 확인할 수 있어요.'
        />
      ) : null}

      {catalog.map((brand) => (
        <ShoeBrandSection key={brand.brandId} device={device} brand={brand} />
      ))}

      {showIntro ? (
        <div className='slcn-shoes-catalog-page__warning'>
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#F2A93B'
            strokeWidth='2'
            className='slcn-shoes-catalog-page__warning-icon'
            aria-hidden='true'
          >
            <path d='M12 9v4M12 16.5v.5' />
            <path d='M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z' />
          </svg>
          <p className='slcn-shoes-catalog-page__warning-text'>
            모든 신발 가격은 정가 기준이에요. 더 저렴한 다른 사이트에서 구매하는
            것을 추천해요. 단, 가품이 많으니 유의해서 구매해 주세요!
          </p>
        </div>
      ) : null}
    </section>
  );
}

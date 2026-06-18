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
  const showIntro = device === 'main';

  return (
    <section className='slcn-shoes-catalog-page'>
      {showIntro ? (
        <Card className='slcn-shoes-catalog-page__intro' tone='pink' blob>
          <p className='slcn-shoes-catalog-page__eyebrow'>SLCN Shoes</p>
          <h1 className='slcn-shoes-catalog-page__title display-hand'>
            서울 촌놈's 신발 추천 👟
          </h1>
          <p className='slcn-shoes-catalog-page__description'>
            오래 걸어도 편한 신발들만 골랐습니다~ 🎶
            <br />
            서울 촌놈 취향 200% 첨가되어있으니 유의~ 😏
            <br />
            클릭하면 더욱 상세한 정보를 확인 가능~!
          </p>
        </Card>
      ) : null}

      {catalog.length ? (
        <nav
          className='slcn-shoes-catalog-page__brand-nav'
          aria-label='브랜드 이동'
        >
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
        <Card className='slcn-shoes-catalog-page__warning' tone='muted'>
          전체 신발 가격은 정가를 기준으로 작성하였습니다..
          <br />
          더욱 저렴한 가격은 다른 사이트에서 구매하시는 것을 추천드립니다~
          <br />
          단. 가품이 많아 유의해서 구매 필수!
        </Card>
      ) : null}
    </section>
  );
}

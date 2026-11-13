import type { AreaBucket, ComplexDetail } from '@/domains/house/types';
import { formatEok } from '@/domains/house/utils/format-eok';

export function ComplexInfoCard({
  complex,
  area,
  added,
  onClose,
  onAdd,
}: {
  complex: ComplexDetail;
  area: AreaBucket;
  added: boolean;
  onClose: () => void;
  onAdd: () => void;
}) {
  const price = complex.recentPrice;
  return (
    <section
      className='house-info-card'
      aria-label={`${complex.name} 단지 정보`}
    >
      <div className='house-info-card__head'>
        <div>
          <h3>{complex.name}</h3>
          <p className='house-fine'>
            {complex.districtName} {complex.umdName} ·{' '}
            {area === 'B59' ? '59' : '84'}㎡
          </p>
        </div>
        <button
          className='house-info-card__close'
          type='button'
          onClick={onClose}
          aria-label='정보 카드 닫기'
        >
          ×
        </button>
      </div>
      <div className='house-info-card__price'>
        {price ? formatEok(price.priceManwon) : '최근 6개월 거래 없음'}
      </div>
      {price && (
        <p className='house-fine'>
          최근 {price.windowMonths}개월 · {price.sample}건{' '}
          {price.sample < 3 && <span className='house-tag'>표본 적음</span>}
        </p>
      )}
      <dl className='house-info-card__facts'>
        <div>
          <dt>연식</dt>
          <dd>
            {complex.buildYear === null
              ? '정보 없음'
              : `${complex.buildYear}년 · ${new Date().getFullYear() - complex.buildYear}년차`}
          </dd>
        </div>
        <div>
          <dt>세대수</dt>
          <dd>
            {complex.households === null
              ? '정보 없음'
              : `${complex.households.toLocaleString('ko-KR')}세대`}
          </dd>
        </div>
      </dl>
      <button
        type='button'
        className='house-button'
        onClick={onAdd}
        disabled={added}
        aria-pressed={added}
      >
        {added ? '비교함에 담겼어요' : '비교 담기'}
      </button>
    </section>
  );
}

import { Link } from 'react-router-dom';
import type { DeviceType } from '../../../app/router/route-constants';
import { Card } from '../../../components/ui/Card';
import { buildDeviceShoeDetailPath } from '../../../lib/routing/route-builders';
import type { ShoeBrand, ShoeItem } from '../types';

type ShoeCardProps = {
  device: DeviceType;
  brand: ShoeBrand;
  shoe: ShoeItem;
};

export function ShoeCard({ device, brand, shoe }: ShoeCardProps) {
  return (
    <Link
      className='slcn-shoe-card-link'
      to={buildDeviceShoeDetailPath(device, brand.brandId, shoe.shoesId)}
      aria-label={`${shoe.name} 상세 보기`}
    >
      <Card className='slcn-shoe-card' tone='default'>
        <div className='slcn-shoe-card__media'>
          <img
            src={shoe.imageUrl}
            alt={shoe.name}
            className='slcn-shoe-card__image'
          />
        </div>
        <div className='slcn-shoe-card__body'>
          <p className='slcn-shoe-card__brand'>{brand.name}</p>
          <h3 className='slcn-shoe-card__name display-hand'>{shoe.name}</h3>
          <p className='slcn-shoe-card__desc'>{shoe.desc}</p>
        </div>
        <div className='slcn-shoe-card__footer'>
          <span className='slcn-shoe-card__price'>{shoe.price}</span>
          <span className='slcn-shoe-card__cta'>
            상세 보기
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
              <path d='M9 18l6-6-6-6' />
            </svg>
          </span>
        </div>
      </Card>
    </Link>
  );
}

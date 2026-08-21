import type { DeviceType } from '../../../app/router/route-constants';
import type { ShoeBrand } from '../types';
import { ShoeCard } from './ShoeCard';

type ShoeBrandSectionProps = {
  device: DeviceType;
  brand: ShoeBrand;
};

export function ShoeBrandSection({ device, brand }: ShoeBrandSectionProps) {
  return (
    <section className='slcn-shoes-brand-section' id={`brand-${brand.brandId}`}>
      <div className='slcn-shoes-brand-section__header'>
        <div className='slcn-shoes-brand-section__badge'>
          <img
            src={brand.imageUrl}
            alt={brand.name}
            className='slcn-shoes-brand-section__badge-image'
            loading='lazy'
            decoding='async'
          />
        </div>
        <div className='slcn-shoes-brand-section__copy'>
          <h2 className='slcn-shoes-brand-section__title display-type'>
            {brand.name}
          </h2>
          <p className='slcn-shoes-brand-section__description'>{brand.desc}</p>
        </div>
      </div>
      <div className='slcn-shoes-brand-section__grid'>
        {brand.shoes.map((shoe) => (
          <ShoeCard
            key={shoe.shoesId}
            brand={brand}
            device={device}
            shoe={shoe}
          />
        ))}
      </div>
    </section>
  );
}

import type { DeviceType } from '../../../app/router/route-constants';
import type { ShoeBrand } from '../types';
import { ShoeCard } from './ShoeCard';

type ShoeBrandSectionProps = {
  device: DeviceType;
  brand: ShoeBrand;
};

export function ShoeBrandSection({ device, brand }: ShoeBrandSectionProps) {
  return (
    <section className="slcn-shoes-brand-section" id={`brand-${brand.brandId}`}>
      <div className="slcn-shoes-brand-section__header">
        <div className="slcn-shoes-brand-section__badge">
          <img
            src={brand.imageUrl}
            alt={brand.name}
            className="slcn-shoes-brand-section__badge-image"
          />
        </div>
        <div className="slcn-shoes-brand-section__copy">
          <p className="slcn-shoes-brand-section__eyebrow">Walking Brand</p>
          <h2 className="slcn-shoes-brand-section__title display-hand">
            {brand.name}
          </h2>
          <p className="slcn-shoes-brand-section__description">{brand.desc}</p>
        </div>
      </div>
      <div className="slcn-shoes-brand-section__grid">
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

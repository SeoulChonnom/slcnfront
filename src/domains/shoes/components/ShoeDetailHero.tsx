import { Card } from '@/components/ui/Card';
import type { ShoeBrand, ShoeItem } from '@/domains/shoes/types';

type ShoeDetailHeroProps = {
  brand: ShoeBrand;
  shoe: ShoeItem;
};

export function ShoeDetailHero({ brand, shoe }: ShoeDetailHeroProps) {
  return (
    <section className='slcn-shoe-detail-hero'>
      <Card className='slcn-shoe-detail-hero__media' tone='pink' blob>
        {/* The page's largest paint. Everything else on this route is either
            lazy or already in memory, so this is the one image worth telling
            the browser to fetch first. */}
        <img
          src={shoe.imageUrl}
          alt={shoe.name}
          className='slcn-shoe-detail-hero__image'
          fetchPriority='high'
          decoding='async'
        />
      </Card>
      <Card className='slcn-shoe-detail-hero__summary'>
        <p className='slcn-shoe-detail-hero__eyebrow'>{brand.name}</p>
        <h1 className='slcn-shoe-detail-hero__title display-type'>
          {shoe.name}
        </h1>
        <p className='slcn-shoe-detail-hero__desc'>{shoe.desc}</p>
        <p className='slcn-shoe-detail-hero__price'>{shoe.price}</p>
        <ul className='slcn-shoe-detail-hero__facts'>
          {shoe.info.map((item) => (
            <li key={item} className='slcn-shoe-detail-hero__fact'>
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

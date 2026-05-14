import { useParams } from 'react-router-dom';
import { ShoeDetailSection } from '../../domains/shoes/components/ShoeDetailSection';

export function ShoeDetailPage() {
  const { brand, shoesName } = useParams();

  return (
    <ShoeDetailSection device='main' brandSlug={brand} shoesSlug={shoesName} />
  );
}

import { useParams } from 'react-router-dom';
import { TravelRegisterSection } from '../../domains/travel/components/TravelRegisterSection';

export function TravelEditPage() {
  const params = useParams<{ id: string }>();

  return (
    <TravelRegisterSection device='main' mode='edit' travelId={params.id} />
  );
}

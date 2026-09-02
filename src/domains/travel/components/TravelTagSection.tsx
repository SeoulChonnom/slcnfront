import type { TravelTag } from '@/domains/travel/types';

type TravelTagSectionProps = {
  tags: TravelTag[];
};

export function TravelTagSection({ tags }: TravelTagSectionProps) {
  if (tags.length === 0) {
    return (
      <p className='slcn-travel-detail__empty'>
        아직 태그가 없어요. 여행 수정에서 붙일 수 있어요.
      </p>
    );
  }

  return (
    <div className='slcn-travel-tags'>
      <ul className='slcn-travel-tags__list'>
        {tags.map((tag) => (
          <li key={tag.name} className='slcn-travel-tags__chip'>
            #{tag.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

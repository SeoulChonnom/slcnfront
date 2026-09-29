import {
  DownIcon,
  UpIcon,
} from '@/domains/inspection/components/area-detail/icons';
import type { QuestionCategoryGroup } from '@/domains/inspection/utils/question-categories';

type CategoryOrderListProps = {
  groups: QuestionCategoryGroup[];
  onMove: (index: number, direction: -1 | 1) => void;
};

/**
 * api.md §9 `PUT .../order` — categories are few, so the order mode drops
 * the question rows and shows only the category names with move buttons.
 * The order set here is the order sections appear on every property's
 * 문답 screen, which is why the position is spelled out on each row.
 */
export function CategoryOrderList({ groups, onMove }: CategoryOrderListProps) {
  return (
    <ol className='slcn-inspection-qcat-order'>
      {groups.map(({ category, questions }, index) => (
        <li
          key={category.categoryId}
          className='slcn-inspection-qcat-order__row'
        >
          <span className='slcn-inspection-qcat-order__pos slcn-num'>
            {index + 1}
          </span>
          <span className='slcn-inspection-qcat-order__name'>
            {category.name}
          </span>
          <span className='slcn-inspection-qcat-order__count'>
            질문 {questions.length}
          </span>
          <span className='slcn-inspection-qcat-order__moves'>
            <button
              type='button'
              className='slcn-inspection-qcat-order__move'
              aria-label={`${category.name} 위로 이동`}
              onClick={() => onMove(index, -1)}
              disabled={index === 0}
            >
              <UpIcon />
            </button>
            <button
              type='button'
              className='slcn-inspection-qcat-order__move'
              aria-label={`${category.name} 아래로 이동`}
              onClick={() => onMove(index, 1)}
              disabled={index === groups.length - 1}
            >
              <DownIcon />
            </button>
          </span>
        </li>
      ))}
    </ol>
  );
}

import { useCallback } from 'react';
import type { AreaBucket, CompareItem } from '../types';

export function useCompareTray(
  items: CompareItem[],
  onItemsChange: (items: CompareItem[]) => void,
  onNotify: (message: string) => void
) {
  return useCallback(
    (complexId: string, area: AreaBucket) => {
      if (
        items.some((item) => item.complexId === complexId && item.area === area)
      ) {
        onNotify('이미 비교함에 있어요');
        return;
      }
      if (items.length >= 3) {
        onNotify('최대 3개까지 비교할 수 있어요');
        return;
      }
      onItemsChange([...items, { complexId, area }]);
      onNotify('비교함에 담았어요');
    },
    [items, onItemsChange, onNotify]
  );
}

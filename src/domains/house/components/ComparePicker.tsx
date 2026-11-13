import { useId, useState } from 'react';
import { useComplexSearch } from '@/domains/house/hooks/useComplexSearch';

export function ComparePicker({
  onSelect,
}: {
  onSelect: (complexId: string) => void;
}) {
  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const query = useComplexSearch(keyword);
  const results = keyword.trim().length >= 2 ? (query.data?.items ?? []) : [];
  const expanded = open && keyword.trim().length >= 2;

  function select(complexId: string) {
    onSelect(complexId);
    setKeyword('');
    setOpen(false);
    setActiveIndex(-1);
  }

  return (
    <search
      className='house-picker'
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label className='slcn-visually-hidden' htmlFor={`${listId}-input`}>
        비교할 단지 검색
      </label>
      <input
        id={`${listId}-input`}
        type='search'
        role='combobox'
        aria-autocomplete='list'
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={
          expanded && activeIndex >= 0 && results[activeIndex]
            ? `${listId}-${activeIndex}`
            : undefined
        }
        placeholder='단지명 2글자 이상'
        value={keyword}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setKeyword(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            return;
          }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) =>
              results.length === 0
                ? -1
                : (current +
                    (event.key === 'ArrowDown' ? 1 : -1) +
                    results.length) %
                  results.length
            );
          }
          if (event.key === 'Enter' && expanded && results[activeIndex]) {
            event.preventDefault();
            select(results[activeIndex].complexId);
          }
        }}
      />
      {expanded ? (
        <div className='house-picker__results'>
          <div id={listId} role='listbox' aria-label='단지 검색 결과'>
            {results.map((item, index) => (
              <div key={item.complexId} role='presentation'>
                <button
                  type='button'
                  role='option'
                  id={`${listId}-${index}`}
                  aria-selected={activeIndex === index}
                  onClick={() => select(item.complexId)}
                >
                  <strong>{item.name}</strong>
                  <span>
                    {item.districtName} {item.umdName}
                    {item.buildYear === null ? '' : ` · ${item.buildYear}년`}
                  </span>
                </button>
              </div>
            ))}
          </div>
          {query.isError ? (
            <p role='alert'>
              단지 검색을 불러오지 못했어요.{' '}
              <button
                className='house-button'
                type='button'
                onClick={() => void query.refetch()}
              >
                다시 시도
              </button>
            </p>
          ) : query.isPending || query.isFetching ? (
            <p role='status'>단지를 찾고 있어요.</p>
          ) : results.length === 0 ? (
            <p role='status'>검색한 단지가 없어요.</p>
          ) : null}
          {results.length >= 10 ? (
            <p className='house-fine'>더 입력해 좁혀 보세요.</p>
          ) : null}
        </div>
      ) : null}
    </search>
  );
}

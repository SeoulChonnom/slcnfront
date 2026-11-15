import { forwardRef, useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import type { AddressCandidate } from '@/domains/geo/api/geo-schemas';
import {
  ADDRESS_SEARCH_MIN_LENGTH,
  useAddressSearch,
} from '@/domains/geo/hooks/useAddressSearch';
import {
  ADDRESS_UNAVAILABLE_MESSAGE,
  classifyLocationError,
} from '@/domains/geo/utils/location-error';

type AddressSearchValue = {
  bdMgtSn: string;
  roadAddress: string | null;
};

type AddressSearchFieldProps = {
  label?: string;
  /** The currently chosen address, or `null` when none. */
  value: AddressSearchValue | null;
  onSelect: (candidate: AddressCandidate) => void;
  /** "위치 지우기" — only offered while a value is set. */
  onClear: () => void;
  disabled?: boolean;
  /** Message owned by the parent (e.g. "주소는 저장하지 못했습니다 …"). */
  error?: string;
};

function candidateAddress(candidate: AddressCandidate) {
  return candidate.roadAddress ?? candidate.jibunAddress ?? '';
}

/**
 * Address search combobox (api.md §8-2). Typing queries `GET /geo/addresses`
 * (debounced); picking a candidate hands the whole candidate — including its
 * `coordKey` — to `onSelect`. A 503 from the lookup disables the field.
 */
export const AddressSearchField = forwardRef<
  HTMLInputElement,
  AddressSearchFieldProps
>(function AddressSearchField(
  { label = '주소', value, onSelect, onClear, disabled = false, error },
  ref
) {
  const listId = useId();
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isUnavailable, setIsUnavailable] = useState(false);

  const showInput = value === null || editing;
  const search = useAddressSearch(
    keyword,
    showInput && !disabled && !isUnavailable,
    page
  );
  const kind = search.isError ? classifyLocationError(search.error) : 'other';
  const isDisabled = disabled || isUnavailable;
  const keywordError =
    kind === 'keyword' && search.error ? search.error.message : undefined;
  const items = search.isDebouncing ? [] : (search.data?.items ?? []);
  const trimmed = keyword.trim();
  const listVisible =
    isOpen &&
    !isDisabled &&
    !keywordError &&
    !search.isError &&
    !search.isDebouncing &&
    trimmed.length >= ADDRESS_SEARCH_MIN_LENGTH &&
    items.length > 0;
  const showEmpty =
    isOpen &&
    !isDisabled &&
    !keywordError &&
    !search.isDebouncing &&
    !search.isFetching &&
    search.isSuccess &&
    items.length === 0;

  useEffect(() => {
    if (kind === 'unavailable') setIsUnavailable(true);
  }, [kind]);

  function optionId(index: number) {
    return `${listId}-option-${index}`;
  }

  function choose(candidate: AddressCandidate) {
    onSelect(candidate);
    setKeyword('');
    setEditing(false);
    setIsOpen(false);
    setActiveIndex(-1);
    setPage(1);
  }

  const lookupError =
    search.isError && !search.isDebouncing
      ? '주소를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
      : undefined;
  const shownError = isUnavailable
    ? ADDRESS_UNAVAILABLE_MESSAGE
    : (keywordError ?? lookupError ?? error);

  function changePage(next: number) {
    setPage(next);
    setActiveIndex(-1);
    setIsOpen(true);
  }

  if (!showInput && value) {
    return (
      <div className='slcn-address-field'>
        <span className='slcn-field__label'>{label}</span>
        <div className='slcn-address-field__selected'>
          <span className='slcn-address-field__selected-text'>
            {value.roadAddress || '선택한 주소'}
          </span>
          <div className='slcn-address-field__actions'>
            <Button
              variant='ghost'
              size='sm'
              disabled={isDisabled}
              onClick={() => setEditing(true)}
            >
              변경
            </Button>
            <Button variant='ghost' size='sm' onClick={onClear}>
              위치 지우기
            </Button>
          </div>
        </div>
        {shownError ? (
          <p className='slcn-field__message' data-kind='error' role='alert'>
            {shownError}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className='slcn-address-field'>
      <TextField
        ref={ref}
        label={label}
        hint='가까운 건물이나 주소를 입력하세요'
        error={shownError}
        value={keyword}
        disabled={isDisabled}
        autoComplete='off'
        role='combobox'
        aria-expanded={listVisible}
        aria-controls={listVisible ? listId : undefined}
        aria-autocomplete='list'
        aria-activedescendant={
          listVisible && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        onChange={(event) => {
          setKeyword(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
          setPage(1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === 'Escape') {
            setIsOpen(false);
            setActiveIndex(-1);
            return;
          }
          if (!listVisible) {
            return;
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % items.length);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) =>
              index <= 0 ? items.length - 1 : index - 1
            );
          } else if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault();
            const candidate = items[activeIndex];
            if (candidate) choose(candidate);
          }
        }}
      />
      {listVisible ? (
        <div id={listId} role='listbox' className='slcn-address-field__list'>
          {items.map((candidate, index) => (
            <div
              key={`${candidate.bdMgtSn}-${index}`}
              id={optionId(index)}
              role='option'
              aria-selected={index === activeIndex}
              className='slcn-address-field__option'
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(candidate)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  choose(candidate);
                }
              }}
            >
              <span>{candidateAddress(candidate)}</span>
              {candidate.buildingName ? (
                <span className='slcn-address-field__building'>
                  {candidate.buildingName}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {!isDisabled &&
      showInput &&
      (search.isFetching || search.isDebouncing) &&
      trimmed.length >= ADDRESS_SEARCH_MIN_LENGTH ? (
        <p className='slcn-address-field__status' role='status'>
          주소를 검색하는 중이에요…
        </p>
      ) : null}
      {listVisible && search.data && search.data.totalCount > 10 ? (
        <nav
          className='slcn-address-field__actions slcn-address-field__pagination'
          aria-label='주소 검색 페이지'
        >
          <Button
            variant='ghost'
            size='sm'
            disabled={page <= 1 || search.isFetching}
            onClick={() => changePage(page - 1)}
          >
            이전
          </Button>
          <span>
            {page} / {Math.ceil(search.data.totalCount / 10)}
          </span>
          <Button
            variant='ghost'
            size='sm'
            disabled={page * 10 >= search.data.totalCount || search.isFetching}
            onClick={() => changePage(page + 1)}
          >
            다음
          </Button>
        </nav>
      ) : null}
      {search.isError &&
      !isDisabled &&
      !search.isDebouncing &&
      kind !== 'keyword' ? (
        <Button
          variant='secondary'
          size='sm'
          onClick={() => void search.refetch()}
        >
          주소 검색 다시 시도
        </Button>
      ) : null}
      {showEmpty ? (
        <p className='slcn-address-field__status' role='status'>
          검색 결과가 없어요
        </p>
      ) : null}
      {value && editing ? (
        <div className='slcn-address-field__actions'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              setEditing(false);
              setKeyword('');
            }}
          >
            취소
          </Button>
        </div>
      ) : null}
    </div>
  );
});

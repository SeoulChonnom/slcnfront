import { type FormEvent, useState } from 'react';
import type { TravelTag } from '../types';

type TravelTagSectionProps = {
  tags: TravelTag[];
  isAdding?: boolean;
  isRemoving?: boolean;
  onAddTag: (name: string) => void;
  onRemoveTag: (tagId: string) => void;
};

export function TravelTagSection({
  tags,
  isAdding = false,
  isRemoving = false,
  onAddTag,
  onRemoveTag,
}: TravelTagSectionProps) {
  const [draft, setDraft] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draft.trim().replace(/^#/, '');
    if (!name || isAdding) {
      return;
    }
    onAddTag(name);
    setDraft('');
  }

  return (
    <div className='slcn-travel-tags'>
      <ul className='slcn-travel-tags__list'>
        {tags.map((tag) => (
          <li key={tag.id} className='slcn-travel-tags__chip'>
            <span>#{tag.name}</span>
            <button
              type='button'
              className='slcn-travel-tags__remove'
              aria-label={`${tag.name} 태그 삭제`}
              disabled={isRemoving}
              onClick={() => onRemoveTag(tag.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <form className='slcn-travel-tags__form' onSubmit={handleSubmit}>
        <div className='slcn-field__control slcn-travel-tags__control'>
          <input
            className='slcn-field__input'
            placeholder='태그 추가'
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label='태그 추가'
          />
        </div>
        <button
          type='submit'
          className='slcn-travel-tags__submit'
          disabled={isAdding || draft.trim().length === 0}
        >
          추가
        </button>
      </form>
    </div>
  );
}

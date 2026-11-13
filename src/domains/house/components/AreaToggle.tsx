import type { AreaBucket } from '../types';

export function AreaToggle({
  value,
  onChange,
}: {
  value: AreaBucket;
  onChange: (area: AreaBucket) => void;
}) {
  return (
    <fieldset className='house-area-toggle' aria-label='평형'>
      {(['B59', 'B84'] as const).map((area) => (
        <button
          key={area}
          type='button'
          aria-pressed={value === area}
          onClick={() => onChange(area)}
        >
          {area === 'B59' ? '59㎡' : '84㎡'}
        </button>
      ))}
    </fieldset>
  );
}

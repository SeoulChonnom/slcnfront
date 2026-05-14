import { cn } from '../../lib/utils/cn';

type RadioOption = {
  label: string;
  value: string;
  description?: string;
};

type RadioGroupProps = {
  name: string;
  value?: string;
  options: RadioOption[];
  onChange?: (value: string) => void;
  className?: string;
};

export function RadioGroup({
  name,
  value,
  options,
  onChange,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn('slcn-radio-group', className)} role='radiogroup'>
      {options.map((option) => {
        const checked = option.value === value;

        return (
          <label
            key={option.value}
            className='slcn-radio-group__option'
            data-checked={checked}
          >
            <input
              type='radio'
              className='mt-1'
              name={name}
              checked={checked}
              value={option.value}
              onChange={() => onChange?.(option.value)}
            />
            <span className='slcn-radio-group__content'>
              <span className='slcn-radio-group__label'>{option.label}</span>
              {option.description ? (
                <span className='slcn-radio-group__description'>
                  {option.description}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

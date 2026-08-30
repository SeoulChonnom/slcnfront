import { type Ref, useId } from 'react';
import { cn } from '@/lib/utils/cn';

type RadioOption = {
  label: string;
  value: string;
  description?: string;
};

type RadioGroupProps = {
  name: string;
  value?: string;
  label?: string;
  options: RadioOption[];
  onChange?: (value: string) => void;
  className?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  firstInputRef?: Ref<HTMLInputElement>;
};

export function RadioGroup({
  name,
  value,
  label,
  options,
  onChange,
  className,
  ariaDescribedBy,
  ariaInvalid,
  firstInputRef,
}: RadioGroupProps) {
  const labelId = useId();

  return (
    <div className='slcn-radio-group-field'>
      {label ? (
        <span id={labelId} className='slcn-radio-group__field-label'>
          {label}
        </span>
      ) : null}
      <div
        className={cn('slcn-radio-group', className)}
        role='radiogroup'
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid || undefined}
      >
        {options.map((option, index) => {
          const checked = option.value === value;

          return (
            <label
              key={option.value}
              className='slcn-radio-group__option'
              data-checked={checked}
            >
              <input
                ref={index === 0 ? firstInputRef : undefined}
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
    </div>
  );
}

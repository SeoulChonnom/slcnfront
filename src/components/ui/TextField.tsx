import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  useId,
} from 'react';

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, hint, error, leading, trailing, required, disabled, id, ...props },
    ref
  ) {
    const fallbackId = useId();
    const inputId = id ?? fallbackId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy =
      [errorId, hintId].filter(Boolean).join(' ') || undefined;

    return (
      <div className='slcn-field'>
        {label ? (
          <label htmlFor={inputId} className='slcn-field__label'>
            <span>{label}</span>
            {required ? <span aria-hidden='true'> *</span> : null}
          </label>
        ) : null}
        <div
          className='slcn-field__control'
          data-disabled={disabled}
          data-error={Boolean(error)}
        >
          {leading ? <span aria-hidden='true'>{leading}</span> : null}
          <input
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className='slcn-field__input'
            {...props}
          />
          {trailing ? <span>{trailing}</span> : null}
        </div>
        {error ? (
          <p id={errorId} className='slcn-field__message' data-kind='error'>
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className='slcn-field__message' data-kind='hint'>
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

export type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(function TextareaField(
  { label, hint, error, required, disabled, id, ...props },
  ref
) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className='slcn-field'>
      {label ? (
        <label htmlFor={inputId} className='slcn-field__label'>
          <span>{label}</span>
          {required ? <span aria-hidden='true'> *</span> : null}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={inputId}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className='slcn-field__textarea'
        data-disabled={disabled}
        data-error={Boolean(error)}
        {...props}
      />
      {error ? (
        <p id={errorId} className='slcn-field__message' data-kind='error'>
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className='slcn-field__message' data-kind='hint'>
          {hint}
        </p>
      ) : null}
    </div>
  );
});

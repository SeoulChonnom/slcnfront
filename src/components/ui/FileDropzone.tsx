import type { DragEvent, InputHTMLAttributes } from 'react';
import { useId } from 'react';
import { cn } from '../../lib/utils/cn';

type FileDropzoneProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'children'
> & {
  label: string;
  prompt?: string;
  hint?: string;
};

export function FileDropzone({
  label,
  prompt,
  hint,
  id,
  className,
  ...props
}: FileDropzoneProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;

  function preventDefault(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
  }

  return (
    <div className='slcn-file-dropzone'>
      <span className='slcn-file-dropzone__field-label'>{label}</span>
      <label
        htmlFor={inputId}
        onDragEnter={preventDefault}
        onDragOver={preventDefault}
        onDrop={preventDefault}
        className={cn('slcn-file-dropzone__label', className)}
      >
        <svg
          className='slcn-file-dropzone__icon'
          width='22'
          height='22'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
        >
          <path d='M12 19V6' />
          <path d='M5 12l7-7 7 7' />
        </svg>
        <span className='slcn-file-dropzone__title'>
          {prompt ?? '파일을 끌어다 놓거나 선택하세요'}
        </span>
        <span className='slcn-file-dropzone__hint'>
          {hint ?? 'PNG · JPG · 최대 10MB'}
        </span>
      </label>
      <input
        id={inputId}
        type='file'
        className='slcn-file-dropzone__input'
        {...props}
      />
    </div>
  );
}

import type { DragEvent, InputHTMLAttributes } from 'react';
import { useId } from 'react';
import { cn } from '../../lib/utils/cn';

type FileDropzoneProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'children'
> & {
  label: string;
  hint?: string;
};

export function FileDropzone({
  label,
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
      <label
        htmlFor={inputId}
        onDragEnter={preventDefault}
        onDragOver={preventDefault}
        onDrop={preventDefault}
        className={cn(
          'slcn-file-dropzone__label slcn-card surface-blob pink-mesh',
          className
        )}
      >
        <span className='slcn-file-dropzone__title display-hand'>{label}</span>
        <span className='slcn-file-dropzone__hint'>
          {hint ?? '파일을 선택하거나 이 영역으로 끌어오세요.'}
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

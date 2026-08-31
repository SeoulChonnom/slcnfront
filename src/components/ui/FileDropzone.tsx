import {
  type ChangeEvent,
  type DragEvent,
  forwardRef,
  type InputHTMLAttributes,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils/cn';

export type FileDropzoneProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'children' | 'onChange' | 'value'
> & {
  label: string;
  prompt?: string;
  hint?: string;
  error?: string;
  file?: File | null;
  onFileSelect?: (file: File | null) => void;
  onClear?: () => void;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`;
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${Math.round(kilobytes)}KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)}MB`;
}

export const FileDropzone = forwardRef<HTMLInputElement, FileDropzoneProps>(
  function FileDropzone(
    {
      label,
      prompt,
      hint,
      error,
      file,
      onFileSelect,
      onClear,
      id,
      className,
      required,
      disabled,
      'aria-describedby': ariaDescribedByProp,
      ...props
    },
    forwardedRef
  ) {
    const fallbackId = useId();
    const inputId = id ?? fallbackId;
    const labelId = `${inputId}-label`;
    const promptId = `${inputId}-prompt`;
    const hintId = `${inputId}-hint`;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy =
      [errorId, promptId, hintId, ariaDescribedByProp]
        .filter(Boolean)
        .join(' ') || undefined;

    const promptText = prompt ?? '파일을 끌어다 놓거나 선택하세요';
    const hintText = hint ?? 'PNG · JPG · 최대 10MB';

    const [dragging, setDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (
        !file?.type.startsWith('image/') ||
        typeof URL.createObjectURL !== 'function'
      ) {
        setPreviewUrl(null);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }, [file]);

    function setRefs(node: HTMLInputElement | null) {
      inputRef.current = node;

      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    }

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
      onFileSelect?.(event.target.files?.[0] ?? null);
    }

    function handleDragEnter(event: DragEvent<HTMLLabelElement>) {
      event.preventDefault();
      event.stopPropagation();

      if (disabled) {
        return;
      }

      event.dataTransfer.dropEffect = 'copy';
      setDragging(true);
    }

    function handleDragOver(event: DragEvent<HTMLLabelElement>) {
      event.preventDefault();
      event.stopPropagation();

      if (disabled) {
        return;
      }

      event.dataTransfer.dropEffect = 'copy';
      setDragging(true);
    }

    function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
      event.preventDefault();
      event.stopPropagation();

      if (disabled) {
        return;
      }

      const related = event.relatedTarget as Node | null;

      if (related && event.currentTarget.contains(related)) {
        return;
      }

      setDragging(false);
    }

    function handleDrop(event: DragEvent<HTMLLabelElement>) {
      event.preventDefault();
      event.stopPropagation();
      setDragging(false);

      if (disabled) {
        return;
      }

      const droppedFile = event.dataTransfer.files[0];

      if (!droppedFile) {
        return;
      }

      if (inputRef.current && typeof DataTransfer !== 'undefined') {
        try {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(droppedFile);
          inputRef.current.files = dataTransfer.files;
        } catch {
          // jsdom and some older browsers do not support constructing DataTransfer.
        }
      }

      onFileSelect?.(droppedFile);
    }

    function handleClear() {
      if (inputRef.current) {
        inputRef.current.value = '';
      }

      onClear?.();
    }

    const showThumbnail = Boolean(
      file?.type.startsWith('image/') && previewUrl
    );

    return (
      <div
        className={cn('slcn-file-dropzone', className)}
        data-dragging={dragging ? 'true' : undefined}
        data-error={error ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
      >
        <label
          htmlFor={inputId}
          id={labelId}
          className='slcn-file-dropzone__field-label'
        >
          {label}
          {required ? <span aria-hidden='true'> *</span> : null}
        </label>
        <label
          htmlFor={inputId}
          className='slcn-file-dropzone__label'
          data-dragging={dragging ? 'true' : undefined}
          data-error={error ? 'true' : undefined}
          data-disabled={disabled ? 'true' : undefined}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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
          <span id={promptId} className='slcn-file-dropzone__title'>
            {promptText}
          </span>
          <span id={hintId} className='slcn-file-dropzone__hint'>
            {hintText}
          </span>
        </label>
        <input
          ref={setRefs}
          id={inputId}
          type='file'
          required={required}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className='slcn-file-dropzone__input'
          onChange={handleChange}
          {...props}
        />
        {file ? (
          <div className='slcn-file-dropzone__file'>
            {showThumbnail ? (
              <img
                src={previewUrl ?? undefined}
                alt=''
                aria-hidden='true'
                className='slcn-file-dropzone__thumbnail'
              />
            ) : null}
            <span className='slcn-file-dropzone__file-name' title={file.name}>
              {file.name}
            </span>
            <span className='slcn-file-dropzone__file-size'>
              {formatFileSize(file.size)}
            </span>
            {onClear ? (
              <button
                type='button'
                className='slcn-file-dropzone__clear'
                aria-label={`${label} 파일 지우기`}
                onClick={handleClear}
              >
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  aria-hidden='true'
                >
                  <path d='M6 6l12 12' />
                  <path d='M18 6L6 18' />
                </svg>
              </button>
            ) : null}
          </div>
        ) : null}
        {error ? (
          <p id={errorId} className='slcn-file-dropzone__error' role='alert'>
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

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
  'type' | 'children' | 'onChange' | 'value' | 'multiple'
> & {
  label: string;
  /**
   * Keeps `label` as the input's accessible name but takes it off screen,
   * for a section that already carries the same words in its own heading.
   * Without this the words render twice: once as the section `<h2>` and
   * again as the dropzone's field label.
   */
  hideLabel?: boolean;
  prompt?: string;
  hint?: string;
  error?: string;
  file?: File | null;
  onFileSelect?: (file: File | null) => void;
  onClear?: () => void;
  /**
   * Switches the dropzone into multi-file mode: the native input accepts
   * more than one file, `files`/`onFilesSelect` drive its selection instead
   * of `file`/`onFileSelect`, and each picked file renders its own
   * thumbnail row with its own remove control. When omitted (the default),
   * every code path below falls through to the original single-file
   * behaviour unchanged — the trip register wizard depends on that.
   */
  multiple?: boolean;
  files?: File[];
  onFilesSelect?: (files: File[]) => void;
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

/** One selected file's thumbnail/name/size/remove row, for multi-file mode. */
function FileDropzoneFileRow({
  file,
  label,
  onRemove,
}: {
  file: File;
  label: string;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (
      !file.type.startsWith('image/') ||
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

  const showThumbnail = Boolean(file.type.startsWith('image/') && previewUrl);

  return (
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
      <button
        type='button'
        className='slcn-file-dropzone__clear'
        aria-label={`${label} ${file.name} 파일 지우기`}
        onClick={onRemove}
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
    </div>
  );
}

export const FileDropzone = forwardRef<HTMLInputElement, FileDropzoneProps>(
  function FileDropzone(
    {
      label,
      hideLabel,
      prompt,
      hint,
      error,
      file,
      onFileSelect,
      onClear,
      multiple = false,
      files,
      onFilesSelect,
      id,
      className,
      required,
      disabled,
      'aria-describedby': ariaDescribedByProp,
      ...props
    },
    forwardedRef
  ) {
    const selectedFiles = multiple ? (files ?? []) : [];
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
      if (multiple) {
        onFilesSelect?.(
          event.target.files ? Array.from(event.target.files) : []
        );
        return;
      }

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

      if (multiple) {
        const droppedFiles = Array.from(event.dataTransfer.files);

        if (droppedFiles.length === 0) {
          return;
        }

        const nextFiles = [...selectedFiles, ...droppedFiles];

        if (inputRef.current && typeof DataTransfer !== 'undefined') {
          try {
            const dataTransfer = new DataTransfer();
            for (const nextFile of nextFiles) {
              dataTransfer.items.add(nextFile);
            }
            inputRef.current.files = dataTransfer.files;
          } catch {
            // jsdom and some older browsers do not support constructing DataTransfer.
          }
        }

        onFilesSelect?.(nextFiles);
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
          className={cn(
            'slcn-file-dropzone__field-label',
            hideLabel && 'slcn-visually-hidden'
          )}
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
          multiple={multiple}
          required={required}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className='slcn-file-dropzone__input'
          onChange={handleChange}
          {...props}
        />
        {multiple ? (
          selectedFiles.length > 0 ? (
            <div className='slcn-file-dropzone__file-list'>
              {selectedFiles.map((selectedFile, index) => (
                <FileDropzoneFileRow
                  key={`${selectedFile.name}-${selectedFile.size}-${index}`}
                  file={selectedFile}
                  label={label}
                  onRemove={() =>
                    onFilesSelect?.(selectedFiles.filter((_, i) => i !== index))
                  }
                />
              ))}
            </div>
          ) : null
        ) : file ? (
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

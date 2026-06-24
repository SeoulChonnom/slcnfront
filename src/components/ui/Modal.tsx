import {
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils/cn';

type ModalTitleVariant = 'display' | 'heading' | 'eyebrow';

type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  className?: string;
  /** Header text alignment. Defaults to centered display style. */
  align?: 'center' | 'left';
  /** Visual style of the title text. */
  titleVariant?: ModalTitleVariant;
  /** Optional leading node rendered inline before the title (e.g. an icon). */
  titleIcon?: ReactNode;
}> &
  HTMLAttributes<HTMLDivElement>;

function isUsableFocusTarget(element: Element | null): element is HTMLElement {
  return (
    element instanceof HTMLElement &&
    element.isConnected &&
    !element.hasAttribute('disabled') &&
    !element.hasAttribute('hidden') &&
    element.getAttribute('aria-hidden') !== 'true'
  );
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])'
    )
  ).filter(isUsableFocusTarget);
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  align = 'center',
  titleVariant = 'display',
  titleIcon,
  onKeyDown,
  ...props
}: ModalProps) {
  const titleId = useId();
  const descriptionElementId = useId();
  const descriptionId = description ? descriptionElementId : undefined;
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  if (isOpen && !wasOpenRef.current) {
    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
  }

  wasOpenRef.current = isOpen;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;

      const previousFocusedElement = previousFocusedElementRef.current;
      previousFocusedElementRef.current = null;

      if (isUsableFocusTarget(previousFocusedElement)) {
        previousFocusedElement.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (
      document.activeElement instanceof HTMLElement &&
      dialog.contains(document.activeElement)
    ) {
      return;
    }

    const explicitAutoFocusTarget =
      dialog.querySelector<HTMLElement>('[autofocus]');

    if (isUsableFocusTarget(explicitAutoFocusTarget)) {
      explicitAutoFocusTarget.focus();
      return;
    }

    const firstFocusableElement = getFocusableElements(dialog)[0];
    (firstFocusableElement ?? dialog).focus();
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className='slcn-modal-backdrop'>
      <button
        type='button'
        aria-label='배경으로 모달 닫기'
        className='slcn-modal-backdrop__dismiss'
        tabIndex={-1}
        onMouseDown={onClose}
      />
      <div
        {...props}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn('slcn-modal', className)}
        data-align={align}
        ref={dialogRef}
        onKeyDown={(event) => {
          onKeyDown?.(event);

          if (event.defaultPrevented) {
            return;
          }

          if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
            return;
          }

          if (event.key !== 'Tab') {
            return;
          }

          const currentTarget = event.currentTarget;
          const focusableElements = getFocusableElements(currentTarget);

          if (focusableElements.length === 0) {
            event.preventDefault();
            currentTarget.focus();
            return;
          }

          const first = focusableElements[0];
          const last = focusableElements[focusableElements.length - 1];
          const activeElement = document.activeElement;

          if (!event.shiftKey && activeElement === last) {
            event.preventDefault();
            first?.focus();
          }

          if (event.shiftKey && activeElement === first) {
            event.preventDefault();
            last?.focus();
          }
        }}
        tabIndex={-1}
      >
        <button
          type='button'
          aria-label='모달 닫기'
          onClick={onClose}
          className='slcn-modal__close'
        >
          ✕
        </button>
        <div className='slcn-modal__headline'>
          <div className='slcn-modal__title-wrap'>
            <h2
              id={titleId}
              className={cn(
                'slcn-modal__title',
                titleVariant === 'display' && 'display-hand'
              )}
              data-variant={titleVariant}
            >
              {titleIcon ? (
                <span className='slcn-modal__title-icon' aria-hidden='true'>
                  {titleIcon}
                </span>
              ) : null}
              {title}
            </h2>
          </div>
          {description ? (
            <p id={descriptionId} className='slcn-modal__description'>
              {description}
            </p>
          ) : null}
        </div>
        <div className='slcn-modal__body'>{children}</div>
      </div>
    </div>,
    document.body
  );
}

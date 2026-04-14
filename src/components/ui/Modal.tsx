import {
  useEffect,
  useId,
  type HTMLAttributes,
  type PropsWithChildren,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils/cn';

type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  className?: string;
}> &
  HTMLAttributes<HTMLDivElement>;

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('disabled'));
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  ...props
}: ModalProps) {
  const titleId = useId();
  const descriptionElementId = useId();
  const descriptionId = description ? descriptionElementId : undefined;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="slcn-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn('slcn-modal', className)}
        onKeyDown={(event) => {
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
        ref={(node) => {
          if (!node) {
            return;
          }

          queueMicrotask(() => {
            const focusableElements = getFocusableElements(node);
            (focusableElements[0] ?? node).focus();
          });
        }}
        tabIndex={-1}
        {...props}
      >
        <button
          type="button"
          aria-label="모달 닫기"
          onClick={onClose}
          className="slcn-modal__close"
        >
          ✕
        </button>
        <div className="slcn-modal__sticker">
          <span aria-hidden="true">⌘</span>
        </div>
        <div className="slcn-modal__headline">
          <div className="slcn-modal__title-wrap">
            <h2 id={titleId} className="slcn-modal__title display-hand">
              {title}
            </h2>
          </div>
          {description ? (
            <p id={descriptionId} className="slcn-modal__description">
              {description}
            </p>
          ) : null}
        </div>
        <div className="slcn-modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

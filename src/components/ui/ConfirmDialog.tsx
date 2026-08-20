import { Button } from './Button';
import type { ButtonVariant } from './button-class-name';
import { Modal } from './Modal';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  /**
   * Name what is lost, not just that something will be. This sentence is the
   * actual guard — reading it is what prevents the mistake.
   */
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isConfirming?: boolean;
};

/**
 * A shared confirmation dialog for destructive actions. It never
 * auto-focuses the confirm control, and Escape / backdrop / close always
 * cancel rather than confirm.
 */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = '계속 둘게요',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  isConfirming = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      description={description}
      align='left'
      titleVariant='heading'
      className='slcn-confirm-dialog'
    >
      <div className='slcn-confirm-dialog__actions'>
        <Button
          type='button'
          variant='secondary'
          autoFocus
          disabled={isConfirming}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
        <Button
          type='button'
          variant={confirmVariant}
          loading={isConfirming}
          disabled={isConfirming}
          onClick={() => {
            void onConfirm();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

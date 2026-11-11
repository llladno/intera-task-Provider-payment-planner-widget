import { useEffect, useRef, type ReactElement } from 'react';
import { LABELS } from '@planner/config/labels';
import { Button } from '@planner/ui/button/button';
import type { IQueueDialogProps } from '@planner/ui/queue-dialog/queue-dialog.types';
import '@planner/ui/queue-dialog/queue-dialog.css';

const BLOCK = 'dash-payment-planner-queue-dialog';

/** Modal with the full planner — the target of "Открыть очередь" / "Открыть детали". */
export function QueueDialog({
  isOpen,
  title,
  onClose,
  children,
}: IQueueDialogProps): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (!dialogElement) {
      return;
    }
    if (isOpen && !dialogElement.open) {
      dialogElement.showModal();
    } else if (!isOpen && dialogElement.open) {
      dialogElement.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className={BLOCK}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop lands on the dialog element itself.
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {isOpen && (
        <div className={`${BLOCK}__body`}>
          <div className={`${BLOCK}__header`}>
            <h4 className={`${BLOCK}__title`}>{title}</h4>
            <Button onClick={onClose} autoFocus>
              {LABELS.actions.close}
            </Button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

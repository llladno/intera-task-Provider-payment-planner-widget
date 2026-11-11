import type { ReactElement } from 'react';
import type { INoticeProps } from '@planner/ui/notice/notice.types';
import '@planner/ui/notice/notice.css';

const BLOCK = 'dash-payment-planner-notice';

export function Notice({
  message,
  hint,
  role = 'status',
}: INoticeProps): ReactElement {
  return (
    <p className={`${BLOCK} ${BLOCK}--warning`} role={role}>
      {message}
      {hint !== undefined && (
        <>
          {' '}
          <span className={`${BLOCK}__hint`}>{hint}</span>
        </>
      )}
    </p>
  );
}

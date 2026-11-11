import type { ReactElement } from 'react';
import { LABELS } from '@planner/config/labels';
import '@planner/ui/skeleton/skeleton.css';

const BLOCK = 'dash-payment-planner-skeleton';

/** Placeholder shown inside the card during the initial load. */
export function Skeleton(): ReactElement {
  return (
    <div
      className={BLOCK}
      role="status"
      aria-live="polite"
      aria-label={LABELS.states.loadingAria}
    >
      <span className={`${BLOCK}__line ${BLOCK}__line--large`} />
      <span className={`${BLOCK}__line`} />
      <span className={`${BLOCK}__line ${BLOCK}__line--short`} />
      <span className={`${BLOCK}__block`} />
    </div>
  );
}

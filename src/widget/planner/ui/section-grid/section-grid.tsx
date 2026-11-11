import type { ReactElement } from 'react';
import { joinClassNames } from '@planner/lib/join-class-names';
import type { ISectionGridProps } from '@planner/ui/section-grid/section-grid.types';
import '@planner/ui/section-grid/section-grid.css';

const BLOCK = 'dash-payment-planner-section-grid';

/** Two-column (one on narrow containers) layout for sections. */
export function SectionGrid({
  children,
  isSingleColumn = false,
}: ISectionGridProps): ReactElement {
  return (
    <div className={joinClassNames(BLOCK, isSingleColumn && `${BLOCK}--single`)}>
      {children}
    </div>
  );
}

import type { ReactElement } from 'react';
import { FullView } from '@planner/ui/views/full-view';
import { HalfView } from '@planner/ui/views/half-view';
import { QuarterView } from '@planner/ui/views/quarter-view';
import { ThirdView } from '@planner/ui/views/third-view';
import type { IPlannerViewProps } from '@planner/ui/views/views.types';

/** Picks the view for the card size. */
export function PlannerView({ size, viewProps }: IPlannerViewProps): ReactElement {
  switch (size) {
    case 'half':
      return <HalfView {...viewProps} />;
    case 'third':
      return <ThirdView {...viewProps} />;
    case 'quarter':
      return <QuarterView {...viewProps} />;
    default:
      return <FullView {...viewProps} />;
  }
}

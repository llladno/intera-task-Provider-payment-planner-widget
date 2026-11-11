import type { ReactElement, ReactNode } from 'react';
import '@planner/ui/stat-grid/stat-grid.css';

/** Responsive row of stat tiles. */
export function StatGrid({ children }: { children: ReactNode }): ReactElement {
  return <div className="dash-payment-planner-stat-grid">{children}</div>;
}

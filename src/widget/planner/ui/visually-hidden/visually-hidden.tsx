import type { ReactElement, ReactNode } from 'react';
import '@planner/ui/visually-hidden/visually-hidden.css';

/** Text for screen readers only. */
export function VisuallyHidden({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <span className="dash-payment-planner-visually-hidden">{children}</span>;
}

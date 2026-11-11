import type { ReactElement } from 'react';
import '@planner/ui/overflow-hint/overflow-hint.css';

/** "+ ещё 2 валюты (EUR, GBP)": says that something is not shown instead of hiding it silently. */
export function OverflowHint({ message }: { message: string }): ReactElement {
  return <p className="dash-payment-planner-overflow-hint">{message}</p>;
}

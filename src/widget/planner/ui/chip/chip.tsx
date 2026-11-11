import type { ReactElement } from 'react';
import type { IChipProps } from '@planner/ui/chip/chip.types';
import '@planner/ui/chip/chip.css';

export function Chip({ children, isPressed, onClick }: IChipProps): ReactElement {
  return (
    <button
      type="button"
      className="dash-payment-planner-chip"
      aria-pressed={isPressed}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

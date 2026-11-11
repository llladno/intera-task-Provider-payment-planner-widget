import type { ReactElement } from 'react';
import type { IChipListProps } from '@planner/ui/chip-list/chip-list.types';
import '@planner/ui/chip-list/chip-list.css';

export function ChipList({
  children,
  label,
  labelledBy,
}: IChipListProps): ReactElement {
  return (
    <div
      className="dash-payment-planner-chip-list"
      role="group"
      aria-label={label}
      aria-labelledby={labelledBy}
    >
      {children}
    </div>
  );
}

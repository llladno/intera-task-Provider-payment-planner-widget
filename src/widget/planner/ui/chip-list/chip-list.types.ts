import type { ReactNode } from 'react';

export interface IChipListProps {
  children: ReactNode;
  /** Accessible name of the group. */
  label?: string;
  /** Id of the element that names the group. */
  labelledBy?: string;
}

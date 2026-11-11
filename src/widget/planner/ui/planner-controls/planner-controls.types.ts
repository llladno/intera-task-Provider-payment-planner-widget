import type { IFilterOptions } from '@planner/model/types';
import type { IPlannerState } from '@planner/model/use-planner-state/types';

export interface IPlannerControlsProps {
  planner: IPlannerState;
  filterOptions: IFilterOptions;
  /** Selected number of bills (clamped to the queue). */
  selectedCount: number;
  /** Length of the filtered queue. */
  queueCount: number;
}

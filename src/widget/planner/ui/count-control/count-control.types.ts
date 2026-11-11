import type { ECountControlVariant } from '@planner/ui/count-control/count-control.constants';

export interface ICountControlProps {
  /** Selected number of bills. */
  value: number;
  /** Length of the filtered queue. */
  max: number;
  onChange: (selectedCount: number) => void;
  variant: ECountControlVariant;
}

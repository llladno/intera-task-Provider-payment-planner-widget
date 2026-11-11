import type { ReactNode } from 'react';
import type { TIdFilter } from '@planner/config/filters';
import type { IFilterOption } from '@planner/model/types';

export interface IFilterFieldProps {
  label: string;
  children: ReactNode;
  /** Spans both columns of the filters grid. */
  isWide?: boolean;
  /** Id for the label so a group inside can reference it. */
  labelId?: string;
}

export interface IFilterSelectProps {
  label: string;
  /** Text of the "no restriction" option. */
  allLabel: string;
  value: TIdFilter;
  options: readonly IFilterOption[];
  onChange: (value: TIdFilter) => void;
}

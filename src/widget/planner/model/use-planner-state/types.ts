import type { TIdFilter } from '@planner/config/filters';
import type { IPaymentPlannerRuntimeState } from '@planner/model/types';

/** Filters the user changed inside the widget; `null` = follow the config. */
export interface IFilterOverrides {
  providerId: TIdFilter | null;
  billingCycleId: TIdFilter | null;
  currencyIds: number[] | null;
}

export interface IPlannerState {
  /** Overrides to pass to `computePaymentPlan`. */
  runtimeState: IPaymentPlannerRuntimeState;
  /** Currently applied filters (override, else config). */
  providerId: TIdFilter;
  billingCycleId: TIdFilter;
  currencyIds: readonly number[];
  hasActiveFilters: boolean;
  /** Rows shown in the table: `config.rowLimit` plus what "show more" added. */
  rowLimit: number;
  showMoreRows: () => void;
  collapseRows: () => void;
  setSelectedCount: (selectedCount: number) => void;
  setProviderId: (providerId: TIdFilter) => void;
  setBillingCycleId: (billingCycleId: TIdFilter) => void;
  toggleCurrency: (currencyId: number) => void;
  resetFilters: () => void;
}

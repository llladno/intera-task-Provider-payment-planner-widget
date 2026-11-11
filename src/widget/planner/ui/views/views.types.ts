import type {
  IFilterOptions,
  IPaymentPlannerConfig,
  IPaymentPlanResult,
  IProviderCurrencyBreakdownItem,
} from '@planner/model/types';
import type { IPlannerState } from '@planner/model/use-planner-state/types';
import type { TWidgetSize } from '@platform/widget-types';

/** What every size-specific view renders from. */
export interface IViewProps {
  config: IPaymentPlannerConfig;
  plan: IPaymentPlanResult;
  planner: IPlannerState;
  filterOptions: IFilterOptions;
  /** Rows in the data source before any filter. */
  sourceRowCount: number;
  activeCurrencyId: number | null;
  activeShares: readonly IProviderCurrencyBreakdownItem[];
  onCurrencyChange: (currencyId: number) => void;
  expandedBillKey: string | null;
  onToggleBill: (billKey: string) => void;
  /** `quarter`: all currencies instead of the first few. */
  isCurrencyListExpanded: boolean;
  onToggleCurrencyList: () => void;
  /** `half` / `third`: open the full view. */
  onOpenQueue: () => void;
}

export interface IPlannerViewProps {
  size: TWidgetSize;
  viewProps: IViewProps;
}

import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import type {
  IFilterOptions,
  IPaymentPlannerConfig,
  IPaymentPlanResult,
  IProviderCurrencyBreakdownItem,
} from '@planner/model/types';
import type { IPlannerState } from '@planner/model/use-planner-state/types';
import type { TWidgetSize } from '@platform/widget-types';

export interface IPaymentPlannerModel {
  config: IPaymentPlannerConfig;
  /** The `size` prop wins over `params.size`. */
  effectiveSize: TWidgetSize;
  planner: IPlannerState;
  /** `items` of the data envelope, or an empty list when it is not an array. */
  queueRows: readonly IProviderPaymentQueueRow[];
  plan: IPaymentPlanResult;
  filterOptions: IFilterOptions;
  /** Currency whose provider shares are shown (the chosen one, else the first). */
  activeCurrencyId: number | null;
  /** Provider breakdown of {@link activeCurrencyId}. */
  activeShares: IProviderCurrencyBreakdownItem[];
}

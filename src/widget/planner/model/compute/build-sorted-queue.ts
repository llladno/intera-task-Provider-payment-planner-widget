import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import { isRowInScope } from '@planner/model/compute/filter-queue';
import { compareQueueOrder, withRank } from '@planner/model/compute/sort-queue';
import type { IQueueScope, IRankedRow } from '@planner/model/compute/types';
import type {
  IPaymentPlannerConfig,
  IPaymentPlannerRuntimeState,
} from '@planner/model/types';

/** The filters in effect: the widget's own overrides win over the config. */
export function resolveQueueScope(
  config: IPaymentPlannerConfig,
  runtimeState: IPaymentPlannerRuntimeState | undefined,
): IQueueScope {
  return {
    providerId: runtimeState?.providerIdOverride ?? config.providerId,
    billingCycleId: runtimeState?.billingCycleIdOverride ?? config.billingCycleId,
    currencyIds: runtimeState?.currencyIdsOverride ?? config.currencyIds,
  };
}

/**
 * Scope filters first, then the sort `(payment_rank, provider_bill_id, source order)`.
 * Independent of the selected count, so a caller can cache it while the user drags the slider.
 */
export function buildSortedQueue(
  rows: readonly IProviderPaymentQueueRow[],
  scope: IQueueScope,
): IRankedRow[] {
  return rows
    .map(withRank)
    .filter(({ row }) => isRowInScope(row, scope))
    .sort(compareQueueOrder);
}

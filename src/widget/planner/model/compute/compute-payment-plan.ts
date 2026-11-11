import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import type { IRankedRow } from '@planner/model/compute/types';
import { aggregateSelection } from '@planner/model/compute/aggregate-selection';
import { buildQueueItem } from '@planner/model/compute/build-queue-item';
import {
  buildSortedQueue,
  resolveQueueScope,
} from '@planner/model/compute/build-sorted-queue';
import {
  resolveRowLimit,
  resolveSelectedCount,
} from '@planner/model/compute/resolve-limits';
import type {
  IPaymentPlannerConfig,
  IPaymentPlannerRuntimeState,
  IPaymentPlanResult,
} from '@planner/model/types';

/**
 * Pure computation of the provider payment plan from `provider-payment-queue` rows.
 *
 * Must NOT depend on React or DOM APIs.
 *
 * Key domain rules:
 * 1. Scope filters (`providerId`, `billingCycleId`, `currencyIds`) are applied BEFORE sorting and selecting
 *    the first `selectedCount` bills.
 * 2. Sorting order:
 *    - `payment_rank` ascending (valid finite ranks first; missing/invalid ranks last),
 *    - `provider_bill_id` ascending as tie-breaker (since Enigma partitions `payment_rank` by `provider_id`),
 *    - original array index (stable order).
 * 3. Selection: `effectiveSelectedCount = Math.min(Math.max(0, selectedCount), filteredQueue.length)`.
 *    The first `effectiveSelectedCount` items in the sorted queue have `selected = true`.
 * 4. Invalid amounts: if `toFiniteNumber(row.provider_total_due)` is `null` or `<= 0`, mark
 *    `hasInvalidAmount = true`. Never treat invalid amounts as `0` in aggregates — exclude them from
 *    `currencyTotals` and `providerBreakdown` and increment `invalidSelectedCount` when selected.
 * 5. Never sum amounts across different currencies.
 */
export function computePaymentPlan(
  rows: readonly IProviderPaymentQueueRow[],
  config: IPaymentPlannerConfig,
  runtimeState?: IPaymentPlannerRuntimeState,
): IPaymentPlanResult {
  const sortedRows = buildSortedQueue(rows, resolveQueueScope(config, runtimeState));
  return computePlanFromSortedQueue(sortedRows, config, runtimeState);
}

/**
 * Everything after the sort: selection, row cut and aggregates. Cheap compared with
 * {@link buildSortedQueue}, so a changed selected count only re-runs this part.
 */
export function computePlanFromSortedQueue(
  sortedRows: readonly IRankedRow[],
  config: IPaymentPlannerConfig,
  runtimeState?: IPaymentPlannerRuntimeState,
): IPaymentPlanResult {
  const totalQueueCount = sortedRows.length;
  const effectiveSelectedCount = Math.min(
    resolveSelectedCount(config, runtimeState),
    totalQueueCount,
  );

  const queueItems = sortedRows.map((rankedRow, rowIndex) =>
    buildQueueItem(rankedRow, rowIndex + 1, effectiveSelectedCount),
  );

  return {
    totalQueueCount,
    effectiveSelectedCount,
    ...aggregateSelection(queueItems),
    queueItems,
    visibleQueueItems: queueItems.slice(0, resolveRowLimit(config, runtimeState)),
  };
}

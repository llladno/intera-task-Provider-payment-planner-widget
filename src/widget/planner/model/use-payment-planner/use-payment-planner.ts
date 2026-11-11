import { useMemo } from 'react';
import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import { collectFilterOptions } from '@planner/model/filter-options/collect-filter-options';
import {
  buildSortedQueue,
  resolveQueueScope,
} from '@planner/model/compute/build-sorted-queue';
import { computePlanFromSortedQueue } from '@planner/model/compute/compute-payment-plan';
import { parsePaymentPlannerParams } from '@planner/model/params/parse-payment-planner-params';
import type { IPaymentPlannerModel } from '@planner/model/use-payment-planner/types';
import { usePlannerState } from '@planner/model/use-planner-state/use-planner-state';
import type {
  ICollectionDataResult,
  TWidgetSize,
} from '@platform/widget-types';

const NO_ROWS: readonly IProviderPaymentQueueRow[] = [];

/**
 * Everything the card renders from: parsed config, interactive state, the plan
 * and the filter options. `shareCurrencyId` is the user's choice of currency for
 * the provider shares (`null` = first currency of the plan).
 */
export function usePaymentPlanner(
  params: Record<string, unknown> | undefined,
  data: ICollectionDataResult<IProviderPaymentQueueRow>,
  sizeOverride: TWidgetSize | undefined,
  shareCurrencyId: number | null,
): IPaymentPlannerModel {
  const config = useMemo(() => parsePaymentPlannerParams(params), [params]);
  const planner = usePlannerState(config);

  // The envelope comes from the runtime; never trust `items` to be an array.
  const queueRows = Array.isArray(data.items) ? data.items : NO_ROWS;
  // Sorting does not depend on the selected count: cache it so dragging the slider
  // only redoes the cheap selection and aggregation below.
  const queueScope = resolveQueueScope(config, planner.runtimeState);
  const currencyScopeKey = queueScope.currencyIds.join(',');
  const sortedQueue = useMemo(
    () => buildSortedQueue(queueRows, queueScope),
    // `queueScope` is rebuilt every render; its content is covered by these keys.
    [queueRows, queueScope.providerId, queueScope.billingCycleId, currencyScopeKey],
  );
  const plan = useMemo(
    () => computePlanFromSortedQueue(sortedQueue, config, planner.runtimeState),
    [sortedQueue, config, planner.runtimeState],
  );
  const filterOptions = useMemo(
    () => collectFilterOptions(queueRows),
    [queueRows],
  );

  const activeCurrencyId =
    plan.currencyTotals.find(
      (currencyTotal) => currencyTotal.currencyId === shareCurrencyId,
    )?.currencyId ??
    plan.currencyTotals[0]?.currencyId ??
    null;
  const activeShares = useMemo(
    () =>
      plan.providerBreakdown.filter(
        (breakdownItem) => breakdownItem.currencyId === activeCurrencyId,
      ),
    [plan.providerBreakdown, activeCurrencyId],
  );

  return {
    config,
    effectiveSize: sizeOverride ?? config.size,
    planner,
    queueRows,
    plan,
    filterOptions,
    activeCurrencyId,
    activeShares,
  };
}

import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import { ALL_FILTER_VALUE } from '@planner/config/filters';
import type { IQueueScope } from '@planner/model/compute/types';

export function isRowInScope(
  queueRow: IProviderPaymentQueueRow,
  scope: IQueueScope,
): boolean {
  const matchesProvider =
    scope.providerId === ALL_FILTER_VALUE ||
    queueRow.provider_id === scope.providerId;
  const matchesBillingCycle =
    scope.billingCycleId === ALL_FILTER_VALUE ||
    queueRow.billing_cycle_id === scope.billingCycleId;
  const matchesCurrency =
    scope.currencyIds.length === 0 ||
    scope.currencyIds.includes(queueRow.provider_currency_id);
  return matchesProvider && matchesBillingCycle && matchesCurrency;
}

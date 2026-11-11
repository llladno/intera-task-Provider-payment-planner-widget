import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import type { IFilterOption, IFilterOptions } from '@planner/model/types';

const FILTER_NAME_LOCALE = 'ru';

function fallbackName(id: number): string {
  return `#${id}`;
}

function toSortedOptions(namesById: Map<number, string>): IFilterOption[] {
  return Array.from(namesById, ([id, name]) => ({ id, name })).sort(
    (firstOption, secondOption) =>
      firstOption.name.localeCompare(secondOption.name, FILTER_NAME_LOCALE),
  );
}

/** Distinct providers, billing cycles and currencies of the loaded rows, sorted by name. */
export function collectFilterOptions(
  queueRows: readonly IProviderPaymentQueueRow[],
): IFilterOptions {
  const providerNames = new Map<number, string>();
  const billingCycleNames = new Map<number, string>();
  const currencyNames = new Map<number, string>();
  for (const queueRow of queueRows) {
    providerNames.set(
      queueRow.provider_id,
      queueRow.provider_name ?? fallbackName(queueRow.provider_id),
    );
    billingCycleNames.set(
      queueRow.billing_cycle_id,
      queueRow.billing_cycle_name ?? fallbackName(queueRow.billing_cycle_id),
    );
    currencyNames.set(
      queueRow.provider_currency_id,
      queueRow.provider_currency_name ??
        fallbackName(queueRow.provider_currency_id),
    );
  }
  return {
    providers: toSortedOptions(providerNames),
    billingCycles: toSortedOptions(billingCycleNames),
    currencies: toSortedOptions(currencyNames),
  };
}

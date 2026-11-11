import { describe, expect, it } from 'vitest';
import mockData from '@/data/mock-payment-queue.json';
import type { IProviderPaymentQueueRow } from '@/types/provider-payment-queue';
import { collectFilterOptions } from '@planner/model/filter-options/collect-filter-options';

const queueRows = mockData as IProviderPaymentQueueRow[];

describe('collectFilterOptions', () => {
  it('lists distinct providers, billing cycles and currencies sorted by name', () => {
    const options = collectFilterOptions(queueRows);
    expect(options.providers).toHaveLength(6);
    expect(options.currencies.map((currency) => currency.name)).toEqual([
      'EUR',
      'GBP',
      'RUB',
      'USD',
    ]);
    const providerNames = options.providers.map((provider) => provider.name);
    expect(providerNames).toEqual(
      [...providerNames].sort((first, second) => first.localeCompare(second, 'ru')),
    );
    expect(options.billingCycles.length).toBeGreaterThan(0);
  });

  it('falls back to the id when a name is missing', () => {
    const nameless = {
      ...queueRows[0],
      provider_name: undefined,
      provider_currency_name: undefined,
      billing_cycle_name: undefined,
    } as unknown as IProviderPaymentQueueRow;
    const options = collectFilterOptions([nameless]);
    expect(options.providers).toEqual([
      { id: nameless.provider_id, name: `#${nameless.provider_id}` },
    ]);
    expect(options.currencies[0].name).toBe(`#${nameless.provider_currency_id}`);
    expect(options.billingCycles[0].name).toBe(`#${nameless.billing_cycle_id}`);
  });

  it('returns empty lists for no rows', () => {
    expect(collectFilterOptions([])).toEqual({
      providers: [],
      billingCycles: [],
      currencies: [],
    });
  });
});

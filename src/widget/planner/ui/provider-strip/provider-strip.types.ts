import type { IProviderCurrencyBreakdownItem } from '@planner/model/types';

export interface IProviderStripProps {
  /** Providers of ONE currency, sorted by amount. */
  items: readonly IProviderCurrencyBreakdownItem[];
}
